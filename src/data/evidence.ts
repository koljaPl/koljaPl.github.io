export interface ObservedCount {
  value: number;
  observedAt: string;
  scope: string;
}
export interface RepositoryEvidence {
  revision: string | null;
  defaultBranch: string;
  commits: ObservedCount;
  code: ObservedCount;
  counter: "cloc 2.10";
}
export interface EvidenceCache {
  version: 1;
  repositories: Record<string, RepositoryEvidence>;
  accounts: Record<
    string,
    {
      monthlyCommits: ObservedCount;
      code: ObservedCount;
      windowStart: string;
      windowEnd: string;
      repositories: string[];
      revisions?: Record<string, string | null>;
    }
  >;
}
export function validateEvidence(value: unknown): EvidenceCache {
  const cache = value as EvidenceCache;
  if (!cache || cache.version !== 1 || !cache.repositories || !cache.accounts)
    throw new Error("Invalid evidence cache");
  const count = (x: ObservedCount) => {
    if (
      !x ||
      !Number.isSafeInteger(x.value) ||
      x.value < 0 ||
      !Number.isFinite(Date.parse(x.observedAt)) ||
      !x.scope
    )
      throw new Error("Invalid observed count");
  };
  for (const item of Object.values(cache.repositories)) {
    if (
      (item.revision !== null && !/^[a-f0-9]{40}$/.test(item.revision)) ||
      !item.defaultBranch ||
      item.counter !== "cloc 2.10"
    )
      throw new Error("Invalid revision evidence");
    count(item.commits);
    count(item.code);
  }
  for (const item of Object.values(cache.accounts)) {
    count(item.monthlyCommits);
    count(item.code);
    if (
      !Array.isArray(item.repositories) ||
      !Number.isFinite(Date.parse(item.windowStart)) ||
      !Number.isFinite(Date.parse(item.windowEnd)) ||
      Date.parse(item.windowStart) > Date.parse(item.windowEnd) ||
      new Set(item.repositories).size !== item.repositories.length ||
      !item.repositories.every(
        (repo) => typeof repo === "string" && /^[\w.-]+\/[\w.-]+$/.test(repo),
      )
    )
      throw new Error("Invalid account evidence");
    if (
      item.revisions &&
      (Object.keys(item.revisions).length !== item.repositories.length ||
        item.repositories.some(
          (repo) =>
            !(repo in item.revisions!) ||
            (item.revisions![repo] !== null &&
              !/^[a-f0-9]{40}$/.test(item.revisions![repo]!)),
        ))
    )
      throw new Error("Invalid account revisions");
  }
  return cache;
}
