# Nicklas Pluhin — Personal Website Design System

## Direction

### Playful Precision

A premium, restrained developer identity with small moments of color, motion, and personality.

The website should feel:

* technical
* confident
* precise
* youthful
* curious
* crafted
* modern
* slightly playful

It must not feel:

* corporate
* childish
* like a SaaS landing page
* like a résumé template
* like an AI-generated portfolio
* over-designed
* excessively minimal to the point of having no personality

The central tension is:

**serious engineering + playful curiosity**

Reference qualities:

* leerob.com — information hierarchy and restraint
* kentcdodds.com — personality and confidence
* joshwcomeau.com — thoughtful interaction details
* gleam.run — visual consistency and cohesive identity

Do not copy layouts, illustrations, components, or branding from these sites.

---

# 1. Core Visual Principle

## Neutral First. Color as Signal.

The interface should be approximately:

**85–92% neutral**
**8–15% accent**

The four Google colors are equal members of the identity:

* Blue `#4285F4`
* Red `#EA4335`
* Yellow `#FBBC05`
* Green `#34A853`

No single one is the site's "primary color".

In particular:

**blue must not become the default primary-action color.**

Primary buttons should usually be neutral.

Color should function as:

* identity
* rhythm
* state
* emphasis
* small visual surprises

not as the canvas of the website.

---

# 2. Accent Balance

Across a page, deliberately rotate accent colors.

Repeated components should naturally cycle:

Blue → Red → Yellow → Green

Examples:

* project accents
* timeline nodes
* tiny metadata markers
* decorative rules
* section details
* hover details

Do not mechanically rainbow-color every component.

The user should perceive all four colors across the experience without feeling that the website itself is colorful.

### Signature Four-Color Motif

Using all four colors together is allowed only in small identity moments such as:

* four tiny dots
* a short four-segment rule
* a favicon detail
* a tiny loading/state indicator
* a subtle footer signature
* a small interactive easter egg

Never use four-color:

* giant text
* large gradients
* full backgrounds
* oversized borders
* huge hero artwork

---

# 3. Light Theme

Suggested semantic tokens:

* `--bg`: `#FBFBFC`

* `--surface`: `#FFFFFF`

* `--surface-subtle`: `#F5F6F7`

* `--surface-hover`: `#F0F1F3`

* `--text`: `#17181A`

* `--text-secondary`: `#545860`

* `--text-muted`: `#747981`

* `--border`: `#E4E6EA`

* `--border-strong`: `#D4D7DC`

Brand accents:

* `--blue`: `#4285F4`
* `--red`: `#EA4335`
* `--yellow`: `#FBBC05`
* `--green`: `#34A853`

Avoid absolute black.

Avoid large areas of tinted backgrounds.

---

# 4. Dark Theme

Dark mode is a separately designed theme, not an inversion filter.

Suggested tokens:

* `--bg`: `#0E1013`

* `--surface`: `#14171B`

* `--surface-subtle`: `#191D22`

* `--surface-hover`: `#20242A`

* `--text`: `#F2F3F5`

* `--text-secondary`: `#B2B6BD`

* `--text-muted`: `#858B95`

* `--border`: `#292E35`

* `--border-strong`: `#373D46`

Keep the same four brand accent identities.

Slightly adjusted accent tints may be used for accessible text/state combinations.

Do not lower contrast merely to make the dark theme look "soft".

---

# 5. Accent Accessibility

Do not assume every brand color works as text.

Particularly:

* yellow should generally not be body text on a light background
* colored text must meet contrast requirements
* decorative color may have lower contrast only when it communicates no information

Use neutral foreground colors for most buttons and labels.

A small yellow dot is good.

A yellow paragraph is not.

---

# 6. Typography

Avoid the stereotypical modern AI/SaaS combination of giant geometric headings and excessive mono text.

Preferred pairing:

### Primary

**Instrument Sans Variable**

