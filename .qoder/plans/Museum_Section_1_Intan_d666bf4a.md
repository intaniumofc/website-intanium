# Interactive Story Museum — Section 1 (Intan Shining Star)

## Summary
Prepend a new full-viewport, dark, cinematic "museum" Section 1 above all existing content on `/shining-star`. Rendering is **hybrid**: HTML/CSS is the primary layer; **Canvas 2D** handles butterflies, particles, fog, dust and starfield; **WebGL (R3F) is used ONLY for the centerpiece artifact**, lazy-loaded on capable desktops with a complete CSS/SVG fallback everywhere else. Motion via GSAP + ScrollTrigger + the existing global Lenis; entrance intro + scrubbed master timeline via GSAP; micro-interactions via Framer Motion. A context-aware **floating glass museum nav** shows during Section 1 and **crossfades into the global IRIS `Navbar`** as the user enters Section 2 (never both at full opacity). The transition is an **environment transform** (not a plain gradient) that dissolves the dream into the existing light Journey timeline. Existing components are untouched. JSX (not TypeScript).

## Decisions (locked)
- Render: Hybrid. DOM/CSS primary; Canvas 2D for butterflies/particles/fog/dust/starfield; WebGL only for the artifact. Never render the whole museum in WebGL. If WebGL fails/unsupported, CSS fallback must look complete.
- Palette: Dark Section 1, scoped to `.museum-section`; environment-transform transition into the existing light Section 2; Section 2 unchanged.
- Nav: Keep global `Navbar` as primary; hide it during Section 1, show floating glass museum nav, crossfade back entering Section 2. Never both at full opacity simultaneously.
- Placement: Prepend Section 1 at the top of `/shining-star`; nothing existing is modified.
- Artifact: swappable Artifact System (not hardcoded Crystal) so future stories can change the centerpiece without rewriting the hero.
- Section height: responsive scroll stages (never hardcode 200vh) — desktop 180-240vh, tablet 160-190vh, mobile 120-150vh; expandable without architecture changes.
- Language: JSX (not TS). `gsap.context()` + kill all ScrollTriggers on unmount; React StrictMode + Fast Refresh safe.
- Tokens: all spacing/radius/elevation/glass/blur/shadow/glow/transition/depth from reusable design tokens; never hardcoded inline.

## Dependencies (lazy-loaded only)
`three`, `@react-three/fiber` (v9), `@react-three/drei` (v10), `@react-three/postprocessing`. Loaded via `next/dynamic(..., { ssr: false })` and mounted ONLY when: desktop viewport AND `IntersectionObserver` in view AND NOT `prefers-reduced-motion` AND NOT low-capability device. Otherwise render the CSS artifact fallback. WebGL budget: max one bloom pass, max one transmission material, no realtime shadows, no heavy postprocessing.

