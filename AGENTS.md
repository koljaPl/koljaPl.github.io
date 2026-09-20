# AGENTS.md

## Project Mission

Build a production-quality personal website for **Nicklas Plugin\**.

The website is primarily a personal-brand website. Its purpose is to let people quickly understand:

* who Nicklas is
* what he builds
* what areas of engineering he works in
* his strongest projects
* his experience
* his work in algorithms, competitive/olympiad programming, machine learning, software engineering, and open source
* how to contact or follow him

The site should feel like the personal website of an unusually strong young engineer, not like a startup landing page, résumé template, or generic AI-generated developer portfolio.

Visual quality matters as much as engineering quality.

Read `design.md` completely before making visual decisions.

---

# Sources of Truth

For engineering and architecture:

1. Explicit user instructions
2. `AGENTS.md`
3. Existing project conventions

For visual decisions:

1. Explicit user instructions
2. `design.md`
3. Your own design judgment

You have freedom over low-level implementation and visual details when they are not specified.

Do not reinterpret or weaken explicit constraints.

---

# Version 1 Scope

Implement these public routes:

* `/`
* `/projects`
* `/projects/[slug]`
* `/about`
* `/experience`
* `/contact`
* `/resume`

Also implement:

* a polished custom 404 page
* `robots.txt`
* sitemap
* canonical metadata
* Open Graph metadata
* Twitter/X card metadata
* Person JSON-LD
* appropriate structured metadata for project pages where useful

A blog is **not part of version 1**.

Do not implement:

* `/admin`
* authentication
* a CMS
* Cloudflare
* a backend
* a database
* server-side rendering
* analytics unless explicitly requested later

The architecture should make it easy to add a blog later without restructuring the site.

When a Writing section is eventually added to the homepage, it should appear after Experience and before the final Contact section.

---

# Technology

Use:

* Astro
* TypeScript with strict mode
* Tailwind CSS 4
* static output
* pnpm
* GitHub Pages
* GitHub Actions

React is allowed only for genuinely interactive islands where Astro, semantic HTML, CSS, or a tiny vanilla TypeScript script would be clearly worse.

Prefer, in order:

1. semantic HTML
2. CSS
3. small vanilla TypeScript
4. Astro islands
5. React only when genuinely justified

Do not introduce React merely for:

* navigation
* buttons
* theme switching
* cards
* simple accordions
* hover interactions
* scroll reveal animations

Do not add dependencies without a concrete benefit.

---

# Hosting

The production site is:

`https://koljapl.github.io`

The repository is the GitHub Pages user repository:

`koljaPl/koljaPl.github.io`

Deploy automatically through GitHub Actions.

The site must work correctly from the domain root.

Do not configure a custom domain.

---

# Repository Inspection

Before implementing anything:

* inspect the entire current repository
* inspect existing configuration
* locate the portrait under `/photo/portrait*`
* determine its actual file type and dimensions
* preserve source assets
* do not fabricate replacement assets when real assets already exist

The repository may initially contain almost nothing.

That is expected.

---

# Content Rules

Never invent personal facts.

Do not invent:

* dates
* awards
* companies
* schools
* rankings
* competition placements
* GitHub statistics
* biographies
* quotes
* project metrics
* project descriptions that have not been supplied
* employment history
* social URLs

When content has not yet been supplied, use a clearly identifiable structured placeholder.

Keep placeholders centralized in data files rather than scattering fake content throughout components.

The site may use these known high-level areas:

* software engineering
* open source
* algorithms
* competitive programming
* olympiad programming
* machine learning

Known project categories include:

* TPPL
* a 2D physics engine
* algorithm repositories
* machine-learning projects

Do not invent technical details about those projects until the repository data contains them.

---

# Structured Data

Personal content must not be hard-coded across page components.

Create strongly typed structured data for at least:

* profile
* navigation
* social links
* contact reasons
* experience
* projects
* skills
* timeline

Social architecture must support:

* GitHub
* LinkedIn
* YouTube
* email

Project data must support:

* name
* slug
* repository
* short description
* long description
* role
* technologies
* impact
* featured
* links
* screenshots
* custom artwork
* GitHub metadata
* long-form case study

Project case studies should support sections such as:

* Context / Problem
* Motivation
* Approach
* Architecture
* Implementation
* Interesting Challenges
* Engineering Decisions
* Results / Impact
* What I Learned
* Links

Do not force every project to contain every section.

Use Astro Content Collections for long-form project content when that gives a cleaner typed architecture.

---

# GitHub Metadata

Implement build-time synchronization for configured public GitHub repositories.

