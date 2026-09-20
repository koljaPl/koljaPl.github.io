import { record } from "../src/data/account-cache";
import {
  validateVideos,
  type PublicVideo,
  type VideoSnapshot,
} from "../src/data/videos";
type Get = (
  endpoint: string,
  params: Record<string, string>,
) => Promise<unknown>;
/** Uploads are newest first; traverse beyond private/deleted entries, never claim a partial result. */
export async function latestPublicVideos(
  handle: string,
  get: Get,
): Promise<VideoSnapshot> {
  const response = await get("channels", {
    part: "contentDetails",
    forHandle: handle,
  });
  if (
    !record(response) ||
    !Array.isArray(response.items) ||
    response.items.length !== 1
  )
    throw new Error("Missing channel");
  const channel = response.items[0];
  if (
    !record(channel) ||
    !record(channel.contentDetails) ||
    !record(channel.contentDetails.relatedPlaylists) ||
    typeof channel.contentDetails.relatedPlaylists.uploads !== "string"
  )
    throw new Error("Missing uploads playlist");
  const playlist = channel.contentDetails.relatedPlaylists.uploads;
  const videos: PublicVideo[] = [];
  const seen = new Set<string>();
  let pageToken = "";
  for (let page = 0; page < 20; page++) {
    const data = await get("playlistItems", {
      part: "contentDetails",
      playlistId: playlist,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    if (!record(data) || !Array.isArray(data.items))
      throw new Error("Missing uploads");
    const ids = data.items.map((item) => {
      if (
        !record(item) ||
        !record(item.contentDetails) ||
        typeof item.contentDetails.videoId !== "string" ||
        !/^[\w-]{11}$/.test(item.contentDetails.videoId)
      )
        throw new Error("Invalid upload");
      return item.contentDetails.videoId;
    });
    const details = ids.length
      ? await get("videos", { part: "snippet,status", id: ids.join(",") })
      : { items: [] };
    if (!record(details) || !Array.isArray(details.items))
      throw new Error("Missing video details");
    for (const video of details.items) {
      if (!record(video) || !record(video.status))
        throw new Error("Invalid video status");
      if (video.status.privacyStatus !== "public") continue;
      if (
        typeof video.id !== "string" ||
        !ids.includes(video.id) ||
        !record(video.snippet) ||
        !record(video.snippet.thumbnails) ||
        !record(video.snippet.thumbnails.medium)
      )
        throw new Error("Invalid public video");
      if (seen.has(video.id)) continue;
      seen.add(video.id);
      const validated = validateVideos({
        observedAt: new Date().toISOString(),
        videos: [
          {
            id: video.id,
            title: video.snippet.title,
            publishedAt: video.snippet.publishedAt,
            thumbnail: video.snippet.thumbnails.medium.url,
          },
        ],
      }).videos[0]!;
      videos.push(validated);
    }
    if (videos.length >= 3 || !data.nextPageToken)
      return validateVideos({
        observedAt: new Date().toISOString(),
        videos: videos
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
          .slice(0, 3),
      });
    if (
      typeof data.nextPageToken !== "string" ||
      data.nextPageToken === pageToken
    )
      throw new Error("Incomplete uploads pagination");
    pageToken = data.nextPageToken;
  }
  throw new Error("Uploads pagination exceeded bound");
}
