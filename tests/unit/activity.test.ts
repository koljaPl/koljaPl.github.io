import assert from "node:assert/strict";
import test from "node:test";
import { accounts } from "../../src/data/accounts";
import {
  activityWindow,
  validateActivity,
  validateActivityCache,
  type ActivitySnapshot,
} from "../../src/data/activity";
import {
  fetchActivity,
  parseGitHubCalendar,
  parseLeetCodeCalendar,
} from "../../scripts/activity-providers";
import { refreshActivity } from "../../scripts/sync-activity";
import { parseLeetCode } from "../../scripts/account-providers";
import { leetcodeRequest } from "../../scripts/leetcode-request";

const observed = "2026-09-17T12:00:00.000Z";
const github = accounts.find((a) => a.platform === "github")!;
const leetcode = accounts.find((a) => a.platform === "leetcode")!;
const window = activityWindow(observed);
const days = window.dates.map((date, index) => ({ date, count: index % 5 }));
const snapshot: ActivitySnapshot = {
  platform: "github",
  handle: github.handle,
  source: github.url,
  metric: "contributions",
  observedAt: observed,
  start: window.start,
  end: window.end,
  days,
};
const ghData = () => ({
  data: {
    user: {
      login: github.handle,
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: days.reduce((a, d) => a + d.count, 0),
          weeks: [
            {
              contributionDays: days.map((day) => ({
                date: day.date,
                contributionCount: day.count,
              })),
            },
          ],
        },
      },
    },
  },
});
const lcData = (calendar: string) => ({
  data: {
    matchedUser: {
      username: leetcode.handle,
      userCalendar: { submissionCalendar: calendar },
    },
  },
});
const stats = () => ({
  data: {
    matchedUser: {
      username: leetcode.handle,
      submitStatsGlobal: {
        acSubmissionNum: [
          { difficulty: "All", count: 6 },
          { difficulty: "Easy", count: 3 },
          { difficulty: "Medium", count: 2 },
          { difficulty: "Hard", count: 1 },
        ],
      },
    },
    userContestRanking: null as null | {
      rating: number;
      attendedContestsCount: number;
    },
  },
});

