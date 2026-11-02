# Rahul Portofolio

An original portfolio recreation based on rendered inspection of https://trionn.com. Uses Next.js 15 App Router, TypeScript, Tailwind CSS v4, GSAP with ScrollTrigger and SplitText, Lenis, and plain Three.js.

## Run

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm run typecheck
npm run build
npm start
```

Development output is `.next-dev`; production output is `.next`. These directories are intentionally separate.

## Browser verification

Start the app, then run in another terminal:

```sh
npx playwright install chromium
npm run verify
npm run verify:experiences
```

The verification script uses installed Google Chrome on Windows when available. Otherwise it uses Playwright Chromium. `CHROME_PATH` overrides the browser executable; `BASE_URL` overrides http://localhost:3000. Screenshots and the test report are written to `qa/`.

Checks include 1440×900, 768×1024, 390×844, and 1920×1080 layouts; homepage sections and pinned sequences; navigation and curtain completion; all 21 project routes; inquiry validation, draft creation, and editing; sound; testimonial controls; FAQ expansion; console errors; failed HTTP responses; overflow; and reduced motion.

## Content and contact

Project descriptions, people, testimonials, statistics, and brand names are fictional placeholder content. Edit `src/lib/content.ts` before publishing a personal portfolio.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_CONTACT_EMAIL` to your address. The inquiry flow prepares an editable email draft and offers copying. It does not claim to send mail or silently submit personal information. A conversation request also opens an email draft; no booking service is configured.

## Assets and motion

Artwork combines original CSS interface mockups, procedural Three.js scenes, the supplied Rahul monogram, and local Pexels photographs. Sources are listed in `public/media/credits.json`. Reference screenshots are inspection material only and are not served by the application. No Trionn logos, photography, video, models, audio, or copied page text are used in the rendered site. Fonts are independently sourced open fonts bundled by Fontsource. No external font or media requests are required at runtime. Ambient audio is synthesized only after the sound button is activated.

The shared client provider registers GSAP plugins. Lenis runs on the GSAP ticker and calls ScrollTrigger.update. Scenes dispose geometries, materials, textures, event listeners, observers, and tick callbacks when unmounted. WebGL has a CSS fallback. Reduced motion removes pinned sequences and exposes their content in normal document flow.

The implementation follows the observed composition and interaction patterns. It is not an exact frame-by-frame duplicate: original procedural artwork replaces the reference models/videos, open serif typography replaces the licensed editorial face, and animation timings are visual approximations. The work collection includes 21 original placeholder projects.

## Resumed implementation

The previously disconnected work, services, and about components now power their routes.

- Work: a floating project cloud, asymmetric project cards, and three live SVG connections between successive projects.
- Services: orbiting forms, a striped transition, six sequential panels with original interface mockups, seven technology accordions, and a three-step process.
- About: an interactive monogram curtain, folding values, process, founder, draggable collaborators, milestones, client collection, testimonials, and an interactive studio photo gallery.
- Home: the supplied screenshot’s large-text composition with Rahul content, a sculptural version of the supplied R monogram, a scroll-driven breakup and reassembly, striped vision transition, and a nine-card WebGL helix that unfolds into an accessible grid.

`verify` covers shared navigation, forms, sound, testimonials, six detailed case studies, responsive layout, and reduced motion at 1440, 768, 390, and 1920 pixels. `verify:experiences` covers all 21 project URLs, line attachment, all service panels and technology accordions, process reveals, collaborator drag and keyboard selection, photo interactions, and helix-to-grid behavior at 1440, 768, and 390 pixels. Both record browser and network errors.

For verification against production, run `npm run build`, then `npm start -- --port 3001`. Set `BASE_URL=http://localhost:3001` when running either verification command. On PowerShell: `$env:BASE_URL = 'http://localhost:3001'`.
