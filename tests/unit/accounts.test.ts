import assert from "node:assert/strict";
import test from "node:test";
import { accounts } from "../../src/data/accounts";
import {
  mergeAccountCache,
  validateSnapshot,
  validateAccountCache,
  snapshotFor,
} from "../../src/data/account-cache";
import {
  completePages,
  countSolved,
  githubStars,
  parseAtCoder,
  parseEolymp,
  parseLeetCode,
  parseYouTube,
} from "../../scripts/account-providers";
import { refreshAccounts } from "../../scripts/sync-accounts";

const account = accounts[0];
const snapshot = validateSnapshot({
  platform: account.platform,
  handle: account.handle,
  profileUrl: account.url,
  observedAt: "2026-09-01T12:00:00.000Z",
  metrics: { rating: 1500, solved: 2 },
});
const cache = { version: 1 as const, accounts: { [account.id]: snapshot } };

test("AtCoder uses labeled algorithm fields and ignores unrelated numbers", () => {
  assert.deepEqual(
    parseAtCoder(
      "<p>9999</p><table><tr><th>Rating</th><td><img/><span>1685</span></td></tr><tr><th>Highest Rating</th><td><span>1997</span><small>1 Kyu</small></td></tr><tr><th>Rated Matches <span>?</span></th><td>15</td></tr></table>",
    ),
    { rating: 1685, maxRating: 1997, contests: 15 },
  );
  assert.throws(() => parseAtCoder("<p>Rating 1685</p>"));
  assert.throws(() =>
    parseAtCoder("<table><tr><th>Rating</th><td>unknown</td></tr></table>"),
  );
});
test("Eolymp parses only exact profile label/value pairs, preserves Problems terminology", () => {
  assert.deepEqual(
    parseEolymp(
      "<nav><span>Rating</span></nav><div><span>Rating</span><span>1,884</span></div><div><span>Problems</span><span>184</span></div><div><span>Submissions</span><div>221</div></div>",
    ),
    { rating: 1884, problems: 184, submissions: 221 },
  );
  assert.throws(() => parseEolymp("<script>Rating 123</script>"));
  assert.throws(() =>
    parseEolymp(
      "<div><span>Rating</span><span>1</span></div><div><span>Rating</span><span>2</span></div>",
    ),
  );
});
test("complete pagination and accepted problem deduplication", async () => {
  const accepted = (id: number, contestId: number, index: string) => ({
    id,
    verdict: "OK",
    problem: { contestId, index },
  });
  const pages = [
    [accepted(1, 10, "A"), accepted(2, 10, "A")],
    [accepted(3, 11, "A"), { id: 4, verdict: "WRONG_ANSWER" }],
    [{ id: 5 }],
  ];
  const visited: number[] = [];
  const submissions = await completePages(async (page) => {
    visited.push(page);
    return pages[page - 1]!;
  }, 2);
  assert.deepEqual(visited, [1, 2, 3]);
  assert.equal(countSolved(submissions), 2);
  assert.throws(() =>
    countSolved([{ id: 1, verdict: "OK", problem: { index: "A" } }]),
  );
  assert.throws(() => countSolved([{}]));
});
test("pagination rejects repeated, failed, oversized, and truncated pages", async () => {
  await assert.rejects(completePages(async () => [{ id: 1 }], 1));
  await assert.rejects(
    completePages(async (page) => [{ id: page }], 1, 2),
    /incomplete/,
  );
  await assert.rejects(completePages(async () => [1, 2], 1));
  await assert.rejects(
    completePages(async (page) => {
      if (page === 2) throw new Error("timeout");
      return [1];
    }, 1),
  );
});
test("GitHub totals exclude forks, deduplicate page overlap and reject missing stars", () => {
  const repo = (id: number, stars: number, fork = false) => ({
    id,
    stargazers_count: stars,
    fork,
    private: false,
    owner: { login: "koljaPl" },
  });
  assert.equal(
    githubStars(
      [repo(1, 3), repo(1, 3), repo(2, 100, true), repo(3, 4)],
      "koljaPl",
    ),
    7,
  );
  assert.throws(() =>
    githubStars([{ ...repo(1, 3), stargazers_count: null }], "koljaPl"),
  );
  assert.throws(() => githubStars([repo(1, 3)], "another-user"));
  assert.throws(() => githubStars([repo(1, 3)], "koljaPl", 2));
});
test("missing optional provider metrics stay missing, not zero", () => {
  const lc = parseLeetCode(
    {
      data: {
        matchedUser: {
          username: "NicklasPL",
          submitStatsGlobal: {
            acSubmissionNum: ["All", "Easy", "Medium", "Hard"].map(
              (difficulty) => ({ difficulty, count: 0 }),
            ),
          },
        },
        userContestRanking: null,
      },
    },
    "NicklasPL",
  );
  assert.deepEqual(lc, { solved: 0, easy: 0, medium: 0, hard: 0 });
  assert.throws(() =>
    parseLeetCode({ errors: [{ message: "denied" }] }, "NicklasPL"),
  );
  assert.deepEqual(
    parseYouTube({
      items: [
        {
          statistics: {
            hiddenSubscriberCount: true,
            subscriberCount: "999",
            videoCount: "2",
          },
        },
      ],
    }),
    { videos: 2 },
  );
  assert.throws(() =>
    parseYouTube({ items: [{ statistics: { videoCount: "unknown" } }] }),
  );
  assert.throws(() => parseYouTube({ items: [] }));
});
test("snapshot schema rejects corrupt, empty, unexpected and cross-platform data", () => {
  for (const metrics of [
    {},
    { solved: null },
    { solved: -1 },
    { solved: 2.5 },
    { rating: "123" },
    { followers: 4 },
  ])
    assert.throws(() => validateSnapshot({ ...snapshot, metrics }));
  assert.throws(() =>
    validateSnapshot({ ...snapshot, profileUrl: "https://example.com" }),
  );
  assert.throws(() => validateSnapshot({ ...snapshot, observedAt: "invalid" }));
  assert.deepEqual(validateAccountCache(cache), cache);
  assert.throws(() => validateAccountCache({ version: 2, accounts: {} }));
  assert.equal(
    snapshotFor({ ...account, handle: "someone-else" }, cache),
    undefined,
  );
});
test("failures and malformed responses preserve dated cache without manufacturing totals", async () => {
  for (const fetcher of [
    async () => {
      throw new Error("timeout secret-url");
    },
    async () => ({ solved: -1 }),
  ]) {
    const reports: string[] = [];
    assert.deepEqual(
      await refreshAccounts([account], cache, fetcher, (message) =>
        reports.push(message),
      ),
      cache,
    );
    assert.ok(!reports.join().includes("secret-url"));
  }
  assert.deepEqual(
    await refreshAccounts(
      [account],
      { version: 1, accounts: {} },
      async () => {
        throw new Error("403");
      },
      () => {},
    ),
    { version: 1, accounts: {} },
  );
  assert.deepEqual(mergeAccountCache([account], cache, new Map()), cache);
});
test("independent IDs support multiple accounts on one platform", async () => {
  const second = {
    ...account,
    id: "second-codeforces",
    handle: "other",
    url: "https://codeforces.com/profile/other",
  };
  const result = await refreshAccounts(
    [account, second],
    cache,
    async () => ({ solved: 4 }),
    () => {},
  );
  assert.equal(Object.keys(result.accounts).length, 2);
  assert.equal(result.accounts[second.id]?.handle, "other");
  await assert.rejects(
    refreshAccounts(
      [account, account],
      cache,
      async () => ({ solved: 1 }),
      () => {},
    ),
    /duplicate/,
  );
});