Use for:

* navigation
* body
* headings
* buttons
* UI

### Technical

**IBM Plex Mono**

Use sparingly for:

* GitHub stars
* repository metadata
* dates
* technical labels
* code
* small engineering details

Mono text is an accent, not the default developer aesthetic.

Self-host fonts or otherwise load them in a way that minimizes layout shift and render blocking.

Use sensible system fallbacks.

---

# 7. Type Scale

Use fluid typography with `clamp()`.

Suggested direction:

### Display / Hero Name

`clamp(3rem, 6vw, 5rem)`

Weight:
650–750 depending on the font implementation.

Line height:
0.98–1.05.

### H1

`clamp(2.4rem, 5vw, 4rem)`

### H2

`clamp(1.8rem, 3vw, 2.6rem)`

### H3

`clamp(1.25rem, 2vw, 1.6rem)`

### Body Large

`1.125rem–1.25rem`

### Body

`1rem–1.0625rem`

### Small

`0.875rem`

### Technical Label

`0.75rem–0.875rem`

Do not use all-uppercase headings.

Uppercase may be used for very small technical labels with increased letter spacing.

---

# 8. Layout

Primary content container:

approximately `1160–1200px` maximum.

Default side padding:

* mobile: `20px`
* tablet: `32px`
* desktop: `40px`

Long-form readable content:

approximately `720–780px`.

Project case studies may expand to roughly `900px` for diagrams/screenshots while keeping prose narrower.

Use whitespace generously, but not theatrically.

Do not create huge empty vertical gaps merely to look premium.

---

# 9. Spacing

Base system:

4px / 8px.

Common spacing:

* 4
* 8
* 12
* 16
* 24
* 32
* 48
* 64
* 80
* 96

Most section separation should fall between 64–96px on desktop.

Reduce deliberately on smaller screens.

---

# 10. Geometry

The site should feel slightly sharper and more engineering-oriented than a typical playful portfolio.

### Recommended radii

Large containers:
`16px–18px`

Cards:
`14px–16px`

Buttons:
`10px–12px`

Small controls:
`8px–10px`

Tiny tags:
`6px–8px`

Do not turn every label into a pill.

Do not use excessively rounded 24–32px cards everywhere.

Borders should generally be:

`1px solid var(--border)`

Use borders more often than heavy shadows.

---

# 11. Shadows

Shadows should be restrained.

Base cards should often have no visible shadow at rest.

Hover/elevated states may introduce:

* a small neutral shadow
* optionally an extremely faint tint related to that component's accent

Avoid:

* huge soft shadows
* neon glows
* colored halos
* permanently floating cards

---

# 12. Header

Desktop header height:

approximately `64px`.

Mobile:

approximately `58–60px`.

Behavior:

* sticky
* subtle backdrop treatment only when useful
* thin border may appear after scrolling
* never visually dominate the page

Left:

**Nicklas Pluhin**

No large standalone logo is necessary.

A tiny four-color identity detail may accompany the name.

Desktop navigation should remain simple and horizontal.

Suggested destinations:

* Projects
* About
* Experience
* Resume
* Contact

Also expose GitHub clearly.

---

# 13. Mobile Navigation

Use a compact menu button when the desktop links no longer fit comfortably.

The mobile menu should:

* open quickly
* be keyboard accessible
* have generous tap targets
* use the same neutral visual language
* avoid dramatic full-screen animation

A small menu panel is preferred over an elaborate mobile navigation experience.

React is not required.

---

# 14. Hero

The hero should answer within a few seconds:

**Who is this?**
**What kind of engineer is he?**
**Where can I see his work?**

Primary identity:

**Nicklas Pluhin**

Supporting themes:

* Software Engineering
* Open Source
* Algorithms
* Competitive / Olympiad Programming
* Machine Learning

Do not invent a final tagline.

The content system should make the tagline trivial to replace later.

### Composition