test("365-day windows include snapshot day, cross years and preserve leap dates", () => {
  assert.equal(window.start, "2025-09-18");
  assert.equal(window.end, "2026-09-17");
  assert.equal(window.dates.length, 365);
  assert.ok(
    activityWindow("2024-03-01T23:59:00Z").dates.includes("2024-02-29"),
  );
  assert.equal(activityWindow("2024-03-01T23:59:00Z").dates.length, 365);
  assert.throws(() => activityWindow("invalid"));
});
test("GitHub calendar validates identity, exact coverage, totals and duplicate days", () => {
  assert.deepEqual(
    parseGitHubCalendar(ghData(), github.handle, observed),
    days,
  );
  const missing = ghData();
  missing.data.user.contributionsCollection.contributionCalendar.weeks[0]!.contributionDays.pop();
  assert.throws(() => parseGitHubCalendar(missing, github.handle, observed));
  const duplicate = ghData();
  duplicate.data.user.contributionsCollection.contributionCalendar.weeks[0]!.contributionDays.push(
    { date: window.start, contributionCount: 0 },
  );
  assert.throws(() => parseGitHubCalendar(duplicate, github.handle, observed));
  const corrupt = ghData();
  corrupt.data.user.contributionsCollection.contributionCalendar
    .totalContributions++;
  assert.throws(() => parseGitHubCalendar(corrupt, github.handle, observed));
  assert.throws(() => parseGitHubCalendar(ghData(), "someone-else", observed));
  assert.throws(() =>
    parseGitHubCalendar(
      { ...ghData(), errors: [{ message: "partial" }] },
      github.handle,
      observed,
    ),
  );
});
test("LeetCode calendars reject wrong years, malformed values and duplicate timestamps", () => {
  const timestamp = String(Date.parse("2026-09-01") / 1000);
  assert.deepEqual(
    [
      ...parseLeetCodeCalendar(
        lcData(`{"${timestamp}":7}`),
        leetcode.handle,
        2026,
      ),
    ],
    [["2026-09-01", 7]],
  );
  for (const raw of [
    `{"${timestamp}":7,"${timestamp}":8}`,
    `{"${timestamp}":-1}`,
    `{"${timestamp}":1.5}`,
    `{"${timestamp}":"7"}`,
    "[]",
    "null",
    '{"not-a-date":1}',
  ])
    assert.throws(() =>
      parseLeetCodeCalendar(lcData(raw), leetcode.handle, 2026),
    );
  assert.throws(() =>
    parseLeetCodeCalendar(lcData(`{"${timestamp}":7}`), leetcode.handle, 2025),
  );
  assert.throws(() =>
    parseLeetCodeCalendar(lcData("{}"), "someone-else", 2026),
  );
  assert.throws(() =>
    parseLeetCodeCalendar(
      { ...lcData("{}"), errors: [{ message: "partial" }] },
      leetcode.handle,
      2026,
    ),
  );
});
test("LeetCode queries both calendar years before filling verified inactive dates", async () => {
  const years: number[] = [];
  const requests = {
    github: async () => ({}),
    leetcode: async (
      _query: string,
      variables: Record<string, string | number>,
    ) => {
      const year = Number(variables.year);
      years.push(year);
      return lcData(
        JSON.stringify({ [String(Date.parse(`${year}-10-01`) / 1000)]: 4 }),
      );
    },
  };
  const result = await fetchActivity(leetcode, observed, requests);
  assert.deepEqual(years, [2025, 2026]);
  assert.equal(result.days.length, 365);
  assert.equal(result.days.find((d) => d.date === "2025-10-01")?.count, 4);
  assert.equal(result.days.find((d) => d.date === "2026-01-01")?.count, 0);
  await assert.rejects(
    fetchActivity(leetcode, observed, {
      ...requests,
      leetcode: async (_q, v) => {
        if (v.year === 2026) throw new Error("timeout");
        return lcData("{}");
      },
    }),
  );
});
test("activity cache rejects invalid scope, counts and dates; failed refresh preserves original dates", async () => {
  assert.deepEqual(validateActivity(snapshot), snapshot);
  for (const bad of [
    { ...snapshot, metric: "submissions" },
    { ...snapshot, end: "2026-09-16" },
    { ...snapshot, source: "https://example.com" },
    { ...snapshot, days: days.slice(1) },
    {
      ...snapshot,
      days: days.map((d, i) => (i === 3 ? { ...d, count: -1 } : d)),
    },
  ])
    assert.throws(() => validateActivity(bad));
  const cache = validateActivityCache({
    version: 1,
    accounts: { [github.id]: snapshot },
  });
  const failed = await refreshActivity(
    [github],
    cache,
    async () => {
      throw new Error("unavailable");
    },
    "2026-09-18T12:00:00Z",
    () => {},
  );
  assert.deepEqual(failed, cache);
  const corrupt = await refreshActivity(
    [github],
    cache,
    async () => ({ ...snapshot, days: [] }),
    observed,
    () => {},
  );
  assert.deepEqual(corrupt, cache);
  const absent = await refreshActivity(
    [leetcode],
    { version: 1, accounts: {} },
    async () => {
      throw new Error("blocked");
    },
    observed,
    () => {},
  );
  assert.deepEqual(absent.accounts, {});
});
test("LeetCode direct request has no HTML prerequisite and preserves absent contest rating", async () => {
  const calls: string[] = [];
  const response = await leetcodeRequest(
    "query PublicStats { matchedUser { username } }",
    { username: leetcode.handle },
    async (input, init) => {
      calls.push(String(input));
      assert.equal(init?.method, "POST");
      assert.equal(
        (init?.headers as Record<string, string>)["Cookie"],
        undefined,
      );
      return new Response(JSON.stringify(stats()), {
        headers: { "Content-Type": "application/json" },
      });
    },
  );
  assert.deepEqual(calls, ["https://leetcode.com/graphql/"]);
  assert.deepEqual(parseLeetCode(response, leetcode.handle), {
    solved: 6,
    easy: 3,
    medium: 2,
    hard: 1,
  });
  const ranked = stats();
  ranked.data.userContestRanking = { rating: 1700.6, attendedContestsCount: 3 };
  assert.equal(parseLeetCode(ranked, leetcode.handle).rating, 1701);
  const missing = stats();
  missing.data.matchedUser.submitStatsGlobal.acSubmissionNum.pop();
  assert.throws(() => parseLeetCode(missing, leetcode.handle));
  const duplicate = stats();
  duplicate.data.matchedUser.submitStatsGlobal.acSubmissionNum.push({
    difficulty: "Easy",
    count: 3,
  });
  assert.throws(() => parseLeetCode(duplicate, leetcode.handle));
  assert.throws(() =>
    parseLeetCode(
      { ...stats(), errors: [{ message: "partial" }] },
      leetcode.handle,
    ),
  );
});
