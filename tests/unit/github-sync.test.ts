import assert from "node:assert/strict";
import test from "node:test";
import {
  mergeMetadata,
  parseGitHubResponse,
  validateCache,
  validateRepositoryConfig,
} from "../../scripts/sync-github";
import type { GitHubRepositoryConfig } from "../../src/data/github-repositories";
import type { GitHubMetadataCache } from "../../src/data/types";

const repository: GitHubRepositoryConfig = {
  key: "example",
  owner: "koljaPl",
  repository: "example",
};
const cached: GitHubMetadataCache = {
  version: 1,
  repositories: {
    example: {
      repositoryUrl: "https://github.com/koljaPl/example",
      stars: 4,
      primaryLanguage: "TypeScript",
      updatedAt: "2026-08-31T12:00:00Z",
    },
  },
};

test("validates and normalizes a GitHub API response", () => {
  assert.deepEqual(
    parseGitHubResponse({
      html_url: "https://github.com/koljaPl/example",
      stargazers_count: 8,
      language: "Rust",
      updated_at: "2026-09-01T08:00:00Z",
    }),
    {
      repositoryUrl: "https://github.com/koljaPl/example",
      stars: 8,
      primaryLanguage: "Rust",
      updatedAt: "2026-09-01T08:00:00Z",
    },
  );
});

test("rejects incomplete or corrupted cache records", () => {
  assert.throws(() =>
    validateCache({
      version: 1,
      repositories: {
        example: {
          repositoryUrl: "http://example.com/not-github",
          stars: -1,
          primaryLanguage: null,
          updatedAt: "not-a-date",
        },
      },
    }),
  );
});

test("keeps last-known-good metadata when a refresh is unavailable", () => {
  assert.deepEqual(mergeMetadata([repository], cached, new Map()), cached);
});

test("prefers validated fresh metadata over the cache", () => {
  const fresh = new Map([
    [
      "example",
      {
        repositoryUrl: "https://github.com/koljaPl/example",
        stars: 9,
        primaryLanguage: "Rust",
        updatedAt: "2026-09-01T09:00:00Z",
      },
    ],
  ]);
  assert.equal(
    mergeMetadata([repository], cached, fresh).repositories.example?.stars,
    9,
  );
});

test("rejects duplicate repository keys and coordinates", () => {
  assert.throws(() => validateRepositoryConfig([repository, repository]));
});
