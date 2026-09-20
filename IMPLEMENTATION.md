# Implementation record

Approved scope: PLAN.md. Work preserves existing uncommitted changes. No deployment.

## Phases

- [x] 1. Structured supplied content, contact channels, milestones, tracking files.
- [x] 2. Verified project descriptions and repository/account metrics.
- [x] 3. Homepage, cards, résumé draft, and photographic assets.
- [x] 4. Shared 2D/3D brain and restrained name/butterfly motion.
- [x] 5. Separate visual polish and full validation.

## Current state

Repository inspected; AGENTS.md, design.md, and README.md read. Original portrait
is photos/portrait.jpg (512×512 JPEG). Supplied TPPL artwork is 1262×733 PNG.
photos/satellite.png is a watermarked stock preview and remains unchanged.

Original scope completed on 17 September 2026; the brain, photographic motion and
activity follow-up completed and validated on 18 September 2026. No unfinished
implementation step remained in that scope. The new 20 September motion follow-up
is recorded at the end of this file. Future content work is listed below;
publication was not requested or performed.

## Content boundaries

- Personal text and age milestones come from Nicklas’s explicit supplied content.
- Internship: August–September 2026, two months; company and responsibilities unknown.
- Competition results, institution names, and résumé PDF are not supplied.
- LeetCode public statistics and calendars now work; contest rating is unavailable
  in the provider response. YouTube requires an optional API key.
- Only TPPL currently has supplied project artwork.

## Verification

Phase 1: Astro check passed (0 errors/warnings/hints); production build passed (11 pages). Browser inspection captured 390, 768, 900, 901, 1024, 1440, 1920px in both themes, with no visible header/hero overflow. Desktop screenshot reviewed. Supplied biography, motto, age milestones, internship, contact details and draft settings are now structured. TPPL development status is independent of publication readiness.

## Sources and assets

- Brain anatomy: existing Johns Hopkins Medicine and NIMH references.
- Geometry: SPL/NAC Brain Atlas (Open Anatomy Project), with license retained.
- Satellite: NASA Hubble photograph, May 2009.
- Project content: supplied public repositories; no downloaded project code executed.

## Phases 2–4

- Read the four repositories’ documentation and representative implementation files.
  All existing routes now have published source-backed case studies. TPPL retains
  its separate Active development label and supplied artwork. Other screenshots,
  role details and measured impact remain explicitly unspecified.
- Added revision-aware commit/source evidence, complete GitHub account totals,
  coding experience labels and optional uploads-playlist video snapshots. The
  source counter is pinned to cloc 2.10; notebooks are parsed into code-only
  temporary files before counting. No repository code was executed.
- Added the separate GitHub hero action, four phrase underlines, native account
  deep links, icon-only strip control, readable résumé draft overlay and To-Do list.
- Added a locally optimized SPL/NAC mesh, Three.js on-demand rotation/picking,
  desktop-only loading, shared SVG fallback and controls, muted selections,
  centered disclaimer, name color sequence and controllable photographic butterfly.
- Added NASA Hubble photo and public-domain USFWS butterfly with SVG cutouts and
  source credit. Supplied portrait and watermarked preview are preserved.

Checks: production builds passed for project/layout and interaction phases;
Astro checks passed before expanded tests (0 errors/warnings/hints). The initial
19-test unit run passed, including a discovered/fixed compact-notebook parsing
case. Browser captures covered 14 header/hero width/theme combinations. Rendered
home/About/Projects/résumé reviewed; visual pass adjusted satellite masking and
mesh smoothness. Final expanded verification follows.

Asset evidence: atlas GLB 643,268 bytes. Six-region mapping and original license
are distributed with the model. Full source URLs and credit are in
public/credits/assets.txt. Original photos remain in photos/licensed/.

## Phase 5 — separate polish and final verification

Completed after feature implementation:

