import { platforms, metricLabels, platformDefinitions } from "./accounts";
import type {
  AccountConfig,
  AccountMetrics,
  AccountPlatform,
  MetricKey,
} from "./accounts";

export interface AccountSnapshot {
  platform: AccountPlatform;
  handle: string;
  profileUrl: string;
  observedAt: string;
  metrics: AccountMetrics;
}
export interface AccountCache {
  version: 1;
  accounts: Record<string, AccountSnapshot>;
}
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function validateSnapshot(value: unknown): AccountSnapshot {
  if (
    !record(value) ||
    !platforms.includes(value.platform as AccountPlatform) ||
    typeof value.handle !== "string" ||
    !value.handle.trim() ||
    typeof value.profileUrl !== "string" ||
    typeof value.observedAt !== "string" ||
    !Number.isFinite(Date.parse(value.observedAt)) ||
    !record(value.metrics)
  )
    throw new Error("Invalid account snapshot.");
  const url = new URL(value.profileUrl);
  const hosts: Record<AccountPlatform, string> = {
    codeforces: "codeforces.com",
    eolymp: "eolymp.com",
    atcoder: "atcoder.jp",
    leetcode: "leetcode.com",
    github: "github.com",
    youtube: "www.youtube.com",
  };
  const platform = value.platform as AccountPlatform;
  if (
    url.protocol !== "https:" ||
    url.hostname !== hosts[platform] ||
    url.username ||
    url.password
  )
    throw new Error("Invalid profile source URL.");
  const supported = [
    ...platformDefinitions[platform].headline,
    ...platformDefinitions[platform].details,
  ];
  const metrics: AccountMetrics = {};
  for (const [key, metric] of Object.entries(value.metrics)) {
    if (!(key in metricLabels) || !supported.includes(key as MetricKey))
      throw new Error(`Unexpected metric ${key}.`);
    if (key === "rank") {
      if (typeof metric !== "string" || !metric.trim() || metric.length > 80)
        throw new Error("Invalid rank.");
    } else if (
      typeof metric !== "number" ||
      !Number.isSafeInteger(metric) ||
      (key !== "rating" && key !== "maxRating" && metric < 0)
    )
      throw new Error(`Invalid numeric metric ${key}.`);
    metrics[key as MetricKey] = metric as number | string;
  }
  if (!Object.keys(metrics).length)
    throw new Error("No public statistics found.");
  return {
    platform,
    handle: value.handle,
    profileUrl: value.profileUrl,
    observedAt: value.observedAt,
    metrics,
  };
}
export function validateAccountCache(value: unknown): AccountCache {
  if (!record(value) || value.version !== 1 || !record(value.accounts))
    throw new Error("Invalid account cache.");
  const entries = Object.entries(value.accounts).map(([id, snapshot]) => {
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid account ID.");
    return [id, validateSnapshot(snapshot)];
  });
  return { version: 1, accounts: Object.fromEntries(entries) };
}
export function snapshotFor(
  account: AccountConfig,
  cache: AccountCache,
): AccountSnapshot | undefined {
  const snapshot = cache.accounts[account.id];
  return snapshot?.platform === account.platform &&
    snapshot.handle === account.handle &&
    snapshot.profileUrl === account.url
    ? snapshot
    : undefined;
}
export function mergeAccountCache(
  config: readonly AccountConfig[],
  cached: AccountCache,
  fresh: ReadonlyMap<string, AccountSnapshot>,
): AccountCache {
  const entries = config.flatMap((account) => {
    const next = fresh.get(account.id);
    const snapshot = next
      ? snapshotFor(account, {
          version: 1,
          accounts: { [account.id]: validateSnapshot(next) },
        })
      : snapshotFor(account, cached);
    return snapshot ? [[account.id, snapshot]] : [];
  });
  return { version: 1, accounts: Object.fromEntries(entries) };
}
