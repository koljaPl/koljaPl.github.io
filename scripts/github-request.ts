import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
/** Server/build only. Prefer the workflow token; local gh uses its own credential store. */
export async function githubRequest(path: string): Promise<unknown> {
  if (!path.startsWith("/")) throw new Error("Invalid GitHub API path");
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "koljapl-portfolio-build",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(20000),
  });
  if (response.ok) return response.json();
  if (!token && response.status === 403) {
    // Optional existing local login; no credential extraction or logging.
    try {
      return JSON.parse(
        (
          await run("gh", ["api", path], {
            timeout: 20000,
            maxBuffer: 10_000_000,
          })
        ).stdout,
      );
    } catch {
      /* Keep the normal cache fallback. */
    }
  }
  throw new Error(`GitHub API returned ${response.status}.`);
}

/** Authenticated read-only GraphQL; credentials stay in the build environment. */
export async function githubGraphql(
  query: string,
  variables: Record<string, string>,
): Promise<unknown> {
  if (!query.trimStart().startsWith("query "))
    throw new Error("Only read-only queries are supported");
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    const args = ["api", "graphql", "-f", `query=${query}`];
    for (const [key, value] of Object.entries(variables))
      args.push("-f", `${key}=${value}`);
    return JSON.parse(
      (await run("gh", args, { timeout: 20000, maxBuffer: 1_000_000 })).stdout,
    );
  }
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}.`);
  return response.json();
}