- Stabilized the brain illustration and toolbar frame so loading the 3D renderer
  does not shift the hero layout. Reviewed the neutral mesh, six selection colors,
  satellite mask, butterfly, responsive composition, and expanded account panels.
- Fixed a pause-button pointer/focus race by updating its existing icon rather
  than replacing DOM during a click; retained keyboard access to ticker links.
- Abort pending model downloads on mobile resize, restore focus out of the hidden
  region, and allow later desktop restoration. Model fetches have a bounded timeout.
- Hardened source counting for native Astro, identical physical files, notebook
  code cells and malformed notebooks. Whole-counter failures preserve the cache.
- Completed public-video pagination coverage, including unavailable uploads, and
  tested optional-data behavior without requiring live credentials.

Final commands (production build, 17 September 2026):

| Check                       | Result                                                                |
| --------------------------- | --------------------------------------------------------------------- |
| `corepack pnpm validate`    | Passed, including formatting, units, Astro, build, E2E and Lighthouse |
| Unit tests                  | 20 passed                                                             |
| Astro/type check            | 61 files; 0 errors, warnings or hints                                 |
| Production build            | 11 static pages                                                       |
| Playwright Chromium         | 47 passed                                                             |
| `corepack pnpm test:visual` | 3 passed against the final production build                           |

Visual captures and overflow checks cover all 11 routes at 390, 720, 721, 768,
1024, 1440 and 1920px in light and dark themes, plus selected brain panels and
expanded account cards. Browser interaction tests cover both sides of the 900px
header breakpoint, a 640 CSS-pixel viewport equivalent to 200% zoom on a 1280px
window, no JavaScript, reduced motion, keyboard/touch selection, picking,
rotation/reset, failure fallback, mobile unloading, focus restoration, name and
butterfly behavior, account navigation and résumé accessibility/printing.
This was Chromium automation with software WebGL; real-device, Firefox and Safari
manual checks were not run. Repository project test suites were not executed.

Lighthouse used one production-build run per indexable route. Scores are
Performance / Accessibility / Best Practices / SEO:

| Route                         | Performance | Accessibility | Best Practices | SEO |
| ----------------------------- | ----------: | ------------: | -------------: | --: |
| `/`                           |         100 |           100 |            100 | 100 |
| `/projects/`                  |         100 |           100 |            100 | 100 |
| `/projects/tppl/`             |         100 |           100 |            100 | 100 |
| `/projects/physics-engine/`   |         100 |           100 |            100 | 100 |
| `/projects/algorithms/`       |         100 |           100 |            100 | 100 |
| `/projects/machine-learning/` |         100 |           100 |            100 | 100 |
| `/about/`                     |         100 |           100 |            100 | 100 |
| `/experience/`                |         100 |           100 |            100 | 100 |

Contact, résumé and 404 intentionally retain `noindex` and are excluded from the
Lighthouse SEO threshold gate; they are covered by browser/accessibility checks.
Reports: `artifacts/final-validation.log`, `artifacts/final-visual.log`,
`artifacts/lighthouse/manifest.json`, `artifacts/visual/` (ignored local artifacts).

Final asset budgets: atlas GLB **643,268 bytes**; lazy renderer bundle
**153,429 bytes gzip**, below the 750KB/200KB targets. The model and renderer are
not requested at mobile widths. Renderer selection is documented in README.md
and configured through `src/data/brain-renderer.ts`.

Final verified project snapshots:

| Repository                  | Reachable commits | Physical source lines |
| --------------------------- | ----------------: | --------------------: |
| pseudo-programming-language |               124 |                29,385 |
| 2-squares-collapse          |                36 |                 1,690 |
| algorithms                  |               510 |                13,588 |
| ml-problems                 |                 7 |                   168 |

GitHub aggregate: **284 commits** in the preceding 30 days, **70,929 repository
source lines**, **13 stars**, across 35 owned public non-fork repositories. The
cache records individual dates, counting scopes, revisions and the rolling window;
these are repository observations, not evidence of individually authored lines
or professional proficiency.