Prefer a strong typographic composition.

The hero should not be dominated by:

* portraits
* device mockups
* abstract blobs
* code-window illustrations
* giant decorative artwork

A small four-color detail is encouraged.

A restrained technical metadata row may also work.

---

# 15. Hero Actions

Primary:

**View Projects**

Secondary:

**Contact Me**

Nearby destinations may include:

* GitHub
* Resume
* LinkedIn
* YouTube

The primary CTA should normally use a neutral high-contrast surface rather than Google's blue.

Example:

Light mode:
dark charcoal button.

Dark mode:
light button or strong neutral surface.

Use accent colors in hover/focus details rather than filling every CTA.

---

# 16. About Me — Homepage

This is the second major homepage section.

It should make the site feel personal after the technical first impression.

Use the supplied portrait here if the composition works.

Preferred balance:

* concise introduction
* portrait
* small identity/detail elements

Avoid presenting a giant autobiography on the homepage.

Link to the full About page.

---

# 17. Portrait Treatment

Use the real portrait under `/photo/portrait*`.

Preferred aspect ratio:

approximately 4:5, based on the source crop.

Treatment:

* natural image
* restrained border
* approximately 16–18px radius
* no fake glass frame
* no giant shadow
* no artificial Google-color overlay

Optional:

one tiny accent detail near the frame.

The image should remain secondary to the content.

---

# 18. Homepage Projects

Projects should be the strongest visual content after the hero/about introduction.

Use a consistent grid.

Desktop:

prefer two equal columns where content allows it.

Mobile:

single column.

No irregular masonry.

No bento.

Cards may use:

* screenshot
* custom project artwork
* project title
* concise description
* technologies
* GitHub metadata
* links

Featured cards may be larger only when the overall hierarchy remains regular.

---

# 19. Project Cards

Project imagery should usually have a consistent frame around:

`16:10`

Image area:

* neutral surface
* real screenshot when available
* optimized image
* controlled crop

Content:

1. tiny project metadata
2. title
3. description
4. technologies
5. repository / live links

Stars should appear as supporting metadata, not as an achievement badge.

Each card may own exactly one accent color.

Example rotation:

Project 1 → Blue
Project 2 → Red
Project 3 → Yellow
Project 4 → Green

Accent usage may appear as:

* 2px–3px line
* tiny node
* link hover underline
* metadata mark

Do not tint the entire card.

---

# 20. Project Hover

Hover should feel physical but restrained.

Suggested transition:

150–220ms.

Allowed:

* `translateY(-2px)`
* extremely subtle scale such as `1.005–1.01`
* border contrast change
* small shadow
* accent detail movement
* arrow shift around 2–4px

Avoid cartoon-like bouncing.

---

# 21. Project Detail Pages

Treat project pages like engineering case studies.

The hierarchy should prioritize:

* problem
* engineering
* architecture
* decisions
* implementation
* results

Use generous real screenshots.

Technical diagrams may use the four colors sparingly.

Prose remains within a readable measure.

Code blocks should look intentional and technical, not like embedded editor screenshots.

---

# 22. Experience Preview

Homepage Experience should be concise.

Use a small vertical timeline or restrained chronological list.

Do not duplicate an entire résumé.

Timeline nodes may cycle through the four accents.

The rail itself should remain neutral.

---

# 23. Experience Page

This is where technical depth expands.

Possible sections:

* Experience
* Engineering Areas
* Skills
* Algorithms & Competitive Programming
* Olympiad Programming
* Machine Learning
* Timeline

Only render sections with real content.

---

# 24. Skills

Never use:

* proficiency percentages
* progress bars
* star ratings
* "95% Python"
* arbitrary Beginner/Advanced/Expert scales unless explicitly supplied

Prefer grouped textual skills.

Examples of visual treatment:

* simple lists
* compact tags
* technology + contextual evidence
* links to relevant projects

Do not create a wall of colorful logos.

