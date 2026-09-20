import { latestPublicVideos } from "./video-provider";
import { readFile, writeFile, rename } from "node:fs/promises";
import { accounts } from "../src/data/accounts";
import { validateVideos, type VideoSnapshot } from "../src/data/videos";
const path = new URL("../src/data/generated/videos.json", import.meta.url);
const previous = await readFile(path, "utf8");
const cache = JSON.parse(previous) as Record<string, VideoSnapshot>;
for (const value of Object.values(cache)) validateVideos(value);
const key = process.env.YOUTUBE_API_KEY;
if (key) {
  for (const account of accounts.filter((a) => a.platform === "youtube")) {
    try {
      const get = async (endpoint: string, params: Record<string, string>) => {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/${endpoint}?${new URLSearchParams({ ...params, key })}`,
          { signal: AbortSignal.timeout(12000) },
        );
        if (!response.ok) throw new Error("YouTube unavailable");
        return response.json();
      };
      cache[account.id] = await latestPublicVideos(account.handle, get);
    } catch {
      console.warn(
        `[videos] ${account.id}: keeping any dated public-video snapshot.`,
      );
    }
  }
  const next = JSON.stringify(cache, null, 2) + "\n";
  if (next !== previous) {
    const tmp = new URL(`./videos.${process.pid}.tmp`, path);
    await writeFile(tmp, next);
    await rename(tmp, path);
  }
} else
  console.log("[videos] No YouTube API key; channel link remains available.");
