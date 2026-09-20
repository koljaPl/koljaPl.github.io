import { githubRequest } from "./github-request";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  writeFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { completePages, githubStars } from "./account-providers";
import {
  validateEvidence,
  type RepositoryEvidence,
  type ObservedCount,
} from "../src/data/evidence";
import { githubRepositories } from "../src/data/github-repositories";
const run = promisify(execFile);
const root = resolve("artifacts/repository-cache");
const cachePath = resolve("src/data/generated/evidence.json");
const scope =
  "Owned public non-fork repositories, default branches; all authors' repository source, not individually authored lines.";
export const excludedDirectories =
  ".git,node_modules,vendor,dist,build,target,.venv,venv,__pycache__,coverage,generated,third_party,third-party,external,dependencies";
async function countPlainSource(directory: string): Promise<number> {
  const { stdout } = await run(
    "perl",
    [
      resolve("scripts/tools/cloc-2.10.pl"),
      directory,
      "--json",
      "--quiet",
      "--include-lang=C,C++,C/C++ Header,C#,Astro,Go,Python,Java,JavaScript,TypeScript,JSX,Vuejs Component,HTML,CSS,SCSS,Sass,Rust,Swift,Kotlin,Scala,Ruby,PHP,Perl,Bourne Shell,Bourne Again Shell,SQL,Lua,Dart,R,Julia,Haskell,OCaml,Pascal,Scratch,Assembly,Fortran 90",
      "--force-lang=C++,tpp",
      `--exclude-dir=${excludedDirectories}`,
      "--not-match-f=(\\.min\\.(js|css)$|\\.generated\\.|_generated\\.|package-lock\\.json$|pnpm-lock\\.yaml$)",
      "--timeout=0",
      "--skip-uniqueness",
    ],
    { timeout: 120_000, maxBuffer: 8_000_000 },
  );
  const data = JSON.parse(stdout) as {
    SUM?: { code?: number };
    header?: { cloc_url?: string };
  };
  const n = data.SUM?.code ?? 0;
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("Invalid source count");
  return n;
}
export async function countSource(directory: string): Promise<number> {
  const temporary = await mkdtemp(resolve(tmpdir(), "portfolio-notebooks-"));
  let index = 0;
  try {
    const walk = async (path: string): Promise<void> => {
      for (const entry of await readdir(path, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) continue;
        const file = resolve(path, entry.name);
        if (entry.isDirectory()) {
          if (!excludedDirectories.split(",").includes(entry.name))
            await walk(file);
        } else if (entry.name.endsWith(".ipynb")) {
          const notebook = JSON.parse(await readFile(file, "utf8")) as {
            metadata?: {
              language_info?: { name?: string };
              kernelspec?: { language?: string };
            };
            cells?: { cell_type: string; source: string | string[] }[];
          };
          if (!Array.isArray(notebook.cells))
            throw new Error("Malformed notebook");
          const language =
            notebook.metadata?.language_info?.name ??
            notebook.metadata?.kernelspec?.language ??
            "python";
          const extension: Record<string, string> = {
            python: "py",
            julia: "jl",
            r: "R",
            javascript: "js",
            typescript: "ts",
            scala: "scala",
          };
          if (!extension[language.toLowerCase()])
            throw new Error("Unknown notebook source language");
          const cells = notebook.cells
            .filter((cell) => cell.cell_type === "code")
            .map((cell) => {
              if (typeof cell.source === "string") return cell.source;
              if (
                Array.isArray(cell.source) &&
                cell.source.every((line) => typeof line === "string")
              )
                return cell.source.join("");
              throw new Error("Malformed notebook source");
            });
          await writeFile(
            resolve(
              temporary,
              `${index++}.${extension[language.toLowerCase()]}`,
            ),
            cells.join("\n"),
          );
        }
      }
    };
    await walk(directory);
    return (
      (await countPlainSource(directory)) +
      (index ? await countPlainSource(temporary) : 0)
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
export function countAuthoredCommits(
  items: unknown[],
  handle: string,
  since: string,
  until: string,
): number {
  const ids = new Set<string>();
  for (const raw of items) {
    const item = raw as {
      sha?: string;
      author?: { login?: string } | null;
      commit?: { committer?: { date?: string } };
    };
    if (
      !item.sha ||
      !item.commit?.committer?.date ||
      !Number.isFinite(Date.parse(item.commit.committer.date))
    )
      throw new Error("Invalid commit");
    const date = Date.parse(item.commit.committer.date);
    if (
      item.author?.login?.toLowerCase() === handle.toLowerCase() &&
      date >= Date.parse(since) &&
      date <= Date.parse(until)
    )
      ids.add(item.sha);
  }
  return ids.size;
}
const request = githubRequest;
async function repositoryEvidence(
  owner: string,
  name: string,
  branch: string,
  previous?: RepositoryEvidence,
): Promise<RepositoryEvidence> {
  if (![owner, name].every((x) => /^[\w.-]+$/.test(x)))
    throw new Error("Invalid repository coordinate");
  const refs = (
    await run(
      "git",
      ["ls-remote", "--heads", `https://github.com/${owner}/${name}.git`],
      { timeout: 20000 },
    )
  ).stdout.trim();
  if (!refs) {
    const observedAt = new Date().toISOString();
    return {
      revision: null,
      defaultBranch: branch,
      counter: "cloc 2.10",
      commits: {
        value: 0,
        observedAt,
        scope: "Empty public repository; no branch commits.",
      },
      code: {
        value: 0,
        observedAt,
        scope: "Empty public repository; no source files.",
      },
    };
  }
  const remoteRevision = refs
    .split("\n")
    .find((line) => line.split(/\s+/)[1] === `refs/heads/${branch}`)
    ?.split(/\s+/)[0];
  if (!remoteRevision) throw new Error("Default branch unavailable");
  if (
    previous?.revision === remoteRevision &&
    previous.code.scope.includes("native Astro")
  )
    return previous;
  const directory = resolve(root, `${owner}--${name}`);
  await mkdir(root, { recursive: true });
  // Reuse local objects when counting rules change, without another network fetch.
  let haveRevision = false;
  try {
    await run(
      "git",
      ["-C", directory, "cat-file", "-e", `${remoteRevision}^{commit}`],
      { timeout: 10000 },
    );
    haveRevision = true;
  } catch {
    /* First download or a new revision. */
  }
  if (!haveRevision) {
    try {
      await run(
        "git",
        ["-C", directory, "fetch", "--quiet", "origin", branch],
        { timeout: 120000 },
      );
    } catch {
      await rm(directory, { recursive: true, force: true });
      await run(
        "git",
        [
          "clone",
          "--quiet",
          "--no-checkout",
          "--single-branch",
          "--branch",
          branch,
          `https://github.com/${owner}/${name}.git`,
          directory,
        ],
        { timeout: 120000 },
      );
    }
  }
  const git = async (...args: string[]) =>
    (
      await run("git", ["-C", directory, ...args], {
        timeout: 120_000,
        maxBuffer: 8_000_000,
      })
    ).stdout.trim();
  const revision = remoteRevision;
  if ((await git("rev-parse", "--is-shallow-repository")) !== "false")
    throw new Error("Incomplete repository history");
  const commits = Number(await git("rev-list", "--count", revision));
  await git(
    "-c",
    "core.hooksPath=/dev/null",
    "checkout",
    "--quiet",
    "--detach",
    revision,
  );
  const code = await countSource(directory);
  const observedAt = new Date().toISOString();
  return {
    revision,
    defaultBranch: branch,
    counter: "cloc 2.10",
    commits: {
      value: commits,
      observedAt,
      scope:
        "All commits reachable from this default-branch revision, including merges and all authors.",
    },
    code: {
      value: code,
      observedAt,
      scope:
        "Physical source lines counted in each physical file, including native Astro components, tests, examples and parsed notebook code cells; excluding blanks, comments, dependencies, generated files, documentation and notebook outputs.",
    },
  };
}
export async function main() {
  const prior = await readFile(cachePath, "utf8");
  const cache = validateEvidence(JSON.parse(prior));
  let repos: {
    name: string;
    default_branch: string;
    fork: boolean;
    private: boolean;
    owner: { login: string };
  }[] = [];
  try {
    const all = await completePages(async (page) => {
      const data = await request(
        `/users/koljaPl/repos?type=owner&per_page=100&page=${page}`,
      );
      if (!Array.isArray(data)) throw new Error("Invalid repository list");
      return data;
    }, 100);
    const user = (await request("/users/koljaPl")) as { public_repos?: number };
    if (!Number.isSafeInteger(user.public_repos))
      throw new Error("Missing repository total");
    githubStars(all, "koljaPl", user.public_repos);
    repos = all
      .map((raw) => {
        const r = raw as (typeof repos)[number];
        if (
          !r.name ||
          !r.default_branch ||
          r.private !== false ||
          r.owner?.login?.toLowerCase() !== "koljapl" ||
          typeof r.fork !== "boolean"
        )
          throw new Error("Invalid repository");
        return r;
      })
      .filter((r) => !r.fork);
  } catch {
    console.warn(
      "[evidence] Complete account inventory unavailable; retaining account totals.",
    );
  }
  const targets = new Map(repos.map((r) => [r.name, r.default_branch]));
  for (const r of githubRepositories)
    if (!targets.has(r.repository)) targets.set(r.repository, "main");
  const fresh = new Set<string>();
  for (const [name, branch] of targets) {
    const key = `koljaPl/${name}`;
    try {
      cache.repositories[key] = await repositoryEvidence(
        "koljaPl",
        name,
        branch,
        cache.repositories[key],
      );
      fresh.add(key);
      console.log(
        `[evidence] ${key}: ${cache.repositories[key]!.code.value} source lines`,
      );
    } catch {
      console.warn(
        `[evidence] ${key}: refresh unavailable; retaining prior evidence.`,
      );
    }
  }
  if (repos.length && repos.every((r) => fresh.has(`koljaPl/${r.name}`))) {
    const until = new Date().toISOString(),
      since = new Date(Date.parse(until) - 30 * 86400_000).toISOString();
    try {
      let total = 0;
      for (const r of repos) {
        const revision = cache.repositories[`koljaPl/${r.name}`]!.revision;
        if (!revision) continue;
        const commits = await completePages(async (page) => {
          const data = await request(
            `/repos/koljaPl/${r.name}/commits?sha=${revision}&author=koljaPl&since=${since}&until=${until}&per_page=100&page=${page}`,
          );
          if (!Array.isArray(data)) throw new Error("Invalid commit list");
          return data;
        }, 100);
        total += countAuthoredCommits(commits, "koljaPl", since, until);
      }
      const count = (value: number, definition: string): ObservedCount => ({
        value,
        observedAt: until,
        scope: definition,
      });
      cache.accounts["github-koljapl"] = {
        monthlyCommits: count(
          total,
          "Commits attributed by GitHub to koljaPl in the preceding 30 days, across owned public non-fork default branches; commit date is the committer date.",
        ),
        code: count(
          repos.reduce(
            (n, r) => n + cache.repositories[`koljaPl/${r.name}`]!.code.value,
            0,
          ),
          scope,
        ),
        windowStart: since,
        windowEnd: until,
        repositories: repos.map((r) => `koljaPl/${r.name}`),
        revisions: Object.fromEntries(
          repos.map((r) => [
            `koljaPl/${r.name}`,
            cache.repositories[`koljaPl/${r.name}`]!.revision,
          ]),
        ),
      };
    } catch {
      console.warn(
        "[evidence] Complete monthly enumeration unavailable; retaining dated account totals.",
      );
    }
  }
  const next = JSON.stringify(validateEvidence(cache), null, 2) + "\n";
  if (next !== prior) {
    const tmp = cachePath + `.${process.pid}.tmp`;
    await writeFile(tmp, next);
    await rename(tmp, cachePath);
  }
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
)
  main().catch(() =>
    console.warn(
      "[evidence] Refresh failed; deployment retains checked-in evidence.",
    ),
  );
