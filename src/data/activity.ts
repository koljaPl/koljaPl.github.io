import { record } from "./account-cache";
import type { AccountConfig } from "./accounts";

export interface ActivityDay {
  date: string;
  count: number;
}
export interface ActivitySnapshot {
  platform: "github" | "leetcode";
  handle: string;
  source: string;
  metric: "contributions" | "submissions";
  observedAt: string;
  start: string;
  end: string;
  days: ActivityDay[];
}
export interface ActivityCache {
  version: 1;
  accounts: Record<string, ActivitySnapshot>;
}
export const DAY_MS = 86_400_000;
export function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function activityWindow(observedAt: string): {
  start: string;
  end: string;
  dates: string[];
} {
  if (!Number.isFinite(Date.parse(observedAt)))
    throw new Error("Invalid observation date");
  const end = new Date(observedAt).toISOString().slice(0, 10);
  const startTime = Date.parse(end) - 364 * DAY_MS;
  const dates = Array.from({ length: 365 }, (_, i) =>
    new Date(startTime + i * DAY_MS).toISOString().slice(0, 10),
  );
  return { start: dates[0]!, end, dates };
}
export function validateActivity(value: unknown): ActivitySnapshot {
  if (
    !record(value) ||
    !["github", "leetcode"].includes(String(value.platform)) ||
    typeof value.handle !== "string" ||
    !value.handle.trim() ||
    typeof value.source !== "string" ||
    typeof value.observedAt !== "string" ||
    !validDate(value.start) ||
    !validDate(value.end) ||
    !Array.isArray(value.days)
  )
    throw new Error("Invalid activity snapshot");
  const platform = value.platform as ActivitySnapshot["platform"];
  const expectedMetric =
    platform === "github" ? "contributions" : "submissions";
  const url = new URL(value.source);
  if (
    url.protocol !== "https:" ||
    url.hostname !== `${platform}.com` ||
    url.username ||
    url.password ||
    value.metric !== expectedMetric
  )
    throw new Error("Invalid activity source or metric");
  const window = activityWindow(value.observedAt);
  if (
    value.start !== window.start ||
    value.end !== window.end ||
    value.days.length !== 365
  )
    throw new Error("Incomplete activity window");
  let total = 0;
  const days = value.days.map((day, i) => {
    if (
      !record(day) ||
      day.date !== window.dates[i] ||
      typeof day.count !== "number" ||
      !Number.isSafeInteger(day.count) ||
      day.count < 0
    )
      throw new Error("Invalid, duplicate or missing activity day");
    total += day.count;
    return { date: day.date as string, count: day.count };
  });
  if (!Number.isSafeInteger(total)) throw new Error("Invalid activity total");
  return {
    platform,
    handle: value.handle,
    source: value.source,
    metric: expectedMetric,
    observedAt: value.observedAt,
    start: value.start,
    end: value.end,
    days,
  };
}
export function validateActivityCache(value: unknown): ActivityCache {
  if (!record(value) || value.version !== 1 || !record(value.accounts))
    throw new Error("Invalid activity cache");
  return {
    version: 1,
    accounts: Object.fromEntries(
      Object.entries(value.accounts).map(([id, snapshot]) => {
        if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid account ID");
        return [id, validateActivity(snapshot)];
      }),
    ),
  };
}
export function activityFor(
  account: AccountConfig,
  cache: ActivityCache,
): ActivitySnapshot | undefined {
  const snapshot = cache.accounts[account.id];
  return snapshot?.platform === account.platform &&
    snapshot.handle === account.handle &&
    snapshot.source === account.url
    ? snapshot
    : undefined;
}
