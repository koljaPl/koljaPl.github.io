import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { accounts, type AccountConfig } from "../src/data/accounts";
import {
  activityFor,
  validateActivity,
  validateActivityCache,
  type ActivityCache,
  type ActivitySnapshot,
} from "../src/data/activity";
import { fetchActivity } from "./activity-providers";

export async function refreshActivity(
  config: readonly AccountConfig[],
  cached: ActivityCache,
  fetcher: (
    account: AccountConfig,
    observedAt: string,
  ) => Promise<ActivitySnapshot> = fetchActivity,
  observedAt = new Date().toISOString(),
  report: (message: string) => void = console.warn,
): Promise<ActivityCache> {
  const next: ActivityCache = { version: 1, accounts: {} };
  const ids = new Set<string>();
  for (const account of config) {
    if (ids.has(account.id)) throw new Error("Duplicate account ID");
    ids.add(account.id);
    if (account.platform !== "github" && account.platform !== "leetcode")
      continue;
    const previous = activityFor(account, cached);
    if (previous) next.accounts[account.id] = previous;
    try {
      const fresh = validateActivity(await fetcher(account, observedAt));
      const matching = activityFor(account, {
        version: 1,
        accounts: { [account.id]: fresh },
      });
      if (!matching) throw new Error("Wrong activity identity");
      next.accounts[account.id] = matching;
    } catch {
      report(
        `[activity] ${account.id}: refresh unavailable; ${previous ? "retaining dated calendar" : "profile link retained"}.`,
      );
    }
  }
  return validateActivityCache(next);
}
async function main() {
  const path = new URL("../src/data/generated/activity.json", import.meta.url);
  const previous = await readFile(path, "utf8");
  const next =
    JSON.stringify(
      await refreshActivity(
        accounts,
        validateActivityCache(JSON.parse(previous)),
      ),
      null,
      2,
    ) + "\n";
  if (next === previous) return;
  const temp = new URL(`./activity.${process.pid}.tmp`, path);
  try {
    await writeFile(temp, next);
    await rename(temp, path);
  } finally {
    await unlink(temp).catch(() => undefined);
  }
  console.log("Updated activity snapshots.");
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
)
  main().catch(() => {
    console.error("Activity cache could not be loaded or written.");
    process.exitCode = 1;
  });
