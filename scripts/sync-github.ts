import { githubRequest } from "./github-request";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { githubRepositories } from "../src/data/github-repositories";
import type { GitHubRepositoryConfig } from "../src/data/github-repositories";
import type {
  GitHubMetadataCache,
  GitHubRepositoryMetadata,
} from "../src/data/types";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = resolve(repositoryRoot, "src/data/generated/github.json");
const identifierPattern = /^[A-Za-z0-9_.-]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function isGitHubUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}

export function validateMetadata(
  value: unknown,
  context = "metadata",
): GitHubRepositoryMetadata {
  if (
    !isRecord(value) ||
    typeof value.repositoryUrl !== "string" ||
    !isGitHubUrl(value.repositoryUrl) ||
    !Number.isInteger(value.stars) ||
    (value.stars as number) < 0 ||
    !(
      value.primaryLanguage === null ||
      (typeof value.primaryLanguage === "string" &&
        value.primaryLanguage.length > 0)
    ) ||
    typeof value.updatedAt !== "string" ||
    !isValidDate(value.updatedAt)
  ) {
    throw new Error(`Invalid GitHub repository ${context}.`);
  }

  return {
    repositoryUrl: value.repositoryUrl,
    stars: value.stars as number,
    primaryLanguage: value.primaryLanguage as string | null,
    updatedAt: value.updatedAt,
  };
}

export function validateCache(value: unknown): GitHubMetadataCache {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isRecord(value.repositories)
  ) {
    throw new Error("The checked-in GitHub metadata cache is invalid.");
  }

  const repositories = Object.fromEntries(
    Object.entries(value.repositories)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, metadata]) => {
        if (!identifierPattern.test(key)) {
          throw new Error(`Invalid GitHub cache key: ${key}`);
        }
        return [key, validateMetadata(metadata, `cache entry '${key}'`)];
      }),
  );

  return { version: 1, repositories };
}

export function validateRepositoryConfig(
  repositories: readonly GitHubRepositoryConfig[],
): void {
  const keys = new Set<string>();
  const coordinates = new Set<string>();

  for (const repository of repositories) {
    if (
      !identifierPattern.test(repository.key) ||
      !identifierPattern.test(repository.owner) ||
      !identifierPattern.test(repository.repository)
    ) {
      throw new Error(
        `Invalid GitHub repository configuration: ${repository.key || "<empty key>"}`,
      );
    }

    const coordinate =
      `${repository.owner}/${repository.repository}`.toLowerCase();
    if (keys.has(repository.key)) {
      throw new Error(`Duplicate GitHub repository key: ${repository.key}`);
    }
    if (coordinates.has(coordinate)) {
      throw new Error(`Duplicate GitHub repository: ${coordinate}`);
    }
    keys.add(repository.key);
    coordinates.add(coordinate);
  }
}

export function parseGitHubResponse(value: unknown): GitHubRepositoryMetadata {
  if (!isRecord(value)) {
    throw new Error("GitHub returned an invalid repository response.");
  }

  return validateMetadata(
    {
      repositoryUrl: value.html_url,
      stars: value.stargazers_count,
      primaryLanguage: value.language,
      updatedAt: value.updated_at,
    },
    "API response",
  );
}

export function mergeMetadata(
  repositories: readonly GitHubRepositoryConfig[],
  cached: GitHubMetadataCache,
  fresh: ReadonlyMap<string, GitHubRepositoryMetadata>,
): GitHubMetadataCache {
  const merged: Record<string, GitHubRepositoryMetadata> = {};

  for (const repository of [...repositories].sort((left, right) =>
    left.key.localeCompare(right.key),
  )) {
    const metadata =
      fresh.get(repository.key) ?? cached.repositories[repository.key];
    if (metadata) merged[repository.key] = metadata;
  }

  return { version: 1, repositories: merged };
}

async function fetchRepositoryMetadata(
  repository: GitHubRepositoryConfig,
): Promise<GitHubRepositoryMetadata> {
  return parseGitHubResponse(
    await githubRequest(`/repos/${repository.owner}/${repository.repository}`),
  );
}

function serializeCache(cache: GitHubMetadataCache): string {
  return `${JSON.stringify(cache, null, 2)}\n`;
}

async function writeCacheIfChanged(
  existingText: string,
  cache: GitHubMetadataCache,
): Promise<boolean> {
  const nextText = serializeCache(cache);
  if (existingText === nextText) return false;

  const temporaryPath = `${cachePath}.${process.pid}.tmp`;
  try {
    await writeFile(temporaryPath, nextText, "utf8");
    await rename(temporaryPath, cachePath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
  return true;
}

export async function main(): Promise<void> {
  const existingText = await readFile(cachePath, "utf8");
  const cached = validateCache(JSON.parse(existingText) as unknown);
  validateRepositoryConfig(githubRepositories);

  if (githubRepositories.length === 0) {
    console.log(
      "No GitHub repositories are configured; keeping the valid checked-in cache.",
    );
    return;
  }

  const fresh = new Map<string, GitHubRepositoryMetadata>();
  await Promise.all(
    githubRepositories.map(async (repository) => {
      try {
        fresh.set(repository.key, await fetchRepositoryMetadata(repository));
      } catch (error) {
        const fallback = cached.repositories[repository.key];
        const reason =
          error instanceof Error ? error.message : "Unknown error.";
        console.warn(
          `[github-sync] ${repository.owner}/${repository.repository}: ${reason} ${fallback ? "Using cached metadata." : "No cached metadata is available yet."}`,
        );
      }
    }),
  );

  const merged = mergeMetadata(githubRepositories, cached, fresh);
  const changed = await writeCacheIfChanged(existingText, merged);
  console.log(
    changed
      ? `Updated ${cachePath}.`
      : "GitHub metadata cache is already current.",
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  main().catch((error: unknown) => {
    console.error(
      `[github-sync] ${error instanceof Error ? error.message : "Unexpected failure."}`,
    );
    process.exitCode = 1;
  });
}
