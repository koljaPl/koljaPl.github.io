export interface GitHubRepositoryConfig {
  key: string;
  owner: string;
  repository: string;
}

/**
 * Add only repositories that Nicklas has explicitly chosen to feature.
 * `key` must match a project's `repositoryKey` in its content entry.
 */
export const githubRepositories: readonly GitHubRepositoryConfig[] = [
  { key: "tppl", owner: "koljaPl", repository: "pseudo-programming-language" },
  { key: "physics-engine", owner: "koljaPl", repository: "2-squares-collapse" },
  { key: "algorithms", owner: "koljaPl", repository: "algorithms" },
  { key: "machine-learning", owner: "koljaPl", repository: "ml-problems" },
];
