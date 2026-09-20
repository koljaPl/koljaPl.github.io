# Refine Nicklas Plugin’s portfolio, project evidence, and interactions

Approved specification, September 16, 2026. Preserve Astro, strict TypeScript,
Tailwind 4, static output, pnpm, GitHub Pages, the supplied portrait, and all
current text edits. No deployment is included.

## 1. Preserve content and establish the implementation record

- Keep this approved specification in PLAN.md. Track phase checklists, changes,
  checks, asset sources, unresolved content, and the next step in IMPLEMENTATION.md.
- Move supplied personal text into structured content without changing its wording
  or callout presentation.
- Preserve TPPL’s “Active” as a separate development status; retain publication
  status for page readiness.
- Centralize LinkedIn https://www.linkedin.com/in/niklas-plugin/ and email
  nikolya.plugin@gmail.com and expose them through existing contact components.

| Period                | Milestone                                                |
| --------------------- | -------------------------------------------------------- |
| Childhood–present     | Classes in mathematics, logic, and physics               |
| Age 7                 | Started programming with Pascal and Scratch              |
| Age 12                | Began building websites with basic front-end development |
| Late age 13           | Learned Python                                           |
| Age 14                | Advanced Python work and back-end development            |
| Age 15                | Began competitive programming and Go                     |
| Late age 15           | Began studying machine learning                          |
| August–September 2026 | Two-month internship at an IT company                    |
| Present               | Participation in computer-science and AI competitions    |
| Future goal           | Apply to leading universities for Computer Science       |

Keep future goals separate from achievements. Do not invent internship company,
role details, or competition results. Do not treat statistics as proof of ability.
Store the coding start age (7); show approximately nine years at present with
explicit approximate wording and the starting age.

## 2. Complete projects and extend verified statistics

Preserve current routes and populate projects from documentation and source:

| Project                                | Repository                          |
| -------------------------------------- | ----------------------------------- |
| TPPL — The Pseudo Programming Language | koljaPl/pseudo-programming-language |
| 2D Physics Engine                      | koljaPl/2-squares-collapse          |
| Algorithms                             | koljaPl/algorithms                  |
| ML Problems                            | koljaPl/ml-problems                 |

Write concise descriptions, technologies, architecture, implementation, and
limitations. Separate implemented and planned features; invent no results and
claim no repository test passes without execution. Use supplied TPPL artwork;
use other supplied images if available, otherwise keep explicit missing-image
treatment while completing written content.

- Project commits: all commits reachable from recorded default-branch revision,
  including merges and all authors.
- Source lines: physical source lines excluding comments, blanks, generated and
  vendor files, dependencies, binaries, documentation, and notebook outputs;
  include tests, examples, and notebook code cells.
- Pin build-only cloc and record counting rules and version.
- GitHub monthly commits: account-attributed commits in the preceding 30 days
  across owned public non-fork repositories’ default branches.
- GitHub code total: current source lines across that same scope, labeled as
  repository code rather than individually authored lines.
- GitHub stars: sum across owned public non-fork repositories.
- Extend typed snapshots with scope, revisions, and individual observation dates.
  Preserve existing values in migration. Require complete enumeration before
  publishing totals. Retain dated valid values on failure. Cache lines by revision.
- Refresh in builds and the daily workflow; never execute downloaded project code.

Account cards:

- LeetCode: solved problems and contest rating; expanded coding experience and
  existing verified details.
- GitHub: 30-day commits, source lines, and stars; expanded coding experience,
  definitions, and dates.
- YouTube: subscribers only when collapsed; latest three verified public videos
  expanded as linked thumbnails/titles, without embedded players.
- Preserve Codeforces, Eolymp, and AtCoder cards.
- Use optional YouTube API credentials and uploads playlist. Access challenges or
  missing credentials retain useful links and honest unavailable states.

## 3. Refine page layouts

### Homepage

- Keep primary action hierarchy. Add a separate neutral GitHub button beneath;
  remove YouTube from the hero only.
- Add gently irregular underlines in the hero description: software engineering
  blue, algorithms red, olympiad gold, machine learning deep emerald; neutral text.
- Remove the statistics strip heading/control row. Link each statistic to its
  About account card, opening its disclosure and revealing its heading.
- Keep a small inline pause/play icon, hover/focus/offscreen pause, reduced-motion
  static wrapping, and one accessible content copy.

### About and Experience

- Populate Milestones and existing Experience data with supplied information.
- Preserve personal introduction and portrait.
- Increase yellow-callout body text to about 16–17px with comfortable leading.

### Projects imagery

- Place a restrained satellite cutout right of the introduction, stacking below
  on phones. Use NASA’s real Hubble photograph with Earth background isolated:
  https://science.nasa.gov/image-detail/28045752710_6a9cca2c72_k/
- Credit the source. Preserve the watermarked user preview unchanged and do not
  publish it as the finished asset or imply participation in the satellite project.

### Résumé draft

- One configuration value controls draft mode. Blur and make the résumé sheet
  inert and hidden from assistive technology; keep navigation and a readable
  “Résumé in progress” overlay usable.
- Structured To-Do list: internship details, education/application information,
  competition details, final wording, PDF.
- Disable site print/download controls while draft. Browser print shows a clean
  draft notice/checklist. Retain noindex.

## 4. Genuine 3D and restrained motion

