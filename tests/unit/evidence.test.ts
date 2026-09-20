import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { countAuthoredCommits, countSource } from "../../scripts/sync-evidence";
import { validateEvidence } from "../../src/data/evidence";
import { codingExperienceAt, timeline, profile } from "../../src/data/site";
import { validateVideos } from "../../src/data/videos";
test("commits filter author and inclusive rolling window, deduplicating SHAs", () => {
  const item = (sha: string, login: string, date: string) => ({
    sha,
    author: { login },
    commit: { committer: { date } },
  });
  assert.equal(
    countAuthoredCommits(
      [
        item("a", "koljaPl", "2026-09-01"),
        item("a", "koljapl", "2026-09-01"),
        item("b", "other", "2026-09-02"),
        item("c", "koljaPl", "2026-07-01"),
      ],
      "koljaPl",
      "2026-08-17",
      "2026-09-16",
    ),
    1,
  );
  assert.throws(() =>
    countAuthoredCommits([{}], "koljaPl", "2026-08-17", "2026-09-16"),
  );
});
test("pinned counter excludes comments, blank lines, dependencies and notebook outputs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "portfolio-count-"));
  try {
    await writeFile(join(dir, "main.py"), "# comment\n\nx = 1\nprint(x)\n");
    await writeFile(join(dir, "README.md"), "documentation\n");
    await mkdir(join(dir, "vendor"));
    await writeFile(join(dir, "vendor", "lib.py"), "x=1\ny=2\n");
    await writeFile(
      join(dir, "analysis.ipynb"),
      JSON.stringify({
        nbformat: 4,
        nbformat_minor: 5,
        metadata: {
          kernelspec: {
            language: "python",
            name: "python3",
            display_name: "Python 3",
          },
          language_info: { name: "python" },
        },
        cells: [
          { cell_type: "markdown", metadata: {}, source: ["# Notes"] },
          {
            cell_type: "code",
            metadata: {},
            execution_count: 1,
            source: ["# ignored\n", "y = 2\n"],
            outputs: [
              {
                output_type: "stream",
                name: "stdout",
                text: ["Not source code\n".repeat(100)],
              },
            ],
          },
        ],
      }),
    );
    assert.equal(await countSource(dir), 3);
    await writeFile(
      join(dir, "duplicate.py"),
      "# comment\n\nx = 1\nprint(x)\n",
    );
    assert.equal(await countSource(dir), 5);
    await writeFile(
      join(dir, "component.astro"),
      "<!-- ignored -->\n<p>Text</p>\n",
    );
    assert.equal(await countSource(dir), 6);
    await writeFile(join(dir, "analysis.ipynb"), "{broken");
    await assert.rejects(() => countSource(dir));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("empty evidence migration preserves independent existing caches and rejects corrupt counts", () => {
  assert.deepEqual(
    validateEvidence({ version: 1, repositories: {}, accounts: {} }),
    { version: 1, repositories: {}, accounts: {} },
  );
  assert.throws(() =>
    validateEvidence({
      version: 1,
      repositories: { bad: { revision: "oops" } },
      accounts: {},
    }),
  );
});
test("supplied chronology and approximate coding experience remain explicit", () => {
  assert.equal(timeline.length, 10);
  assert.equal(timeline.at(-1)?.future, true);
  assert.equal(
    codingExperienceAt(new Date("2026-09-16")),
    "Approximately 9 years · started at age 7",
  );
  assert.equal(profile.email.value, "nikolya.plugin@gmail.com");
});
test("public video snapshot validates dates, IDs and trusted thumbnail host", () => {
  const good = {
    observedAt: "2026-09-16",
    videos: [
      {
        id: "abcdefghijk",
        title: "A public video",
        publishedAt: "2026-09-01",
        thumbnail: "https://i.ytimg.com/vi/abcdefghijk/mqdefault.jpg",
      },
    ],
  };
  assert.deepEqual(validateVideos(good), good);
  assert.throws(() =>
    validateVideos({
      ...good,
      videos: [{ ...good.videos[0], thumbnail: "https://example.com/a.jpg" }],
    }),
  );
});

test("video adapter continues beyond unavailable uploads and never publishes partial pagination", async () => {
  const { latestPublicVideos } = await import("../../scripts/video-provider");
  let playlistCalls = 0;
  const result = await latestPublicVideos("@test", async (endpoint, params) => {
    if (endpoint === "channels")
      return {
        items: [
          { contentDetails: { relatedPlaylists: { uploads: "uploads" } } },
        ],
      };
    if (endpoint === "playlistItems") {
      playlistCalls++;
      return {
        items: [
          {
            contentDetails: {
              videoId: params.pageToken ? "publicvid01" : "privatevid1",
            },
          },
        ],
        ...(params.pageToken ? {} : { nextPageToken: "second" }),
      };
    }
    return {
      items:
        params.id === "privatevid1"
          ? []
          : [
              {
                id: "publicvid01",
                status: { privacyStatus: "public" },
                snippet: {
                  title: "Public video",
                  publishedAt: "2026-09-16",
                  thumbnails: {
                    medium: {
                      url: "https://i.ytimg.com/vi/publicvid01/mqdefault.jpg",
                    },
                  },
                },
              },
            ],
    };
  });
  assert.equal(playlistCalls, 2);
  assert.equal(result.videos.length, 1);
  assert.equal(result.videos[0]?.id, "publicvid01");
  await assert.rejects(() =>
    latestPublicVideos("@test", async (endpoint) => {
      if (endpoint === "channels")
        return {
          items: [
            { contentDetails: { relatedPlaylists: { uploads: "uploads" } } },
          ],
        };
      throw new Error("Provider unavailable");
    }),
  );
});
