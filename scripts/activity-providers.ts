import { record } from "../src/data/account-cache";
import {
  activityWindow,
  validateActivity,
  type ActivityDay,
  type ActivitySnapshot,
} from "../src/data/activity";
import type { AccountConfig } from "../src/data/accounts";
import { githubGraphql } from "./github-request";
import { leetcodeRequest } from "./leetcode-request";

function dataOf(value: unknown): Record<string, unknown> {
  if (
    !record(value) ||
    !record(value.data) ||
    (value.errors !== undefined &&
      (!Array.isArray(value.errors) || value.errors.length))
  )
    throw new Error("Incomplete GraphQL response");
  return value.data;
}
export function parseGitHubCalendar(
  value: unknown,
  handle: string,
  observedAt: string,
): ActivityDay[] {
  const data = dataOf(value);
  if (
    !record(data.user) ||
    typeof data.user.login !== "string" ||
    data.user.login.toLowerCase() !== handle.toLowerCase() ||
    !record(data.user.contributionsCollection) ||
    !record(data.user.contributionsCollection.contributionCalendar)
  )
    throw new Error("Invalid GitHub activity");
  const calendar = data.user.contributionsCollection.contributionCalendar;
  if (
    !Array.isArray(calendar.weeks) ||
    !Number.isSafeInteger(calendar.totalContributions)
  )
    throw new Error("Invalid contribution calendar");
  const window = activityWindow(observedAt),
    counts = new Map<string, number>();
  for (const week of calendar.weeks) {
    if (!record(week) || !Array.isArray(week.contributionDays))
      throw new Error("Missing contribution days");
    for (const day of week.contributionDays) {
      if (
        !record(day) ||
        typeof day.date !== "string" ||
        !window.dates.includes(day.date) ||
        typeof day.contributionCount !== "number" ||
        !Number.isSafeInteger(day.contributionCount) ||
        day.contributionCount < 0 ||
        counts.has(day.date)
      )
        throw new Error("Invalid contribution day");
      counts.set(day.date, day.contributionCount);
    }
  }
  if (
    counts.size !== 365 ||
    [...counts.values()].reduce((a, b) => a + b, 0) !==
      calendar.totalContributions
  )
    throw new Error("Incomplete contribution calendar");
  return window.dates.map((date) => ({ date, count: counts.get(date)! }));
}
export function parseLeetCodeCalendar(
  value: unknown,
  handle: string,
  year: number,
): Map<string, number> {
  const data = dataOf(value);
  if (
    !record(data.matchedUser) ||
    typeof data.matchedUser.username !== "string" ||
    data.matchedUser.username.toLowerCase() !== handle.toLowerCase() ||
    !record(data.matchedUser.userCalendar) ||
    typeof data.matchedUser.userCalendar.submissionCalendar !== "string"
  )
    throw new Error("Invalid LeetCode calendar");
  const raw = data.matchedUser.userCalendar.submissionCalendar;
  // JSON.parse alone would silently discard duplicate timestamp keys.
  if (
    !/^\{\s*(?:"\d{10}"\s*:\s*\d+\s*(?:,\s*"\d{10}"\s*:\s*\d+\s*)*)?\}$/.test(
      raw,
    )
  )
    throw new Error("Malformed submission calendar");
  const keys = [...raw.matchAll(/"([^"\\]*)"\s*:/g)].map((match) => match[1]!);
  if (new Set(keys).size !== keys.length)
    throw new Error("Duplicate submission date");
  const calendar: unknown = JSON.parse(raw);
  if (!record(calendar)) throw new Error("Invalid submission calendar");
  const days = new Map<string, number>();
  for (const [timestamp, count] of Object.entries(calendar)) {
    if (
      !/^\d{10}$/.test(timestamp) ||
      typeof count !== "number" ||
      !Number.isSafeInteger(count) ||
      count < 0
    )
      throw new Error("Invalid submission count");
    const time = Number(timestamp) * 1000;
    const date = new Date(time).toISOString().slice(0, 10);
    if (
      new Date(time).getUTCFullYear() !== year ||
      time % 86400000 !== 0 ||
      days.has(date)
    )
      throw new Error("Invalid submission date");
    days.set(date, count);
  }
  return days;
}
export async function fetchActivity(
  account: AccountConfig,
  observedAt: string,
  requests = { github: githubGraphql, leetcode: leetcodeRequest },
): Promise<ActivitySnapshot> {
  const window = activityWindow(observedAt);
  let days: ActivityDay[];
  if (account.platform === "github") {
    const value = await requests.github(
      `query Activity($login:String!,$from:DateTime!,$to:DateTime!){ user(login:$login){ login contributionsCollection(from:$from,to:$to){ contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount } } } } } }`,
      {
        login: account.handle,
        from: `${window.start}T00:00:00Z`,
        to: observedAt,
      },
    );
    days = parseGitHubCalendar(value, account.handle, observedAt);
  } else if (account.platform === "leetcode") {
    const all = new Map<string, number>();
    const firstYear = Number(window.start.slice(0, 4)),
      lastYear = Number(window.end.slice(0, 4));
    for (let year = firstYear; year <= lastYear; year++) {
      const value = await requests.leetcode(
        `query Calendar($username:String!,$year:Int!){matchedUser(username:$username){username userCalendar(year:$year){submissionCalendar}}}`,
        { username: account.handle, year },
      );
      for (const [date, count] of parseLeetCodeCalendar(
        value,
        account.handle,
        year,
      ))
        all.set(date, count);
    }
    days = window.dates.map((date) => ({ date, count: all.get(date) ?? 0 }));
  } else throw new Error("Unsupported activity provider");
  return validateActivity({
    platform: account.platform,
    handle: account.handle,
    source: account.url,
    metric: account.platform === "github" ? "contributions" : "submissions",
    observedAt,
    start: window.start,
    end: window.end,
    days,
  });
}
