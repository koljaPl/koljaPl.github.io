export interface PublicVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}
export interface VideoSnapshot {
  observedAt: string;
  videos: PublicVideo[];
}
export function validateVideos(value: unknown): VideoSnapshot {
  const x = value as VideoSnapshot;
  if (
    !x ||
    !Number.isFinite(Date.parse(x.observedAt)) ||
    !Array.isArray(x.videos) ||
    x.videos.length > 3
  )
    throw new Error("Invalid video snapshot");
  for (const v of x.videos) {
    if (
      !/^[\w-]{11}$/.test(v.id) ||
      !v.title?.trim() ||
      !Number.isFinite(Date.parse(v.publishedAt))
    )
      throw new Error("Invalid video");
    const u = new URL(v.thumbnail);
    if (u.protocol !== "https:" || u.hostname !== "i.ytimg.com")
      throw new Error("Invalid thumbnail");
  }
  return x;
}
