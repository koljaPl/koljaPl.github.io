import evidenceRaw from "./generated/evidence.json" with { type: "json" };
import { validateEvidence } from "./evidence";
import generated from "./generated/accounts.json" with { type: "json" };
import {
  accounts,
  metricLabels,
  platformDefinitions,
  type MetricKey,
} from "./accounts";
import { snapshotFor, validateAccountCache } from "./account-cache";

const cache = validateAccountCache(generated);
const evidence = validateEvidence(evidenceRaw);
const numbers = new Intl.NumberFormat("en-US");
export const accountStats = accounts.map((account) => {
  const definition = platformDefinitions[account.platform];
  const snapshot = snapshotFor(account, cache);
  const entries = (keys: readonly MetricKey[]) =>
    keys.flatMap((key) => {
      const value = snapshot?.metrics[key];
      const label =
        key === "rating" && account.platform === "atcoder"
          ? "Algorithm rating"
          : key === "rating" && account.platform === "leetcode"
            ? "Contest rating"
            : metricLabels[key];
      return value === undefined
        ? []
        : [
            {
              key,
              label,
              value: typeof value === "number" ? numbers.format(value) : value,
            },
          ];
    });
  return {
    ...account,
    ...definition,
    snapshot,
    evidence: evidence.accounts[account.id],
    headline: [
      ...(evidence.accounts[account.id]
        ? [
            {
              key: "monthlyCommits",
              label: "Commits · 30 days",
              value: numbers.format(
                evidence.accounts[account.id]!.monthlyCommits.value,
              ),
            },
            {
              key: "code",
              label: "Repository source lines",
              value: numbers.format(evidence.accounts[account.id]!.code.value),
            },
          ]
        : []),
      ...entries(definition.headline),
    ],
    details: entries(definition.details),
    date: snapshot
      ? new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date(snapshot.observedAt))
      : undefined,
  };
});
export const stripEntries = accountStats.flatMap((account) =>
  account.headline.map((metric) => ({
    ...metric,
    platform: account.name,
    accountId: account.id,
    handle:
      accounts.filter((item) => item.platform === account.platform).length > 1
        ? account.handle
        : undefined,
    accent: account.accent,
  })),
);
