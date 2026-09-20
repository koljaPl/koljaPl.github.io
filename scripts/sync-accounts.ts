import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  accounts,
  type AccountConfig,
  type AccountMetrics,
} from "../src/data/accounts";
import {
  mergeAccountCache,
  snapshotFor,
  validateAccountCache,
  validateSnapshot,
  type AccountCache,
  type AccountSnapshot,
} from "../src/data/account-cache";
import { fetchAccount } from "./account-providers";

export async function refreshAccounts(
  config: readonly AccountConfig[],
  cache: AccountCache,
  fetcher: (account: AccountConfig) => Promise<AccountMetrics>,
  report: (message: string) => void = console.warn,
): Promise<AccountCache> {
  const ids = new Set<string>();
  const fresh = new Map<string, AccountSnapshot>();
  for (const account of config) {
    if (!/^[a-z0-9-]+$/.test(account.id) || ids.has(account.id))
      throw new Error("Invalid or duplicate account ID.");
    ids.add(account.id);
    try {
      const metrics = await fetcher(account);
      fresh.set(
        account.id,
        validateSnapshot({
          platform: account.platform,
          handle: account.handle,
          profileUrl: account.url,
          observedAt: new Date().toISOString(),
          metrics,
        }),
      );
    } catch (error) {
      // Fetch errors can contain request URLs; never log credentials or raw response bodies.
      const reason =
        error instanceof Error &&
        /^(Public (endpoint|profile) returned HTTP \d+\.|YOUTUBE_API_KEY is not configured\.)$/.test(
          error.message,
        )
          ? error.message
          : "Statistics could not be verified.";
      report(
        `[accounts] ${account.id}: ${reason} ${snapshotFor(account, cache) ? "Keeping the dated snapshot." : "Profile link remains available."}`,
      );
    }
  }
  return mergeAccountCache(config, cache, fresh);
}
async function main(): Promise<void> {
  const path = new URL("../src/data/generated/accounts.json", import.meta.url);
  const previous = await readFile(path, "utf8");
  const cache = validateAccountCache(JSON.parse(previous) as unknown);
  const next = `${JSON.stringify(await refreshAccounts(accounts, cache, fetchAccount), null, 2)}\n`;
  if (previous === next) return;
  const temporary = new URL(`./accounts.${process.pid}.tmp`, path);
  try {
    await writeFile(temporary, next, "utf8");
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
  console.log("Updated account snapshots.");
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  main().catch(() => {
    console.error(
      "Account cache could not be loaded or written; inspect the checked-in cache.",
    );
    process.exitCode = 1;
  });
}