## Fonts (scoped to museum only)
Extend the Google Fonts `<link>` in [layout.jsx](file:///c:/Project-Uyab/website-intanium/src/app/layout.jsx) to add `Cormorant Garamond` (hero) and `Inter` (body). Playfair Display (subtitle) already loaded. Exposed via scoped vars (`--museum-font-hero/sub/body`) under `.museum-section`. Never modify global typography or `theme.css`.

## File structure
Under `src/features/intan-shining-star/museum/`:
- `MuseumRoot.jsx` — orchestrator: owns entrance intro + ScrollTrigger master timeline via `gsap.context()`, reduced-motion/capability gates, emits museum active/inactive signal, full cleanup on unmount.
- `MuseumEnvironment.jsx` — composes background + particles + artifact + camera layer (the 3D-transform "stage").
- `MuseumBackground.jsx` — CSS observatory dome, dome ceiling, gradient, stars, fog, volumetric rays, soft breathing animation (no static background).
- `MuseumArtifact/` — the Artifact System:
  - `ArtifactProvider.jsx` — context that selects the current artifact + capability state; exposes `CurrentArtifact`.
  - `ArtifactWebGL.jsx` — lazy R3F artifact (float, gentle rotation, transmission material, single bloom, light pulse, reflection; no shadows).
  - `ArtifactFallback.jsx` — CSS/SVG glowing artifact (float + rotate + glow) for mobile/reduced-motion/no-WebGL.
  - `artifacts/` — swappable definitions: `Crystal`, `Book`, `Pendant`, `Mirror` (+ future), each usable by both WebGL and fallback.
- `MuseumParticles.jsx` — Canvas 2D dust/sparkles/fog/ambient particles.
- `ButterflyCanvas.jsx` — Canvas 2D butterflies (random flight paths, glowing wings, occasional artifact orbit, guide transitions).
- `MuseumNavigation.jsx` — floating glass nav: Museum, Journey, Stories, Gallery, About + Sound + Menu.
- `MuseumHero.jsx` — H1 `INTAN` / `SHINING STAR`, subtitle "Interactive Story Museum", description, primary "Enter The Museum" + secondary "Explore Journey" glass buttons (hover glow, focus rings).
- `MuseumCursor.jsx` — glowing dot + particle trail; pointer:fine only; disabled on touch/reduced-motion; activates only after first mouse movement.
- `MuseumTransition.jsx` — environment-transform hand-off into Section 2.
- `SoundController.jsx` — muted-by-default ambient; never autoplay; starts only after user interaction; state persisted in `localStorage`; placeholder audio path.
- `hooks/` — `useMuseumEntrance.js`, `useMuseumScroll.js`, `useArtifactCapability.js` (WebGL/device gate), `useMuseumNavState.js`.
- `styles/museum.css` (or `museum.module.css`) — scoped palette + design tokens under `.museum-section`.

## Design tokens (scoped under `.museum-section`)
CSS custom properties for: palette (below), spacing scale, radius scale, elevation levels, glass (bg + border + blur), blur levels, shadow levels, glow (blue/pink/mint), transition durations/easings, depth/z-index layers. Components consume tokens only.
Palette: bg `#090B12`, surface `#121521`, card `#1B2131`, text `#F8F7F4`, blue `#AEE2FF`, mint `#B8F2E6`, pink `#FFD6E8`, primary `#FF8FB1`, secondary `#7FD8BE`, glow-blue `rgba(174,226,255,.20)`, glow-pink `rgba(255,143,177,.20)`, glow-mint `rgba(184,242,230,.20)`. No colors outside this set.

## Entrance intro (GSAP, `useMuseumEntrance`)
Black screen -> tiny glowing particle -> particle becomes butterfly -> butterfly flies forward -> camera follows (CSS 3D push) -> museum slowly appears -> artifact settles -> hero fades in -> ambient motion begins. Reduced-motion: skip intro, render final hero immediately (static artifact, no loops).

## Camera (CSS 3D transforms + GSAP)
No aggressive zoom. Max camera movement 8-12% of viewport. Style: breathing, floating, gentle push, subtle tilt (Apple Vision Pro feel), never gaming-camera. Idle state always alive: floating dust, light rays, soft particles, butterflies, artifact glow, camera breathing.

## Scroll experience (pinned, ScrollTrigger, `useMuseumScroll`)
Pinned section sized via responsive scroll stages (see height decision). One scrubbed master timeline drives: camera push, artifact glow, artifact rotation, butterflies, particles, fog, hero fade, dome tilt, and the transition. Uses existing global Lenis (`window.lenis`) + ScrollTrigger already registered in [SmoothScroll.jsx](file:///c:/Project-Uyab/website-intanium/src/components/common/SmoothScroll.jsx). No hard cuts, no page jumps. All ScrollTriggers created in `gsap.context()` and killed on unmount.

## Transition (environment transform, not a gradient)
Fog brightens, particles dissolve, butterflies fly upward, artifact loses its glow, museum fades into daylight, camera eases upward, and the existing Journey section emerges naturally — the feeling of leaving a dream and entering reality.

## Context-aware navigation
- `MuseumNavigation` renders fixed within Section 1; scroll-driven opacity (visible in Section 1, fades out approaching Section 2).
- `MuseumRoot` sets a shared signal (e.g. `document.documentElement.dataset.museum = 'active'|'inactive'`) from the same ScrollTrigger threshold; `useMuseumNavState` reads it.
- Edit [Navbar.jsx](file:///c:/Project-Uyab/website-intanium/src/components/layout/Navbar.jsx): when `pathname === ROUTES.SHINING_STAR`, subscribe to the signal and hide (opacity/translateY, `pointer-events:none`) while museum active, then crossfade in when inactive; the two never overlap at full opacity. All other routes behave exactly as today.
- Nav routing (assumption, adjustable): Museum -> museum top; Journey -> smooth-scroll to `JourneyMap`; Stories -> `ROUTES.RECAPS`; Gallery -> `ROUTES.GALLERY`; About -> `ROUTES.ABOUT_INTAN`. "Explore Journey" scrolls to the timeline; "Enter The Museum" scrolls past the intro into the hall.

## Integration
- Edit [IntanShiningStarPage.jsx](file:///c:/Project-Uyab/website-intanium/src/features/intan-shining-star/IntanShiningStarPage.jsx): render `<MuseumRoot />` first, then `<MuseumTransition />`, then the existing `<AchievementCollection />` and `<JourneyMap />` untouched. Wrap the Journey area with an id/ref as the scroll target (no internal timeline changes).
- No changes to `JourneyMap` internals, `MainLayout`, `theme.css`, or global styles beyond the font `<link>` and the `Navbar` context-aware behavior.

## Responsive behavior
- Desktop: full experience incl. WebGL artifact, cursor glow, full butterfly/particle counts, camera parallax; height 180-240vh.
- Tablet: CSS/SVG artifact fallback, reduced particles, condensed nav; height 160-190vh.
- Mobile: no WebGL (CSS crystal), no cursor glow, reduced counts, hero stacks vertically, nav collapses to Menu + Sound; height 120-150vh. Lenis already off <768px, so native scroll + ScrollTrigger.

## Performance & accessibility
- DOM first, WebGL second, 60 FPS target. Lazy-load everything; GSAP `quickTo` for pointer/parallax; no unnecessary re-renders; DPR-capped canvases; no realtime shadows; no unnecessary postprocessing.
- Canvas loops pause when: `document.hidden`, window loses focus (`blur`), or IntersectionObserver reports offscreen; resume automatically.
- A11y: real DOM text, semantic `h1`, keyboard accessible, visible focus rings, `aria-label`s, decorative canvases `aria-hidden`; supports `prefers-reduced-motion` (via existing `useSafeReducedMotion()`) and `prefers-reduced-transparency` (reduce/disable glass blur).

## Test Plan
- `npm run dev`: verify intro sequence, idle ambient life, artifact float/pulse, butterflies/particles, cursor glow (fine pointer only, after first move).
- Scroll from top: master timeline reacts; environment-transform transition dissolves into the existing content with no hard cut; museum nav crossfades into global `Navbar` (never both full opacity).
- Reduced motion + reduced transparency: intro skipped, static fallback, no loops, glass reduced.
- Resize desktop/tablet/mobile: correct fallbacks, no WebGL on mobile, responsive heights, hero stacks.
- Capability gate: simulate no-WebGL / low-power -> CSS artifact still complete.
- Canvas pause: switch tab / blur window / scroll offscreen -> loops pause and resume.
- Regression: other routes' `Navbar` unchanged; Section 2 timeline still works.
- `npm run build` succeeds; no SSR/hydration errors (WebGL must be `ssr:false`); StrictMode double-mount leaves no leaked ScrollTriggers/rAF.

## Assumptions
- Build in JSX (matches codebase), not TypeScript.
- Adding R3F/three deps is acceptable for the lazy centerpiece; if declined, artifact uses the CSS fallback everywhere and no deps are added.
- Default current artifact = Crystal (system supports Book/Pendant/Mirror/future swaps).
- Existing on-page order is preserved as-is (currently Achievements then `JourneyMap`); the spec's Section 2/3 ordering (Journey before Achievements) is treated as the narrative target — I will NOT reorder existing components unless you confirm, to honor "everything currently on the page must remain unchanged." "Stories" and standalone "Gallery" are separate routes, not added to this page.
- Nav route mapping is adjustable during implementation.
- No audio asset provided yet; SoundController ships wired, muted, with a placeholder ambient path + localStorage persistence.