## Remaining external content and unavailable providers

- Initial LeetCode HTML access returned HTTP 403. This was resolved in the follow-up
  by using its working public GraphQL endpoint directly; only contest ranking remains unavailable.
- YouTube API credentials absent: channel retained, subscribers/videos unavailable.
  Optional-key adapter and three-public-video rendering are implemented and tested
  with validated fixtures; live credentialed behavior was not exercised.
- Eolymp fresh fields could not be verified: valid 15 September 2026 cache retained.
- Internship company/responsibilities, education/application details, specific
  competition results, final résumé wording and real PDF remain to be supplied.
- Three projects lack supplied images; role and measured-impact fields remain
  explicit placeholders where unsupported. Case-study descriptions are complete.
- Supplied stock satellite preview remains unchanged and unpublished. Only the
  credited NASA photograph is used on the site.

No remote publication, commit, reset or replacement of unrelated user edits was
performed.

## Follow-up implementation — 17 September 2026

- [x] A. Repair atlas geometry and verify six clean selectable regions.
- [x] B. Photographic entrances, larger assets and settling credits.
- [x] C. LeetCode repair and daily contribution/submission calendars.
- [x] D. Image documentation, separate polish and final validation.

Initial inspection found open and non-manifold edges in all six regions. These
are now repaired. LeetCode's direct public GraphQL endpoint and GitHub's 365-day
calendar work without bypassing access challenges. Follow-up implementation and validation are complete.

### Follow-up A–B complete

Reconstructed atlas solids at 0.65mm with independent source unions and pinned
build-only PyMeshLab topology-preserving decimation. Added non-selectable atlas
supporting tissue and neutral region seams. Final model: 595,632 bytes; all seven
meshes have zero boundary/non-manifold edges. Six selectable IDs retained.
Reviewed left/right/front/rear/top/underside captures. Enlarged photographic
entrances settle before credits; butterfly wingbeats now repeat every eight
seconds, with reduced-motion/no-JS and interruption fallbacks.

Validation: Astro 0 errors/warnings/hints; production build 11 pages; 13 targeted
Chromium tests passed; 3 responsive visual tests passed. Captures span seven
widths and both themes; desktop Projects and mobile About manually reviewed.
Logs: artifacts/refine-visual-build.log, refine-photo-check.log,
refine-motion-browser.log, refine-motion-visual.log; topology report in
artifacts/research/brain-topology.json. No project counting rules changed.

Next step: C — typed 365-day activity snapshots, LeetCode repair and account UI.

### Follow-up C complete

Removed the LeetCode HTML gate, validated solved/difficulty/optional contest
fields, and independently synchronized complete GitHub contribution and LeetCode
submission calendars. Added typed 365-day cache validation, cross-year retrieval,
atomic persistence, failure preservation, daily workflow support and native static
calendar/table cards. Approximate coding duration was removed from the cards.
LeetCode now reports 1,156 solved problems; its contest ranking is genuinely null.
First verified calendars contain 1,480 GitHub contributions and 3,163 LeetCode
submissions (2025-09-18 through 2026-09-17; later builds may refresh these values).

Validation: 27 unit tests passed; Astro checked 71 files with zero errors,
warnings or hints; production build passed. 17 targeted browser tests passed.
The visual test initially toggled previously open disclosures closed after
same-URL navigation; corrected the test to open parent cards before daily tables.
All 3 responsive visual tests now pass at all seven widths in both themes.
Logs: artifacts/refine-activity-{unit,check,build,browser,visual}.log.

Project photo instructions and example frontmatter are now in README.md. Existing
GitHub project-statistics logic remains unchanged. Final visual polish and full
validation are next.

### Follow-up D — final polish and validation complete, 18 September 2026

