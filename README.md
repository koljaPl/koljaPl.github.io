# Nicklas Pluhin — personal website

Production Astro site for [koljapl.github.io](https://koljapl.github.io). It is
fully static, uses strict TypeScript and Tailwind CSS 4, and deploys from the
`main` branch through GitHub Actions.

## Local development

```sh
corepack pnpm install
corepack pnpm dev
```

Useful checks:

```sh
corepack pnpm format:check
corepack pnpm test:unit
corepack pnpm check
corepack pnpm build
corepack pnpm test:e2e
corepack pnpm test:visual
corepack pnpm lighthouse
```

`corepack pnpm validate` runs the complete non-visual validation sequence.

## Content

- Edit profile, navigation, social, contact, experience, skills, competition,
  and timeline data in `src/data/site.ts`.
- Edit project metadata and case studies in `src/content/projects/`.
- Add repository coordinates to `src/data/github-repositories.ts`, then use the
  same `key` as `repositoryKey` in the matching project entry.
- Put a real résumé PDF in `public/` and set `profile.resumePdfUrl` when one is
  available.
- Keep pre-optimized project screenshots and artwork in `public/projects/`.
  Reference them with root-relative paths, meaningful alt text, intrinsic
  dimensions, and smaller `sources` variants for responsive delivery.

Unknown personal information is intentionally represented by typed, visible
placeholders. Replace those values only with verified content.

## GitHub metadata

`scripts/sync-github.ts` refreshes public repository URL, stars, primary
language, and update time during each build. It validates responses and writes
only complete metadata. On API failure or rate limiting, it retains the latest
valid checked-in value from `src/data/generated/github.json`.

The deployment workflow also runs daily and commits the cache only when its
validated content changes. The standard GitHub Actions token is sufficient for
configured public repositories.

## GitHub Pages setup

After pushing the repository, choose **GitHub Actions** as the Pages source in
**Settings → Pages**. The workflow validates, builds, and deploys from the
domain root; no custom domain or additional secret is required.

## Interactive brain diagram

The homepage uses a lazy-loaded anatomical 3D atlas with an original lateral-view
SVG fallback and shared vanilla TypeScript controls. Edit the six regions, anatomical descriptions,
metaphorical associations, and source links in `src/data/brain.ts`. Associations
are restricted to the known areas in `profile.areas`; they describe interests,
not personal abilities or localized programming centers. Anatomy is supported
by Johns Hopkins Medicine and NIMH, linked alongside each description.

Named buttons and SVG hit areas share one selection state. Escape and Clear
restore focus to the selected button. The in-flow panel comes into view on
selection, and the native “Read all regions” disclosure works without
JavaScript. The original portrait remains in the About section.

`test:e2e` includes mouse, keyboard, touch, no-JavaScript, theme, reduced-motion,
and reflow checks. `test:visual` captures every public page at 390, 768, 1024,
1440, and 1920px in both themes, plus selected brain panels. Inspect the images
in `artifacts/visual/`; screenshot generation alone is not visual approval.

The SVG favicon is the source for the existing Apple and manifest PNG icons.
Run `corepack pnpm generate:assets` after changing `public/favicon.svg`.

### Public account snapshots

`src/data/accounts.ts` is the shared account registry. Add an entry with a unique
stable `id`, supported `platform`, public `handle`, canonical HTTPS `url`, and
`accent` to add another card—including another account on the same platform.
The primary GitHub and YouTube social destinations also come from this registry.
`platformDefinitions` controls headline metrics (GitHub has three), expanded details,
and metric definitions. Ratings from different platforms are not comparable.

Run `corepack pnpm sync:accounts` to refresh
`src/data/generated/accounts.json`. Normal `pnpm build` refreshes both account
snapshots and repository metadata. The existing daily Pages workflow persists
both caches before building static pages. No account requests or credentials are
shipped to browsers. Cheerio is a build-only HTML parser.

Providers use bounded requests and validate each complete snapshot before an
atomic cache write. On an inaccessible profile, timeout, malformed response, or
incomplete pagination, the last valid snapshot and its original date remain.
Without a valid snapshot, cards retain their profile links and omit statistics;
missing values never become zero. HTML changes on AtCoder or Eolymp can make a
refresh unavailable until their narrow parsers are updated. Invalid checked-in
cache schemas fail validation rather than publishing corrupt data.

- Codeforces uses `user.info`, `user.status`, and `user.rating`. Solved means
  unique accepted `(contestId, problem index)` pairs across all submission pages.
  Rated contests are unique contest IDs. Requests respect the public API interval.
- AtCoder reads the English algorithm profile’s labeled rating, highest rating,
  and rated-match count. Eolymp reads its own Rating, Problems, and Submissions
  fields; “Problems” is deliberately not relabeled “solved.”
- GitHub reads the public user API and all owned public repository pages.
  Stars received exclude forks; public repository count includes public forks.
  `GITHUB_TOKEN` (or `GH_TOKEN`) is optional locally; Actions uses its existing token.
- LeetCode queries public GraphQL directly; an HTML profile response is not a prerequisite.
  Access challenges are treated as unavailable, with no challenge bypass.
  Its contest rating is rounded to the nearest integer for display.
- YouTube uses the documented channels statistics API. Optionally configure
  `YOUTUBE_API_KEY` in the build environment or as a repository Actions secret.
  Without a key, the channel remains linked without statistics. Never commit the
  key. See [YouTube API registration](https://developers.google.com/youtube/registering_an_application)
  and [channels.list](https://developers.google.com/youtube/v3/docs/channels/list).
  Hidden subscriber counts are omitted; public counts may already be rounded.

The homepage strip uses the same snapshots, with a link to account details and
snapshot dates. It pauses manually, on pointer hover or keyboard focus, while
outside the viewport, and in background tabs. Without JavaScript or with reduced
motion, its single accessible list wraps statically. The brain section is hidden
at 720px and below; resizing out of an active brain control returns focus to the
hero’s primary action.

## Portfolio refinement configuration

The approved scope and current verification record are in `PLAN.md` and
`IMPLEMENTATION.md`. Personal milestones, the starting age of seven, contact
channels, and résumé To-Do items live in `src/data/site.ts`. Coding experience is
computed approximately from the supplied birth date and starting age; it is not
an exact employment duration. `resumeSettings.draft` is the single draft switch:
the blurred sheet is inert and hidden from assistive technology, while print
shows only the readable draft notice/checklist. No PDF is invented.

### Brain renderer

Set `brainRenderer` in `src/data/brain-renderer.ts` to **`"3d"`** (default) or
**`"2d"`**. Both use the same six IDs, native buttons, sourced descriptions and
panel. The 3D module is dynamically imported only above 720px; the atlas is a
local GLB. WebGL or model failures preserve the SVG. Mobile disposes the renderer
and moves focus out of the hidden region. Rotation is on demand: drag, arrow
keys, Home, or Reset view; no animation loop or automatic rotation.
`brainInitialRotation` in the same configuration file controls both the starting
and reset orientation (anterior three-quarter view, frontal lobe slightly left).

The SPL/NAC MRI atlas is credited beside the model and in
`public/credits/assets.txt`; its 3D Slicer license is retained at
`public/brain/LICENSE.txt`. `region-mapping.json` records the anatomical grouping.
The source atlas includes structures beyond the six simplified educational
regions; the model is not a complete medical segmentation or a personal scan.
`scripts/prepare-brain.py` is an optional build-only asset preparation script
(requires Python 3.12, VTK 9.6.0, NumPy 2.4.3, SciPy 1.17.1 and PyMeshLab
2025.7.post1 in a separate build-only environment). It rasterizes each atlas
surface independently at 0.65mm, unions regional tissue, reconstructs closed
surfaces, and simplifies with topology preservation. Source-backed supporting
white matter, insula and medial anatomy are neutral and non-selectable. Natural
fissures and folds remain; this is an educational simplification, not a complete
medical segmentation. The exporter rejects open/non-manifold edges and assets
above 750KB. It is never run during normal site builds.

The NASA Hubble and USFWS butterfly photographs retain source files under
`photos/licensed/`; small optimized copies are clipped with SVG paths. The
watermarked `photos/satellite.png` preview is preserved and not published.

### Repository evidence

`pnpm sync:evidence` refreshes `src/data/generated/evidence.json`. Normal builds
and the daily workflow run it automatically. Public Git objects are fetched into
ignored `artifacts/repository-cache/`; project dependencies and project code are
never executed. Empty repositories have a null revision and verified zero counts.

- Project commits include every commit reachable from the recorded default-branch
  revision, including merges and all authors.
- Source lines use the vendored, pinned **cloc 2.10** Perl release, with its original
  license header retained. Physical code excludes comments and blank lines;
  documentation, binaries, notebook outputs, dependency/vendor directories,
  generated/build output and minified files are excluded. Tests and examples are
  included; notebook code cells are counted. `.tpp` uses C++ comment rules and
  `.astro` uses cloc’s native Astro rules. The exact language allowlist and directory/file
  exclusions are in `scripts/sync-evidence.ts`. These lexical counts are not a
  measure of complexity or personally authored code.
- GitHub account totals cover all owned public non-fork repositories. Monthly
  commits are attributed by GitHub to the handle, use the preceding 30-day
  committer-date window, and include only default-branch histories. The evidence
  records both window endpoints and observation dates. Stars retain their existing
  complete repository enumeration.
- Source counts are reused by revision and counting rules. Totals publish only
  after complete repository/commit enumeration. Timeouts or partial pagination
  keep valid dated evidence. Individual project counts can refresh independently.
  Account and existing GitHub caches remain compatible; migration does not erase
  previous values.

`pnpm sync:videos` uses the optional server-only `YOUTUBE_API_KEY`, channel uploads
playlist and public video metadata to store at most three latest public videos in
`src/data/generated/videos.json`. Cards link thumbnails rather than embed players.
No key or an unavailable provider keeps the link and any valid dated cache.
LeetCode challenges are not bypassed. Neither provider credentials nor provider
requests are shipped to client code.

Atlas source revision: `bec24db25aad5f7600e2df3becfb1f883e61ff56`. cloc 2.10 SHA-256: `bf59272455172108072a0a106379f7509fd4349bdcfd85203bac038ccd286d83`.
Identical physical files are counted independently (`--skip-uniqueness`); a
whole-process timeout rejects the count instead of accepting partial file counts.
Notebooks are parsed as JSON into code-only temporary source files before cloc,
so saved outputs and JSON formatting cannot change the code total. A configured
local GitHub CLI login may supply authenticated public API reads when anonymous
quota is exhausted; credentials are never extracted or logged.


## Daily account activity

`corepack pnpm sync:activity` refreshes the typed
`src/data/generated/activity.json` cache, also refreshed by normal builds and the
daily workflow. Account IDs come from the same registry as the cards. GitHub uses
its GraphQL contribution calendar through `GITHUB_TOKEN`/`GH_TOKEN`, or an existing
local `gh` login. Only aggregate daily counts are stored; no repository details
or credentials are sent to browsers. Its provider-defined contribution scope is
different from the existing owned-public-repository 30-day commit metric.

LeetCode uses public `matchedUser.userCalendar` responses for every calendar year
needed by the latest 365-day window. Days are UTC dates; the snapshot day is
included and may be partial. A zero is filled only after that complete year's
calendar was successfully validated. A failed year, malformed response, duplicate
date, or incomplete GitHub window preserves the previous dated calendar. Headline
statistics and calendars refresh independently. Missing contest rankings display
“Not available”; neither unavailable calendars nor ratings become fabricated zeroes.

Expanded GitHub and LeetCode cards show static grids, a total, a legend and native
“Daily values” tables. The charts scroll inside narrow cards. Everything works
without JavaScript. No contributions graph is added to the homepage.

## Adding project photographs and screenshots

1. Keep the original file in `photos/projects/` for preservation. This directory
   does **not** automatically publish its contents.
2. Export an optimized WebP, AVIF, JPEG or PNG to `public/projects/`. Use a simple
   lowercase filename with hyphens; resize oversized captures appropriately.
3. In the corresponding `src/content/projects/*.md` frontmatter, replace the
   empty `screenshots` array (or append an entry):

```yaml
screenshots:
  - src: /projects/physics-engine-preview.webp
    alt: "Describe the actual simulation shown"
    caption: null
    kind: screenshot
    width: 1600
    height: 1000
    sources: []
```

Use the image's **actual** intrinsic dimensions, a useful description, and an
optional factual caption. Do not include `public` in the URL. `kind` may be
`screenshot`, `artwork`, or `diagram`. Keep logos and supplied illustrations in
`customArtwork` when they supplement screenshots.

The first screenshot with a `src` becomes the project-card preview. When none is
present, the card uses `customArtwork`; otherwise it retains its explicit missing
visual. The case study displays all supplied screenshots and artwork. Card images
use `object-fit: contain`, so the entire image is visible; approximately 16:10
works well without requiring a crop.

Optional responsive versions must preserve aspect ratio and have unique widths:

```yaml
    sources:
      - src: /projects/physics-engine-preview-800.webp
        width: 800
        height: 500
```

Run `corepack pnpm check` and `corepack pnpm build`, then inspect the homepage,
Projects index and relevant case study at mobile and desktop widths. Project
statistics need no manual changes: they already derive from GitHub API metadata,
recorded default-branch commit history and the pinned source-line counter.

## Photographic motion

The NASA satellite and USFWS butterfly remain real photographic cutouts. They
arrive once when their introduction becomes visible, with credits revealed after
settling. The satellite takes a five-second path from the upper left, briefly passing
over the introduction with small pitch and roll changes before settling. The
butterfly enters from beyond the right edge over 2.6 seconds, banking with rapid
wingbeats, then rests with two gentle beats every eight seconds. Click, tap or
keyboard-activate the butterfly for exactly two additional wingbeats in place.
Pause stops motion and settles an active entrance; offscreen/background and
reduced-motion changes cancel requested beats. Without JavaScript or under
reduced motion, photographs and credits appear immediately in their final layout.
No animation library is used.