---

# 25. Timeline

Keep the timeline small and readable.

Structure:

neutral vertical line.

Nodes:

cycle subtly through:

Blue → Red → Yellow → Green.

Important events may receive slightly stronger typography.

Do not turn the timeline into a giant infographic.

---

# 26. Contact

Contact should feel intentional despite having no server.

Possible layout:

* short heading
* short configurable explanation
* email
* copy-email action
* social links
* configurable reasons to contact

Do not create a contact form that cannot actually submit.

The email interaction may contain one small delightful animation.

---

# 27. Resume

The HTML resume should be much more utilitarian than the homepage.

It should remain visually related through:

* typography
* spacing
* subtle accent markers

but avoid unnecessary decorative animation.

Print layout should be clean.

`Download PDF` should be prominent but not larger than the main site CTAs.

---

# 28. Icons

Icons should be simple and consistent.

Preferred character:

* geometric
* rounded but precise
* approximately 1.75–2px stroke
* normally 18–20px

Material-inspired / Google-style icon geometry is acceptable.

Do not combine several noticeably different icon styles.

Brand social icons should use recognizable official silhouettes.

Avoid colored social-media logos unless there is a clear reason.

Most icons should inherit the current neutral foreground.

---

# 29. Interaction Philosophy

Interactions should feel:

**fast**
**physical**
**quiet**
**rewarding**

The user should frequently notice that the interface is carefully made, but rarely notice "an animation".

---

# 30. Motion Tokens

Micro interactions:

`120–220ms`

Navigation/panel changes:

`180–280ms`

Entrance animation:

`400–650ms`

Use carefully tuned easing.

Prefer CSS easing curves over adding a spring library.

---

# 31. Scroll Entrance

Allowed:

* opacity from 0
* `translateY(8–16px)`
* short stagger for tightly related content

Do not animate every paragraph independently.

Sections should not repeatedly animate when scrolling up and down.

The page must remain fully understandable if JavaScript is disabled.

---

# 32. Reduced Motion

When `prefers-reduced-motion: reduce` is active:

* remove transforms
* remove nonessential movement
* remove stagger
* shorten or remove animation durations
* retain simple state changes where useful

Never hide content because an entrance animation did not execute.

---

# 33. Micro-Interactions

Good candidates:

* link underline movement
* nav active indicator
* button press depth
* arrow nudges
* project-card elevation
* copy-email confirmation
* four-color identity marker
* theme icon transition
* timeline node response
* image border accent on hover

Use them throughout the site with consistency.

---

# 34. Easter Eggs

Allow one or two unobtrusive easter eggs.

They must:

* cost almost nothing in performance
* never block normal navigation
* not distract first-time visitors
* still make sense in reduced-motion mode

Possible locations:

* four-color identity mark
* browser console
* small keyboard interaction
* tiny project-card detail

Do not implement a game or complicated hidden interface.

---

# 35. Theme Toggle

Initial theme follows:

`prefers-color-scheme`.

Provide a small accessible theme control.

User override should persist.

Avoid initial theme flashing.

The theme icon may have a small transition.

Do not use React for this.

---

# 36. Links

Default links should usually remain neutral.

Accent may appear through:

* underline
* tiny indicator
* hover state
* focus state

Do not color every hyperlink blue.

This is essential to prevent blue from becoming the dominant site color.

---

# 37. Focus States

`:focus-visible` should be extremely obvious.

A focus ring may use the current component accent, but default interactive controls may use blue when no semantic accent exists.

Maintain adequate contrast in both themes.

Never remove browser focus without a better replacement.

---

# 38. Buttons

Button hierarchy:

### Primary

Neutral filled.

### Secondary

Neutral border.

### Tertiary

Text/link style.

Accent should normally appear on interaction, not as the permanent large surface.

Button motion:

* tiny translate or scale on press
* no elastic cartoon effect

---

# 39. Backgrounds