Performed a separate visual review of all seven width/theme combinations for the
home, Projects and About introductions, six brain orientations, and expanded
account cards. Corrected spacing between activity totals and labels and increased
photographic credit text slightly. The portrait and existing content remain
unchanged. Project image instructions now explain source preservation, optimized
public assets, frontmatter, actual dimensions, previews and responsive variants.

Final production validation:

| Check                       | Result                                                                         |
| --------------------------- | ------------------------------------------------------------------------------ |
| `corepack pnpm validate`    | Passed, exit 0                                                                 |
| Formatting                  | Passed                                                                         |
| Unit tests                  | 27 passed, including closed manifold geometry and activity/provider validation |
| Astro/type check            | 71 files, 0 errors/warnings/hints                                              |
| Production build            | 11 static pages                                                                |
| Playwright Chromium         | 57 passed                                                                      |
| `corepack pnpm test:visual` | 3 passed (44.0s), final production build                                       |

Visual coverage: 390, 720, 721, 768, 1024, 1440 and 1920px, both themes, all 11
routes; selected brain panels and expanded cards with daily tables. Native cards,
no JavaScript, keyboard/touch controls, no mobile mesh downloads, photo credit
reveal, interruption/reduced-motion behavior, and both daily calendars are covered.
A test-only disclosure-state issue was fixed rather than changing working UI.
Chromium used software WebGL; manual Safari/Firefox and physical-device checks
were not run. This is local validation, not a remote deployment.

Latest Lighthouse results, one production run per route:

| Route                         | Performance | Accessibility | Best Practices | SEO |
| ----------------------------- | ----------: | ------------: | -------------: | --: |
| `/`                           |         100 |           100 |            100 | 100 |
| `/projects/`                  |          99 |           100 |            100 | 100 |
| `/projects/tppl/`             |         100 |           100 |            100 | 100 |
| `/projects/physics-engine/`   |         100 |           100 |            100 | 100 |
| `/projects/algorithms/`       |         100 |           100 |            100 | 100 |
| `/projects/machine-learning/` |         100 |           100 |            100 | 100 |
| `/about/`                     |         100 |           100 |            100 | 100 |
| `/experience/`                |         100 |           100 |            100 | 100 |

All ≥95 assertions passed. Intentional noindex routes (Contact, résumé, 404)
retain their behavior and browser/accessibility coverage, without an SEO-score gate.
Logs: `artifacts/refine-final-validation.log`, `artifacts/refine-final-visual.log`;
per-route reports in `artifacts/lighthouse/manifest.json`, final screenshots in
`artifacts/visual/`. Visual-review collages are ignored local artifacts.

Final model: **595,632 bytes**; lazy renderer: **153,612 bytes gzip**. Atlas license
and source-to-region mapping remain distributed. All six selectable regions plus
neutral supporting anatomy are closed manifolds; the existing SVG fallback remains.

Latest activity snapshot covers **2025-09-19–2026-09-18** (UTC), including a partial
last day: **1,480 GitHub contributions**, **3,163 LeetCode submissions**, exactly
365 dates per provider. LeetCode headline total is **1,156 solved** (722 easy,
330 medium, 104 hard). Contest ranking is null and displayed as “Not available”.
YouTube still requires credentials; Eolymp retains its valid dated snapshot.
Existing project-statistics definitions and implementation were left unchanged.

All follow-up steps are complete. Remaining content gaps are unchanged: three
project images, unsupplied internship/education/competition details, final résumé
wording and its actual PDF. No deployment or commit was performed.

## Motion follow-up — 20 September 2026

- [x] Inspect current instructions, implementation, preserved assets and prior results.
- [x] Implement slower satellite flight, butterfly arrival/departure and brain view.
- [x] Check/build and responsive motion review.
- [x] Separate polish, full validation, visual suite and Lighthouse.