### Brain

- Typed renderer setting “3d” | “2d”, default 3d; document in README.
- Share existing SVG, six IDs, controls, facts, associations, and panel between
  renderers. Derive optimized local geometry from SPL/NAC Brain Atlas:
  https://www.openanatomy.org/atlas-pages/atlas-spl-nac-brain.html
- Retain attribution and license. Lazy-load Three.js without React, justified by
  real rotation/picking. Neutral materials, restrained detail, soft lighting;
  no autorotation, glow, or large textures.
- Drag and keyboard rotation, reset, native region selection. Distinguish dragging
  from clicking. Highlight only selected region with muted mauve, rose, slate
  teal, copper, lavender, or blue-grey plus outline and text.
- Center full disclaimer beneath “A map of interests.” Preserve Clear/Escape,
  announcements, no-JS text alternative, and normal-flow panel.
- Hide at ≤720px without downloading 3D assets. Automatically fall back to SVG
  on WebGL/model failure. Render on demand; stop when hidden.
- Target model below 750KB and compressed renderer bundle below 200KB.

### Name

Readable letters throughout ~600ms color-to-neutral entrance. Short staggered
accent color on hover, neutral on exit. No scrambling, layout shift, or repeated
announcements. Reduced motion starts settled.

### Butterfly

A licensed real photograph, credited, near About introduction. Separately masked
wings make two gentle beats approximately every 20 seconds; no body wobble or
flight. Small pause control; stop offscreen and in reduced motion. Do not copy
Google’s asset.

## 5. Validation and separate polish

After each major phase: Astro/type check, production build, responsive inspection,
fixes, and implementation-record update.

Add tests for complete pagination, author filtering, date windows, source-line
exclusions/notebooks, migrations/failure preservation, project readiness and
links/images, contact and milestones, approximate experience, account deep links,
videos, ticker navigation/pause/no-JS, 3D rotation/picking/reset and synchronization,
2D configuration, WebGL fallback, mobile unloading/focus, name/butterfly reduced
motion, callout typography, and résumé draft accessibility/printing.

Inspect 390, 720/721, 768, 1024, 1440, 1920px in both themes, intermediate header
widths, and 200% zoom. Separate visual-polish pass, then full validation, visual
suite, and production Lighthouse ≥95 in all four categories. Report per-route
scores, asset sizes, unavailable statistics, and remaining gaps.

## Follow-up: brain, photographic motion, and daily activity

Approved 17 September 2026. Preserve architecture, supplied text, project content,
all unrelated edits and existing repository-statistics counting rules.

1. Reconstruct the six atlas regions as closed manifold surfaces, repair normals
   and internal faces, restore neutral non-selectable supporting anatomy, and add
   subtle neutral seams. Retain IDs, controls, 2D fallback, mobile exclusion and
   the 750KB model / 200KB gzip renderer budgets.
2. Enlarge the NASA satellite to approximately 380px, settle at −8° after a single
   1.4s flight from the left. Enlarge the butterfly to approximately 230px, emerge
   from behind the page over 1.2s, then make two wingbeats every eight seconds.
   Credits fade in over 180ms after settling, with shaded hover/focus states.
   Reserve layout space, shorten mobile paths, support pause/offscreen and show
   static final states without JavaScript or under reduced motion.
3. Remove approximate coding-experience text from GitHub/LeetCode expanded cards.
   Add complete 365-day calendars: GitHub contributions, LeetCode submissions.
   Repair LeetCode by removing the HTML prerequisite; validate direct GraphQL
   responses and display unavailable contest rating honestly. Typed dated caches,
   independent provider failures, atomic writes, build/daily refresh, no browser
   provider calls. Static grids, month labels, totals, legend, accessible native
   daily-values tables and contained mobile scrolling. Preserve existing metrics.
4. Document images: originals in photos/projects, optimized public/projects
   images referenced by project frontmatter with correct dimensions, alt text and
   optional same-aspect responsive variants. First screenshot previews the card;
   artwork is its fallback. Folder placement alone does not publish an image.
5. Add topology, provider, calendar and motion coverage. Check/build and inspect
   each phase, review seven widths in both themes, separately polish, run full
   validation/visual/Lighthouse suites (≥95). Record actual results, sizes and gaps.
   No deployment.

## Motion follow-up — 20 September 2026

- Slow the satellite to a 3.8-second upper-left approach, with subtle pitch/roll
  and a brief pass over the introduction before settling beside it.
- Give the photographic butterfly a banking, wing-driven approach and a click,
  touch or keyboard departure, with a stationary bring-back control. Preserve
  pause, no-JavaScript, reduced-motion and interruption behavior.
- Turn the initial/reset 3D brain to an anterior three-quarter view, with frontal
  anatomy slightly left of center. Preserve geometry and shared selection.
- Check/build, inspect responsive motion and both themes, polish separately,
  then run the full validation and visual suites. No deployment.

### Latest motion adjustment — 20 September 2026

Preserve the existing working tree. Extend the satellite approach to five seconds
from the upper left, briefly overlapping text. The butterfly enters from beyond
the right viewport edge; activation triggers exactly two wingbeats in place,
replacing the departure/recall behavior. Retain pause, reduced motion, static
fallbacks and delayed credits. Verify responsive flight paths, keyboard/touch
activation, interruption, then complete full validation and visual polish.
