# Reference inspection and implementation

Inspected the rendered original URLs in Chrome:

- https://trionn.com/
- https://trionn.com/work
- https://trionn.com/services
- https://trionn.com/about
- https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/

The resumed inspection includes adaptive full-page scrolling at 1440×900, 768×1024, and 390×844. Page height was measured repeatedly because the reference initializes pinned sequences after its first paint. Initial fixed-height sampling missed later sections; the adaptive second pass captured them. Reference screenshots, contact sheets, section measurements, and article notes are in the ignored `.inspection/reference` directory. Earlier inspection material is in `../artifacts/rahul-inspection`.

## Completed changes

- Connected the existing but unused WorkExperience, ServicesExperience, and AboutExperience components to their Next.js routes and completed their missing styles.
- Work: floating thumbnail field, monogram, project-by-project asymmetric flow, 21 original projects, live three-path SVG connections, parallax, and detail links.
- Services: rotating orbital forms, centered heading and perspective, oversized discipline marquee, striped transition, six responsive service panels, original interface mockups, technology accordions, and sequential process reveals.
- About: text-led introduction, draggable monogram curtain, introduction and badge, six folding values, three-step process, founder section, collaborator entrance and drag/keyboard interaction, fit section, recognition sequence, client collection, testimonials, and photo scatter gallery with sampled background colors.
- Home: recreated the supplied About page screenshot’s large-text composition with original Rahul copy; replaced rectangular frames with an extruded version of the supplied Rahul monogram; coordinated scroll breakup and reassembly; added a pinned marquee and striped wipe.
- Home gallery: nine curved WebGL cards on a procedural helix, two guide lines, raycast hover, scroll rotation, unfolding into a linked DOM grid, and static fallback for reduced motion or unavailable WebGL.
- Responsive behavior: stacked service panels on phones, adjusted process layout, responsive gallery geometry, and normal document flow under reduced motion.
- Lifecycle: disposed geometry, materials, textures, observers, and tickers; guarded the detached-container frame during route changes.

## Observations used from Codrops

The article describes a common GSAP ticker for Lenis and rendering, random character blur reveals, a half-second charge before hero breakup, normalized scroll progress shared across scene states, striped transitions, and curved card vertices that flatten into a grid. These informed this implementation. The existing provider continues to own GSAP plugin registration and Lenis synchronization.

## Content and fidelity

The supplied `About page.png`, `Inspire - 1 motion.png`, `Inspire - 2 motion.png`, and `helix gallery'.png` were treated as visual references. Trionn logos, text, photos, and videos are not served by the app. The supplied `background logo.avif` had already been converted to `public/media/rahul-mark.png` and traced in `rahul-mark.json`; the resumed work uses that monogram as geometry. Pexels photo sources are documented in `public/media/credits.json`.

Typography uses the existing independently sourced open fonts. Interface artwork, brand names, copy, and scenes are original substitutes. Timings and geometry are visually matched approximations, not a recovered frame-identical implementation of the reference's private code or assets.

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run verify` — four viewport sizes, navigation, form drafts, sound, testimonials, case-study pages, network/console errors, and reduced motion.
- `npm run verify:experiences` — three viewport sizes, 21 project routes, SVG attachment, six service panels, seven technology accordions, process reveals, curtain interaction, collaborator drag/keyboard selection, photo interactions, helix-to-grid transition, overflow, and reduced motion.

Current results and review screenshots are written to `qa/results.json` and `qa/experiences/results.json`. Run the checks against the production server with `BASE_URL=http://localhost:3001` after `npm run build` and `npm start -- --port 3001`.

Final production verification on 2026-11-01: typecheck and build passed; both browser suites passed with zero recorded console errors, HTTP failures, or horizontal overflow. Additional experience checks at 1920×1080 passed (`qa/experiences/results-large.json`). The dedicated gallery-to-work navigation regression also passed.
