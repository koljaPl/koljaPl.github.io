import { leetcodeRequest } from "./leetcode-request";
import { githubRequest } from "./github-request";
import { load } from "cheerio";
import type { AccountConfig, AccountMetrics } from "../src/data/accounts";
import { record } from "../src/data/account-cache";

type Request = (
  url: string,
  headers?: Record<string, string>,
) => Promise<unknown>;
function integer(value: unknown, signed = false): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    (!signed && value < 0)
  )
    throw new Error("Invalid provider number.");
  return value;
}
function numericText(value: string): number {
  const text = value.trim().replaceAll(",", "");
  if (!/^\d+$/.test(text)) throw new Error("Invalid profile number.");
  return integer(Number(text));
}
function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Invalid provider list.");
  return value;
}
function cfResult(value: unknown): unknown[] {
  if (!record(value) || value.status !== "OK")
    throw new Error("Codeforces API unavailable.");
  return array(value.result);
}
// Require a terminating short page. A failed or bounded traversal never returns a total.
export async function completePages(
  fetchPage: (page: number) => Promise<unknown[]>,
  size: number,
  limit = 100,
): Promise<unknown[]> {
  const result: unknown[] = [];
  const fingerprints = new Set<string>();
  for (let page = 1; page <= limit; page++) {
    const items = await fetchPage(page);
    if (items.length > size) throw new Error("Invalid pagination size.");
    const fingerprint = JSON.stringify(items);
    if (items.length && fingerprints.has(fingerprint))
      throw new Error("Provider repeated a page.");
    fingerprints.add(fingerprint);
    result.push(...items);
    if (items.length < size) return result;
  }
  throw new Error("Pagination incomplete; no total recorded.");
}
export function countSolved(submissions: unknown[]): number {
  const solved = new Set<string>();
  for (const submission of submissions) {
    if (!record(submission) || !Number.isSafeInteger(submission.id))
      throw new Error("Invalid submission.");
    // Pending submissions have no verdict and do not count as accepted.
    if (
      submission.verdict !== undefined &&
      typeof submission.verdict !== "string"
    )
      throw new Error("Invalid submission verdict.");
    if (submission.verdict !== "OK") continue;
    const problem = submission.problem;
    if (
      !record(problem) ||
      !Number.isSafeInteger(problem.contestId) ||
      typeof problem.index !== "string" ||
      !problem.index
    )
      throw new Error("Accepted problem has no stable identity.");
    solved.add(`${problem.contestId}/${problem.index}`);
  }
  return solved.size;
}
export function githubStars(
  repositories: unknown[],
  handle: string,
  expectedCount?: number,
): number {
  const stars = new Map<number, number>();
  for (const repo of repositories) {
    if (
      !record(repo) ||
      !record(repo.owner) ||
      typeof repo.owner.login !== "string" ||
      repo.owner.login.toLowerCase() !== handle.toLowerCase() ||
      typeof repo.fork !== "boolean" ||
      repo.private !== false
    )
      throw new Error("Invalid owned public repository.");
    const id = integer(repo.id);
    const count = integer(repo.stargazers_count);
    stars.set(id, repo.fork ? 0 : count);
  }
  if (expectedCount !== undefined && stars.size !== expectedCount)
    throw new Error(
      "Repository pagination did not match the public repository total.",
    );
  return [...stars.values()].reduce((total, value) => total + value, 0);
}
export function parseAtCoder(html: string): AccountMetrics {
  const $ = load(html);
  const metrics: AccountMetrics = {};
  $("table tr").each((_, row) => {
    const heading = $(row).find("th").clone();
    heading.children().remove();
    const key = (
      {
        Rating: "rating",
        "Highest Rating": "maxRating",
        "Rated Matches": "contests",
      } as const
    )[heading.text().trim() as "Rating"];
    if (!key) return;
    const cell = $(row).find("td");
    const value = cell.find("span").first().text().trim() || cell.text().trim();
    metrics[key] = numericText(value);
  });
  if (
    metrics.rating === undefined ||
    metrics.maxRating === undefined ||
    metrics.contests === undefined
  )
    throw new Error("AtCoder profile fields unavailable.");
  return metrics;
}
export function parseEolymp(html: string): AccountMetrics {
  const $ = load(html);
  $("script,style,nav,header").remove();
  const metrics: AccountMetrics = {};
  $("span").each((_, element) => {
    const label = $(element);
    if (label.children().length) return;
    const key = (
      {
        Rating: "rating",
        Problems: "problems",
        Submissions: "submissions",
      } as const
    )[label.text().trim() as "Rating"];
    if (!key) return;
    const value = label.parent().children().not(element).text().trim();
    if (/^[\d,]+$/.test(value)) {
      if (metrics[key] !== undefined)
        throw new Error("Ambiguous Eolymp profile field.");
      metrics[key] = numericText(value);
    }
  });
  if (metrics.rating === undefined || metrics.problems === undefined)
    throw new Error("Eolymp profile fields unavailable.");
  return metrics;
}
export function parseLeetCode(value: unknown, handle: string): AccountMetrics {
  if (
    !record(value) ||
    !record(value.data) ||
    !record(value.data.matchedUser) ||
    (value.errors !== undefined &&
      (!Array.isArray(value.errors) || value.errors.length > 0))
  )
    throw new Error("LeetCode public statistics unavailable.");
  const user = value.data.matchedUser;
  if (
    typeof user.username !== "string" ||
    user.username.toLowerCase() !== handle.toLowerCase() ||
    !record(user.submitStatsGlobal)
  )
    throw new Error("Invalid LeetCode profile.");
  const metrics: AccountMetrics = {};
  for (const row of array(user.submitStatsGlobal.acSubmissionNum)) {
    if (!record(row)) throw new Error("Invalid LeetCode statistics.");
    const key = (
      { All: "solved", Easy: "easy", Medium: "medium", Hard: "hard" } as const
    )[row.difficulty as "All"];
    if (!key || metrics[key] !== undefined)
      throw new Error("Invalid or duplicate difficulty");
    metrics[key] = integer(row.count);
  }
  if (
    [metrics.solved, metrics.easy, metrics.medium, metrics.hard].some(
      (value) => typeof value !== "number",
    ) ||
    metrics.solved !==
      (metrics.easy as number) +
        (metrics.medium as number) +
        (metrics.hard as number)
  )
    throw new Error("Incomplete or inconsistent solved counts.");
  const contest = value.data.userContestRanking;
  if (contest === undefined) throw new Error("Missing contest response");
  if (contest !== null) {
    if (
      !record(contest) ||
      typeof contest.rating !== "number" ||
      !Number.isFinite(contest.rating) ||
      contest.rating < 0
    )
      throw new Error("Invalid LeetCode contest statistics.");
    metrics.rating = Math.round(contest.rating);
    metrics.contests = integer(contest.attendedContestsCount);
  }
  return metrics;
}
export function parseYouTube(value: unknown): AccountMetrics {
  if (!record(value)) throw new Error("Invalid YouTube response.");
  const items = array(value.items);
  if (items.length !== 1 || !record(items[0]) || !record(items[0].statistics))
    throw new Error("YouTube channel statistics unavailable.");
  const stats = items[0].statistics;
  const metrics: AccountMetrics = {};
  for (const [field, key] of [
    ["subscriberCount", "subscribers"],
    ["videoCount", "videos"],
    ["viewCount", "views"],
  ] as const) {
    if (field === "subscriberCount" && stats.hiddenSubscriberCount === true)
      continue;
    if (stats[field] !== undefined) {
      if (typeof stats[field] !== "string")
        throw new Error("Invalid YouTube count.");
      metrics[key] = numericText(stats[field]);
    }
  }
  return metrics;
}
export async function fetchAccount(
  account: AccountConfig,
): Promise<AccountMetrics> {
  const signal = AbortSignal.timeout(90_000);
  const request: Request = async (url, headers = {}) => {
    if (url.startsWith("https://api.github.com/"))
      return githubRequest(url.slice("https://api.github.com".length));
    const response = await fetch(url, {
      headers: { "User-Agent": "koljapl.github.io-build", ...headers },
      signal: AbortSignal.any([signal, AbortSignal.timeout(12_000)]),
    });
    if (!response.ok)
      throw new Error(`Public endpoint returned HTTP ${response.status}.`);
    return response.json();
  };
  const html = async (url: string) => {
    const response = await fetch(url, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(12_000)]),
    });
    if (!response.ok)
      throw new Error(`Public profile returned HTTP ${response.status}.`);
    return response.text();
  };
  const handle = encodeURIComponent(account.handle);
  switch (account.platform) {
    case "codeforces": {
      const cf: Request = async (url) => {
        // Public API allows one request per two seconds.
        await new Promise((resolve) => setTimeout(resolve, 2100));
        return request(url);
      };
      const users = cfResult(
        await cf(`https://codeforces.com/api/user.info?handles=${handle}`),
      );
      const user = users[0];
      if (
        users.length !== 1 ||
        !record(user) ||
        typeof user.handle !== "string" ||
        user.handle.toLowerCase() !== account.handle.toLowerCase()
      )
        throw new Error("Invalid Codeforces user.");
      const metrics: AccountMetrics = {};
      if (user.rating !== undefined)
        metrics.rating = integer(user.rating, true);
      if (user.maxRating !== undefined)
        metrics.maxRating = integer(user.maxRating, true);
      if (user.rank !== undefined) {
        if (typeof user.rank !== "string")
          throw new Error("Invalid Codeforces rank.");
        metrics.rank = user.rank;
      }
      metrics.solved = countSolved(
        await completePages(
          async (page) =>
            cfResult(
              await cf(
                `https://codeforces.com/api/user.status?handle=${handle}&from=${(page - 1) * 1000 + 1}&count=1000`,
              ),
            ),
          1000,
        ),
      );
      const contests = cfResult(
        await cf(`https://codeforces.com/api/user.rating?handle=${handle}`),
      );
      const ids = new Set<number>();
      for (const contest of contests) {
        if (!record(contest)) throw new Error("Invalid contest history.");
        ids.add(integer(contest.contestId));
      }
      metrics.contests = ids.size;
      return metrics;
    }
    case "github": {
      const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const user = await request(
        `https://api.github.com/users/${handle}`,
        headers,
      );
      if (
        !record(user) ||
        typeof user.login !== "string" ||
        user.login.toLowerCase() !== account.handle.toLowerCase()
      )
        throw new Error("Invalid GitHub user.");
      const repos = await completePages(
        async (page) =>
          array(
            await request(
              `https://api.github.com/users/${handle}/repos?type=owner&per_page=100&page=${page}`,
              headers,
            ),
          ),
        100,
      );
      return {
        followers: integer(user.followers),
        repositories: integer(user.public_repos),
        stars: githubStars(repos, account.handle, integer(user.public_repos)),
      };
    }
    case "atcoder":
      return parseAtCoder(
        await html(`${account.url}?lang=en&contestType=algo`),
      );
    case "eolymp":
      return parseEolymp(await html(account.url));
    case "leetcode": {
      return parseLeetCode(
        await leetcodeRequest(
          "query PublicStats($username: String!) { matchedUser(username: $username) { username submitStatsGlobal { acSubmissionNum { difficulty count } } } userContestRanking(username: $username) { rating attendedContestsCount } }",
          { username: account.handle },
        ),
        account.handle,
      );
    }
    case "youtube": {
      const key = process.env.YOUTUBE_API_KEY;
      if (!key) throw new Error("YOUTUBE_API_KEY is not configured.");
      return parseYouTube(
        await request(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${handle}&key=${encodeURIComponent(key)}`,
        ),
      );
    }
  }
}