At minimum retrieve:

* star count
* repository URL
* primary language when available
* last updated timestamp when useful

Do not make a production deployment fragile because the GitHub API temporarily fails.

Maintain a checked-in generated cache, for example:

`src/data/generated/github.json`

Behavior:

1. try to retrieve fresh metadata
2. validate the response
3. update the generated cache
4. if GitHub is unavailable or rate limited, use the latest valid cached data
5. never replace valid cached data with incomplete or corrupted data

The site should therefore always have the latest successfully retrieved values.

The GitHub Action should run:

* on pushes to the production branch
* manually through `workflow_dispatch`
* automatically on a reasonable daily schedule

Use the repository's GitHub Actions token where possible.

Do not require a personal access token for ordinary public repository metadata unless technically necessary.

Avoid unnecessary commits when generated metadata has not changed.

---

# Homepage Information Architecture

Homepage order:

1. Navigation
2. Hero
3. About Me
4. Selected Projects
5. Experience / compact timeline
6. Contact
7. Footer

Future version:

Experience → Writing → Contact

Do not add Writing in version 1 just to fill space.

---

# Hero

The hero must immediately establish the identity:

**Nicklas Plugin\**

The supporting hierarchy should communicate:

* strong young engineer
* open-source builder
* unusual technical projects
* algorithms / competitive programming
* machine learning

Do not invent a final tagline.

Make the tagline/content easy to edit from structured profile data.

Primary actions should include:

* View Projects
* Contact Me

Secondary destinations should make these easily accessible:

* GitHub
* Resume
* LinkedIn
* YouTube

Do not make the hero resemble a SaaS product landing page.

Do not use enormous marketing copy.

Do not fill the hero with decorative graphics.

---

# Portrait

Use the supplied portrait from `/photo/portrait*`.

The portrait should feel intentional and editorial.

Do not make it the dominant object on the homepage.

Prefer using it in the About section or as a restrained secondary hero element.

Do not:

* put large colored gradients over it
* excessively crop it
* turn it into a floating glass card
* apply gimmicky filters

Optimize the generated image appropriately.

Prevent layout shift by defining dimensions/aspect ratio.

---

# Projects

The projects are one of the most important parts of the website.

Prioritize:

* visual clarity
* screenshots
* engineering context
* technical depth
* easily visible GitHub/source links

The projects index should remain a straightforward, readable list/grid.

Do not add project filtering in version 1.

Featured projects may have stronger visual treatment, but do not build a bento layout.

Use real screenshots when available.

Custom artwork may supplement screenshots, not replace useful project visuals.

Each project detail page should feel like an engineering case study rather than a marketing landing page.

---

# GitHub Activity

Do not put a GitHub contribution graph on the homepage.

The projects page may contain a restrained GitHub/open-source section if it can be implemented reliably.

Do not depend on untrusted third-party contribution-chart embeds merely for decoration.

GitHub repository metadata is more important than an activity graph.

---

# About

The About page should be more personal than the homepage while still being concise.

It may contain:

* portrait
* introduction
* areas of interest
* compact personal timeline
* current focus
* selected milestones

All factual content must come from structured data.

---

# Experience

The Experience page is the primary place for:

* experience
* skills
* technologies
* algorithms / competitive programming
* olympiad programming
* machine learning
* engineering areas

Skills must not use:

* percentages
* progress bars
* arbitrary proficiency scores

Organize skills semantically.

Prefer showing evidence of skill through projects and experience.

---

# Resume

Create a clean HTML resume page.

It must:

* print cleanly
* have dedicated print styles
* remain readable without site navigation when printed
* support a `Download PDF` action

The PDF location must be configurable from structured profile data.

If the actual PDF has not been supplied, do not fabricate personal résumé content or create a fake résumé PDF.

Ensure the missing asset does not create a broken interface.

---

# Contact

Create a dedicated `/contact` page.

There is no backend.

Do not implement a fake contact form.

Use:

* email
* social destinations
* configurable reasons for getting in touch

Examples of UI structure are allowed, but actual contact reasons must be editable structured content rather than fabricated personal statements.

A small copy-email interaction is acceptable.

---

# Dark Mode

Support light and dark themes.

The initial theme must follow the operating system/browser preference using:

`prefers-color-scheme`

A manual theme toggle may override the system preference.

Persist explicit user overrides locally.

Avoid a flash of the wrong theme during initial rendering.

The theme feature must not require React.

---

# JavaScript Budget

Ship as little client-side JavaScript as reasonably possible.

JavaScript is justified for things such as:

* theme override
* accessible mobile navigation when needed
* copy-to-clipboard
* carefully designed reveal behavior
* small easter eggs

Do not use JavaScript for effects CSS handles well.

No heavyweight animation library unless an interaction genuinely requires it.

---

# Accessibility

Target WCAG 2.2 AA.

Requirements:

* semantic landmarks
* logical heading hierarchy
* keyboard-accessible navigation
* visible `:focus-visible`
* minimum body-text contrast of 4.5:1
* accessible icon labels
* appropriate `aria-*` only when needed
* meaningful image alt text
* decorative images hidden from assistive technology
* no interaction requiring a mouse
* no color-only communication
* minimum practical touch target around 44×44px
* `prefers-reduced-motion` support

Reduced-motion mode must remove nonessential transforms and movement.

---

# Performance

Prioritize Core Web Vitals.

Requirements:

* static rendering
* optimized local assets
* responsive images
* explicit image dimensions
* minimal JavaScript
* no unnecessary third-party scripts
* avoid layout shift
* avoid render-blocking resources where reasonably possible
* preload only genuinely critical assets
* lazy-load below-the-fold media
* keep fonts efficient

Target Lighthouse scores of at least 95 for:

* Performance
* Accessibility
* Best Practices
* SEO

Do not game Lighthouse scores at the expense of the actual user experience.

---

# Responsive Design

The site must be deliberately designed, not merely technically responsive.

Verify at least approximately:

* 360–390px mobile
* 768px tablet
* 1024px small desktop
* 1440px desktop
* 1920px large desktop

Avoid:

* accidental horizontal scrolling
* over-wide text
* huge empty areas on desktop
* cramped cards on mobile
* desktop composition simply shrinking into mobile

Mobile is a first-class design target.

---

# Browser Support

Target modern versions of:

* Chrome
* Firefox
* Safari
* Edge
* modern iOS Safari
* modern Android browsers

Do not add legacy-browser compatibility code.

---

# Visual Verification

Use Playwright when available to inspect the real implementation at multiple viewport sizes.

Screenshots are a verification tool, not a source of truth.

During visual review check:

* hierarchy
* spacing
* alignment
* line lengths
* image crops
* overflow
* navigation
* theme behavior
* hover/focus states
* responsive transitions

Fix visual problems before considering a section complete.

---

# Lighthouse Verification

Run Lighthouse against the production build before final completion.

Investigate meaningful regressions rather than blindly changing things for scores.

---

# Tooling

Prefer a small toolchain.

Recommended baseline:

* Astro type checking
* TypeScript strict mode
* Prettier with Astro support
* Playwright for browser verification
* Lighthouse for final auditing

Do not add ESLint/Biome plus several overlapping formatters unless the repository clearly benefits from them.

Do not install a library merely to avoid writing a few lines of simple code.

---

# Validation Commands

Create appropriate package scripts so the equivalent of these operations is easy:

* format check
* Astro/type check
* production build
* browser/visual verification
* Lighthouse audit when appropriate

At minimum, after every major implementation phase:

1. run type checking
2. run the production build
3. inspect affected responsive layouts
4. fix discovered problems before continuing

Before final completion, run the full validation suite.

---

# Implementation Workflow

At the beginning:

1. inspect the repository
2. read `AGENTS.md`
3. read `design.md`
4. inspect supplied assets
5. produce a concise implementation plan in chat

The plan should be short and useful.

Do not create a long planning document.

Do not stop after producing the plan unless a genuine external blocker exists.

Then implement incrementally.

A sensible implementation sequence is:

1. project/tooling foundation
2. design tokens and global styles
3. data architecture
4. global shell and navigation
5. homepage
6. projects and project case studies
7. about
8. experience and skills
9. resume
10. contact
11. dark mode and interaction polish
12. GitHub metadata synchronization
13. SEO
14. GitHub Pages deployment
15. responsive/accessibility/performance audit
16. final visual polish

---

# Quality Bar

Do not stop at "works".

The final site should feel intentionally designed.

Before considering it finished, ask:

* Does this look custom-made for Nicklas rather than generated from a template?
* Is the visual hierarchy obvious within five seconds?
* Do the four Google accent colors feel balanced?
* Is the interface still mostly neutral?
* Do the projects look important?
* Does the site communicate engineering depth?
* Is there unnecessary visual noise?
* Does mobile feel intentionally designed?
* Does dark mode feel designed rather than inverted?
* Are interactions pleasant without becoming distracting?
* Is every animation earning its place?
* Is the code simpler than an equivalent React-heavy implementation?
* Would removing an element make the site better?

Prefer refinement over adding more elements.
