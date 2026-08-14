# Julian Birthday — Design & Implementation Brief

Build a production-ready private birthday microsite for Julian Burg's 33rd birthday, revealing a 2027 trip to WEIN AM STEIN in Würzburg.

Verified facts:
- Official festival window: 8–25 July 2027 (https://wein-am-stein.de/).
- 2027 lineup and individual ticket days are not yet published; date choices must be provisional and editable.
- Würzburg highlights: Residenz, Festung Marienberg, Alte Mainbrücke/Brückenschoppen, Steinweinpfad.

Experience:
1. Full-screen premium cinematic intro: “Eine Einladung für …” → “Happy Birthday, Julian.” + 33 → portrait reveal with antique-gold crown descending onto his head and “Dr. Burg · Jahrgang 1993 · Grand Cru” → blue-hour Würzburg vineyard/festival imagery → gift reveal “WEIN AM STEIN 2027 · 08.–25. Juli 2027”. Visible Skip, later Replay, reduced-motion support.
2. Main gift landing section.
3. Wunschplaner: multi-select real dates 8–25 July plus “flexibel”; group options “Nur mit uns”, “Mit +1”, “Größere Runde” (5–12); note; saved/error/last-updated states; reload and edit.
4. Festival guide and editorial Würzburg weekend timeline.
5. Final toast and replay.

Aesthetic:
“Franconian Grand Cru after dark”: cinematic luxury wine editorial. Ink black, oxblood, champagne gold, parchment, muted vine green. Large high-contrast serif, condensed uppercase metadata, asymmetrical crops, fine rules, film grain, deliberate pacing. Avoid generic dashboards, excessive cards/pills, neon purple, glassmorphism everywhere, emojis, and template hero layouts.

Images:
- Use C:\Users\vonin-ju\Downloads\doctor-burg.webp as exact-identity portrait. Upload it into public/images and present as a convincing isolated cutout/vignette; do not alter the face.
- Create or code an original cinematic blue-hour vineyard/festival backdrop, no external hotlinks or copyrighted photos.
- Crown may be code-native SVG/CSS, brushed antique gold.

Technical:
- Next.js App Router + TypeScript for Vercel, maintainable components, no unnecessary UI library.
- localStorage key julian-birthday-rsvp-v1.
- GET/PUT /api/rsvp using @neondatabase/serverless when DATABASE_URL exists; validate and upsert one stable row; missing DB returns 503 and client treats it as local-only success.
- .env.example and README for Neon/Vercel Postgres.
- Responsive 375/768/1440, semantic and keyboard accessible, >=44px targets, no overflow, image sizing, metadata.
- npm run lint and npm run build must pass.

Delivery:
- Work directly on https://github.com/bthginfo/Julian-Birthday branch main because local workspace is read-only.
- Read token only from C:\Users\vonin-ju\Downloads\pat.env into a process-local variable; never print or persist it.
- Do not deploy manually; Vercel is connected.


## Mobile-first QR-card acceptance (iteration 2)
The primary experience is a QR-code scan from a printed birthday card, so phone portrait is the canonical layout. Desktop is secondary.
- Explicitly optimize and reason through 320, 360, 375, 390, and 430 px widths plus short 667–740 px heights.
- The cinematic intro must use dynamic/small viewport units, stay fully framed without scroll, keep Skip clear of notches/status bars, and keep portrait, crown, caption, gift date, and reveal legible on short phones. Add landscape/short-height fallbacks.
- Main hero should be a powerful first mobile viewport, not an 860px fixed-height desktop crop. Use 100svh/100dvh with sensible minimums and safe-area padding.
- Header and all bottom actions must honor safe-area insets. Avoid header/stamp/title overlap.
- Every interactive surface must provide at least a 44×44 CSS-pixel target; form controls use >=16px text to prevent iOS focus zoom. Add clear focus-visible and touch feedback.
- Date selection should remain fast and scannable one-handed; avoid tiny labels. Group choices and save CTA become full-width where useful.
- Prevent horizontal overflow at every breakpoint. Use overflow-safe German copy and balanced wrapping.
- Keep above-the-fold loading fast on mobile data: preserve Next/Image sizing/optimization, avoid unnecessary asset duplication, reduce GPU-expensive grain/filter work on small/reduced-motion devices, and prevent layout shift.
- Test the first QR entry, Skip, Replay, date toggling, group change, note entry, save/local fallback, and edit/reload flow on the mobile breakpoint before delivery.
