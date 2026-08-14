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


## Content, portrait and interaction revision (iteration 3)
User feedback is explicit: the current portrait cutout looks bad (blocky grey artifacts and a bright halo), the intro is not cinematic enough, and the copy sounds forced. Rework these areas, preserving the strong mobile-first foundation from iteration 2.

### People and voice
- The gifters are Julius and Lena. Address/sign copy accordingly.
- German voice should feel like close friends speaking: relaxed, warm, a little dry/funny, never like wine advertising or a tourism brochure.
- Replace stiff lines such as “Ein guter Jahrgang verdient einen großen Abend” and generic “Deine Crew” language with personal copy. Direction: “Julian, wir haben da was vor.” / “Zum 33. wollten wir dir nicht noch irgendwas hinstellen. Also packen wir lieber Würzburg, Wein am Stein und uns drei zusammen.” / “Du suchst den Termin aus. Julius & Lena kümmern sich um den Rest.”
- Group choices become natural and explicit: “Nur wir drei”, “Mit +1”, “Machen wir ’ne Runde draus”.
- Keep sentences short enough for mobile and avoid forced wine puns in every paragraph.

### Portrait quality
- Delete/disable the current browser threshold/canvas cutout that creates block artifacts and a white halo.
- Use the supplied exact portrait C:\Users\vonin-ju\Downloads\doctor-burg.webp.
- First try a high-fidelity background replacement/extraction via the built-in imagegen edit workflow: preserve Julian’s exact face, hair, expression, body, purple shirt, pose and proportions; replace only the background with a perfectly uniform removable chroma key; remove key locally and validate.
- Reject any generated result that changes his identity. If clean extraction cannot preserve identity, intentionally use the untouched original photo as a refined editorial full-frame/soft-mask composition with layered blur, vignette and light rather than a fake “cutout”. There must be no blocky matte, bright halo or visibly jagged edge.
- Reposition/redesign the crown to sit naturally on the head and make it brushed antique gold, not a cartoon sticker.

### Stronger cinematic intro
- More than film grain and crossfades. Build an actual 5–6 beat mobile title sequence using deliberate scene changes and visual storytelling: cold-open title/age, vintage-1993 label or bottle macro, Julian spotlight/portrait, crown payoff, liquid/wine-color iris or light-leak transition, blue-hour Würzburg vineyard reveal, then personal gift card signed Julius & Lena.
- Use mask/iris wipes, moving light, depth/parallax, animated line/map/label details, typography choreography and wine-liquid shapes. Grain is only a subtle texture.
- Keep the full first-run experience around 15–18 seconds on mobile, always skippable, reduced-motion friendly, and readable on short phones.
- No autoplay audio requirement; do not depend on sound for meaning.
- Final reveal copy must feel personal: “Julian, wir fahren nach Würzburg.” / “Wein am Stein · 8.–25. Juli 2027” / “Julius & Lena”.

### Flexible trip rhythm
Replace the overly specific sightseeing “example weekend” with a deliberately flexible three-day rhythm that works around whichever festival date Julian picks:
1. Day before: arrive in Würzburg, check in, first relaxed glass/food, no fixed attraction schedule.
2. Festival day: slow morning, then WEIN AM STEIN in the evening.
3. Day after: breakfast, optional short stroll, travel home.
Present it as a loose plan, not a booking itinerary.

### Mobile mini-game: Perfect Pour
Add a lightweight, one-handed wine-themed mini-game after the gift/planner area.
- “Der perfekte Schoppen”: press-and-hold (pointer and keyboard accessible) to fill a stylized wine glass; release as close as possible to a marked target line.
- Show a score/accuracy and playful result copy (e.g. “Brückenschoppen-Profi”, “Das war eher ein Probiererle”, “Großzügig eingeschenkt”). Allow replay.
- Use code-native SVG/CSS/canvas, no heavy game library. Do not hijack page scroll. Minimum 44px controls and mobile-first.
- Best score may persist locally, but the game must not affect RSVP data.

### Funny 1993 vintage profile
Add an editorial “Jahrgang 1993” profile using researched, clearly attributed German-vintage facts:
- Extremely warm late spring; flowering about three weeks early.
- Rain in September/early October made harvest a nerve-racking selection challenge and encouraged botrytis.
- Patient, selective growers still produced excellent Kabinett and some sensational Auslese; Decanter rates the German vintage 4/5.
- Jancis Robinson characterizes it as nerve-racking but notes that some fine wines still show well.
Sources: https://www.decanter.com/learn/vintage-guides/germany/1993-vintage-guide-for-germany-116182/ and https://www.jancisrobinson.com/learn/vintages/germany
Pair facts with a humorous, clearly non-scientific Julian tasting note, e.g. “Früh Potenzial gezeigt. Hinten raus stark. 33 Jahre Flaschenreife – kein bisschen korkig.” Do not claim these Germany-wide facts specifically describe Franken.

### Acceptance
- Preserve official festival dates and optional persistence.
- Keep current mobile-safe viewport/safe-area/touch rules.
- Lint/type/build must pass and live Vercel root must return the real page, not 404.