Astro checked 72 files with zero errors/warnings/hints. Production build passed
(11 pages); 18 targeted Chromium tests passed, including the seven-width flight
matrix in both themes, actual satellite/text overlap, keyboard and touch departure,
recall/focus, no JavaScript, reduced-motion interruption and brain reset/picking.
Manually inspected new three-quarter brain and in-flight desktop/tablet/mobile
captures. Existing portrait, photograph sources, geometry and personal text kept.
Logs: artifacts/motion-check.log, motion-build.log, motion-browser.log.

Separate polish review: checked layer ordering, text overlap duration, final photo
alignment, wing hinges and focus target sizing. Satellite remains below navigation
and cannot intercept text links. Flight credit timing now follows the actual CSS
duration rather than the old fixed 1.8-second timeout. Butterfly retains a stationary
44px recovery control. No further visual corrections were needed after review.

Next step: full validation, final responsive suite and production Lighthouse.

### Latest requested motion adjustment — in progress

The existing uncommitted motion work was preserved and refined: five-second
satellite flight, butterfly arrival from the right, and two wingbeats on native
button activation. Removed departure/recall behavior to match the latest request.
Updated lifecycle handling, browser tests and README. No images or personal text
changed. Next: check/build, responsive inspection, polish and final validation.

Latest motion phase checks: Astro checked 72 files with no errors/warnings/hints;
production build completed all 11 pages; 27 unit tests and 10 targeted motion
browser tests passed. Responsive flight captures cover seven widths in both themes.
Separate polish corrected the butterfly being partially occluded by the mobile
introduction and softened the satellite's final deceleration. Preserved the
existing brain orientation and all unrelated changes. Final full validation is next.

### Motion follow-up complete — 20 September 2026

Final behavior: the satellite takes five seconds to approach from the upper left,
briefly crosses above the introduction without intercepting links, and settles
beside it. The butterfly enters from beyond the right edge with banking and
flight wingbeats. Click, touch, Enter or Space produces exactly two wingbeats
in place. Periodic resting beats, pause, offscreen/background cancellation,
reduced-motion and no-JavaScript fallbacks remain. Credits reveal after landing.
No dependencies, replacement photographs, personal-content edits or deployments.

Separate polish removed mobile butterfly occlusion and eased the satellite's
final deceleration. Manually reviewed in-flight desktop/tablet/mobile captures
in both themes. Responsive automation covers 390, 720, 721, 768, 1024, 1440 and
1920px; all eleven routes are included in the final static visual suite.

Final `corepack pnpm validate` passed (exit 0): formatting, 27 unit tests,
Astro/type checking (72 files, zero errors/warnings/hints), 11-page production
build, 61 Chromium tests and Lighthouse. `corepack pnpm test:visual` passed all
3 tests against the final production build. Tests verify right-edge entry,
satellite/text overlap, exactly two requested wingbeats, keyboard/touch activation,
pausing, interruption, static fallbacks and responsive overflow.

Lighthouse (Performance / Accessibility / Best Practices / SEO):

| Route                         | Scores                |
| ----------------------------- | --------------------- |
| `/`                           | 100 / 100 / 100 / 100 |
| `/projects/`                  | 99 / 100 / 100 / 100  |
| `/projects/tppl/`             | 100 / 100 / 100 / 100 |
| `/projects/physics-engine/`   | 100 / 100 / 100 / 100 |
| `/projects/algorithms/`       | 100 / 100 / 100 / 100 |
| `/projects/machine-learning/` | 100 / 100 / 100 / 100 |
| `/about/`                     | 99 / 100 / 100 / 100  |
| `/experience/`                | 100 / 100 / 100 / 100 |

All >=95 gates passed; intentional noindex routes retain browser coverage.
Logs: `artifacts/motion-latest-validation.log`, `artifacts/motion-latest-visual.log`,
`artifacts/motion-polish-browser.log`; reports in `artifacts/lighthouse/`.
Chromium/software-WebGL only; physical-device, Safari and Firefox checks were
not run. Existing unavailable provider/content states remain unchanged.
All requested motion work is complete. No next implementation step remains.