Most page backgrounds should be flat neutral surfaces.

Allowed:

* extremely subtle local grid/dot motif
* tiny technical patterns
* 1px lines
* barely visible surface separation

Do not use:

* large blurred blobs
* mesh gradients
* aurora gradients
* purple AI gradients
* giant glowing circles
* animated background gradients

---

# 40. Code

Code blocks:

* dark technical surface in both themes where appropriate
* radius around 10–12px
* clear syntax hierarchy
* copy action
* horizontal scrolling without breaking layout

Google colors may inspire syntax accents, but do not artificially recolor every token into the four-brand palette.

---

# 41. Navigation Active State

Do not use large pills around the active route.

Prefer:

* small underline
* tiny dot
* font-weight shift
* subtle foreground change

A page should not look like a dashboard navigation bar.

---

# 42. Footer

Footer should be compact.

Include:

* Nicklas Pluhin
* useful navigation
* social links
* copyright/current year when appropriate

Optionally use one tiny four-color signature detail.

Leave architecture open for future:

* Privacy
* Imprint / Legal

Do not invent legal text now.

---

# 43. Responsive Behavior

Design mobile layouts intentionally.

### Mobile

* one-column project cards
* comfortable text size
* compact hero
* portrait below/alongside content only when space allows
* mobile menu
* no clipped animations
* no tiny tap targets

### Tablet

Do not blindly treat tablet as desktop.

Check intermediate line lengths and card proportions.

### Desktop

Use width for breathing room and better composition, not to stretch paragraphs.

### Very large displays

Keep the primary container bounded.

Do not allow content to float across 1800px of empty width.

---

# 44. Visual Density

The site should be information-rich but calm.

Avoid two opposite failures:

### Too empty

"Premium" does not mean enormous whitespace surrounding three words.

### Too busy

"Personal" does not mean every surface needs decoration.

Use hierarchy, typography, spacing, and selective imagery first.

Use decoration last.

---

# 45. Images

Images should be rare enough that each image matters.

Priority:

1. portrait
2. real project screenshots
3. useful diagrams
4. custom project artwork

Avoid stock photography.

Do not add generic decorative illustrations just to fill space.

---

# 46. Anti-Template Rules

Avoid patterns commonly associated with generated portfolio templates:

* giant centered gradient headline
* gradient blobs
* bento dashboard
* huge pill tag cloud
* every section inside a card
* glass navigation everywhere
* oversized floating code-window mockup
* fake terminal hero
* enormous rotating technology-logo carousel
* excessive monospace typography
* meaningless metric counters
* infinite logo rows
* generic "What I Do" service cards
* timeline that occupies the entire viewport
* "My Tech Stack" logo wall
* overuse of dashed borders

The site should appear designed around the person and their work.

---

# 47. Homepage Emotional Rhythm

The homepage should move through:

### 1. Identity

"Who is Nicklas?"

### 2. Personality

"What kind of person/engineer is he?"

### 3. Evidence

"What has he actually built?"

### 4. Depth

"What experience and technical areas does he have?"

### 5. Connection

"Where can I find or contact him?"

This hierarchy is more important than adding additional sections.

---

# 48. Final Visual Test

Before considering the website complete, inspect every page in both light and dark themes.

Ask:

* Does the website feel custom?
* Can I identify Nicklas within seconds?
* Do projects receive enough visual weight?
* Are all four Google colors visible without one winning?
* Is at least 85% of the interface still neutral?
* Is blue accidentally becoming the primary brand color?
* Are there too many cards?
* Are there too many rounded rectangles?
* Does the typography feel editorial/technical rather than AI/SaaS?
* Is the portrait secondary to the actual story?
* Are animations subtle enough to age well?
* Does mobile look intentionally composed?
* Does dark mode feel equally premium?
* Is every decorative element earning its space?

If unsure whether to add another decorative element:

**do not add it.**

Refine what already exists instead.
