import type { AccentName } from "./types";

export const platforms = [
  "codeforces",
  "eolymp",
  "atcoder",
  "leetcode",
  "github",
  "youtube",
] as const;
export type AccountPlatform = (typeof platforms)[number];
export const metricLabels = {
  rating: "Rating",
  solved: "Problems solved",
  maxRating: "Highest rating",
  rank: "Rank",
  contests: "Rated contests",
  problems: "Problems",
  submissions: "Submissions",
  followers: "Followers",
  stars: "Stars received",
  repositories: "Public repositories",
  subscribers: "Subscribers",
  videos: "Public videos",
  views: "Public views",
  easy: "Easy solved",
  medium: "Medium solved",
  hard: "Hard solved",
} as const;
export type MetricKey = keyof typeof metricLabels;
export type AccountMetrics = Partial<Record<MetricKey, number | string>>;
export interface AccountConfig {
  id: string;
  platform: AccountPlatform;
  handle: string;
  url: string;
  accent: AccentName;
}
interface PlatformDefinition {
  name: string;
  headline: readonly MetricKey[];
  details: readonly MetricKey[];
  note: string;
}
export const platformDefinitions: Record<AccountPlatform, PlatformDefinition> =
  {
    codeforces: {
      name: "Codeforces",
      headline: ["rating", "solved"],
      details: ["maxRating", "rank", "contests"],
      note: "Solved problems are unique accepted contest problem IDs across the complete public submission history.",
    },
    eolymp: {
      name: "Eolymp",
      headline: ["rating", "problems"],
      details: ["submissions"],
      note: "Problems and submissions use Eolymp’s own profile totals.",
    },
    atcoder: {
      name: "AtCoder",
      headline: ["rating", "maxRating"],
      details: ["contests"],
      note: "Ratings and contest counts are for the algorithm competition category.",
    },
    leetcode: {
      name: "LeetCode",
      headline: ["solved", "rating"],
      details: ["easy", "medium", "hard", "contests"],
      note: "Only publicly available profile and contest statistics are shown.",
    },
    github: {
      name: "GitHub",
      headline: ["stars"],
      details: ["followers", "repositories"],
      note: "Stars received are summed across owned public repositories, excluding forks. The repository count includes public forks.",
    },
    youtube: {
      name: "YouTube",
      headline: ["subscribers"],
      details: ["videos", "views"],
      note: "Subscriber totals may be rounded by YouTube. Hidden subscriber counts are omitted.",
    },
  };

// Add another entry to show another account on any supported platform.
export const accounts = [
  {
    id: "codeforces-niklasplugin",
    platform: "codeforces",
    handle: "NiklasPlugin",
    url: "https://codeforces.com/profile/NiklasPlugin",
    accent: "blue",
  },
  {
    id: "eolymp-platino",
    platform: "eolymp",
    handle: "Platino",
    url: "https://eolymp.com/en/users/Platino",
    accent: "red",
  },
  {
    id: "atcoder-nicklas",
    platform: "atcoder",
    handle: "Nicklas",
    url: "https://atcoder.jp/users/Nicklas",
    accent: "yellow",
  },
  {
    id: "leetcode-nicklaspl",
    platform: "leetcode",
    handle: "NicklasPL",
    url: "https://leetcode.com/u/NicklasPL/",
    accent: "green",
  },
  {
    id: "github-koljapl",
    platform: "github",
    handle: "koljaPl",
    url: "https://github.com/koljaPl",
    accent: "blue",
  },
  {
    id: "youtube-nicklas-plugin",
    platform: "youtube",
    handle: "@Nicklas_Plugin",
    url: "https://www.youtube.com/@Nicklas_Plugin",
    accent: "red",
  },
] as const satisfies readonly AccountConfig[];

export const primaryAccountUrls = {
  github: accounts.find((account) => account.id === "github-koljapl")!.url,
  youtube: accounts.find((account) => account.id === "youtube-nicklas-plugin")!
    .url,
};
