# 🗺️ Tallinn Discovery Quest

## App Overview (Codex generated)

A gamified, location-based stamp rally PWA for tourists in Tallinn, implemented from
`[PRD] Tallinn Stamp Rally`. Visit landmarks, tap to collect a digital stamp, answer local
trivia for points, and spend those points on Decos to decorate your souvenir photos.

Everything runs locally in the browser — no backend, no account.

### Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run smoke      # 20-step Playwright walkthrough of the core flows
```

Requires Node 20+. First launch needs network access once for the OpenStreetMap tiles and
the *M PLUS Rounded 1c* webfont; both are cached by the service worker afterwards.

> **Trying it outside Tallinn:** the map has a **📍 Simulate GPS…** dropdown in the
> bottom-right corner. Pick a Spot and the app behaves as if you were standing there, so
> the whole check-in flow is testable from a desk.

### Tech stack

| Concern | Choice |
| --- | --- |
| App | React 19 + TypeScript + Vite, installable PWA (`vite-plugin-pwa`, Workbox) |
| Database | PGlite (`@electric-sql/pglite`, persisted to IndexedDB) + Drizzle ORM |
| Photo binaries | OPFS (Origin Private File System) — never in the database |
| Photo editor | React-Konva (HTML5 Canvas), canvas state saved as JSON for re-editing |
| Map | Leaflet + OpenStreetMap tiles (no API key required) |
| Routing | React Router (hash router, so the build works from any static path) |

Every read and write goes through Drizzle syntax (`src/db/queries.ts`). The only raw SQL is
the `CREATE TABLE` bootstrap in `src/db/ddl.sql`, which PGlite executes once at start-up.

### Project layout

```
public/assets/       generated SVG art — spot photos, stamps, decos
scripts/
  gen-assets.py      regenerates every SVG asset (npm run assets)
  smoke.mjs          Playwright end-to-end walkthrough (npm run smoke)
src/
  db/
    schema.ts        Drizzle schema — 1:1 with the PRD data architecture
    ddl.sql          CREATE TABLE statements executed on first launch
    client.ts        PGlite bootstrap, default user, master-data seeding
    queries.ts       every read/write in the app, in Drizzle syntax
    seedData.ts      12 Tallinn spots, 36 quizzes, 40 decos
  lib/
    geo.ts           haversine distance, GPS fallback chain, radii
    opfs.ts          photo binaries in OPFS + blob-URL cache
    sound.ts         WebAudio cues (stamp, correct, wrong, unlock)
  state/AppContext.tsx   app-wide state: spots, points, check-ins, position
  components/        global menu, bottom sheet, popup, spot/quiz/deco cards
  pages/             Explore, SpotPage, DecoSouvenir, Collection (+ 3 subpages)
  editor/            Konva canvas, Text / Deco / Edit panels, spot picker
  styles/            design tokens (tokens.css mirrors tokens.json from the PRD)
```

### Screens

**Explore** — header counters (`checked-in / total` Spots, `completed / total` Quizzes), a
Leaflet map with a pin per Spot (Accent when checked in, Inactive when not), your position
marker, and a draggable bottom sheet holding the Quick Check-in button (active only within
200 m of a Spot) and the Nearby Spots list (within 1 km, nearest first).

**Spot page** — name, address, description, the big stamp, and three tabs:

- *Trivia Quiz* — accordion cards. Pick an answer, submit: correct plays a chime, shows ⭕,
  marks the card Completed and adds the quiz's reward points; wrong shows ❌ with no penalty.
- *Your Photos* — thumbnails of the photos tagged with this Spot, newest first; tapping one
  opens the swipeable preview window with date overlay and an Edit button.
- *Deco* — this Spot's Decos, locked ones showing a padlock and an unlock popup.

Tapping the stamp checks you in (sound + stamp animation, awards `reward_points`). Tapping a
placed stamp opens the uncheck-in confirmation; unchecking sets `is_active = false` and
deliberately leaves your points alone.

**Deco Souvenir** — camera or library → preview with a searchable Spot selector and a Retake
confirmation → the editor. The editor is a bottom sheet with three tabs over a full-bleed
canvas; closing the sheet is Overview Mode, where you drag items around, drop them on the
trash to delete, resize/rotate with the handles, and Save.

- *Text* — textarea (Enter finishes), font-size slider over the preview, six fonts, HSV
  Primary/Secondary colour pickers, alignment cycle (right → center → left) and style cycle
  (none → border → fill).
- *Deco* — the current Spot's Decos first, then other unlocked ones; picking one drops it in
  the centre and returns to Overview.
- *Edit* — Crop & Rotate (pinch, drag, flip H/V, 90° rotate, scale/rotation sliders),
  Brightness, Contrast, Saturation, Color Filter (hue + strength) and Sharpness. Texts and
  Decos are hidden while this tab is open and re-composited on top afterwards.

**Collection** — three tiles with counts, leading to the full Spots list, all Trivia Quizzes
grouped by Spot, and all Decos grouped by Spot with your point balance in the header.

### Data model

Exactly the PRD tables: `users`, `user_profiles`, `spots`, `user_check_ins`, `quizzes`,
`user_quiz_completed`, `decos`, `user_decos`, `photos`.

`user_id` exists from day one and is hardcoded to `local-default-user`. Migrating to Supabase
later is one statement per table:

```sql
UPDATE user_check_ins SET user_id = '<supabase auth uid>' WHERE user_id = 'local-default-user';
```

`npm run db:push` pushes the same Drizzle schema to a real Postgres when that day comes.

### Decisions taken where the PRD was silent

- **Map** — Leaflet + OpenStreetMap raster tiles, chosen because they need no API key. Swap
  the `<TileLayer url>` in `src/pages/Explore.tsx` for another provider at any time.
- **Master data** — 12 real Old Town Spots with their true coordinates, 3 quizzes and 3 Decos
  each, plus 4 free "starter" Decos so a brand-new user can decorate before earning points.
  All of it lives in `src/db/seedData.ts`; replace that one file to ship another city.
- **Art** — every spot photo, stamp and Deco is a generated SVG (`scripts/gen-assets.py`),
  so the repo carries no licensed imagery. Drop real `.png`/`.jpg` files into
  `public/assets/` and point `seedData.ts` at them to swap in production artwork.
- **Sounds** — synthesised with WebAudio rather than shipped as audio files.
- **Check-in points** — awarded only the first time a Spot is checked in. Re-checking in after
  an uncheck-in awards nothing, which is what the uncheck-in popup promises the user.
- **Re-editing photos** — `photos.image_path` holds the flattened result, and the untouched
  original is kept alongside it in OPFS under a key recorded inside `editor_state_json`
  (`sourcePath`). Without this, re-opening a photo would stack the filters a second time.
- **Deco Souvenir entry point** — the tab shows a small launcher (Take a photo / Choose from
  library / your recent photos) instead of opening the camera immediately, because mobile
  browsers only open the camera in response to a direct user gesture.
- **New text placement** — horizontally centred as the PRD asks, but at 32 % of the canvas
  height so it stays visible while the Text panel covers the lower two thirds.
- **Region** — the header shows the app name; the Region feature is a future plan in the PRD.

### Not yet built (PRD "Future Plans")

Japanese localisation, the Expo/React Native build, and the online social features
(shared deco-photos, finding friends at a Spot) are out of scope for this phase. The schema
and the `user_id` design are already shaped for them.

### Testing

#### 1. Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Open **http://localhost:5173** in Chrome. `localhost` counts as a secure context, so
OPFS (photo storage), IndexedDB and the camera input all work without HTTPS.

#### 2. Walk the app by hand

You are almost certainly not standing in Tallinn's Old Town, so use the
**📍 Simulate GPS…** dropdown at the bottom-right of the map — pick a Spot and the app
behaves as if you were there. Suggested 5-minute pass:

| # | Do this | Expect |
| --- | --- | --- |
| 1 | Open the app | Header reads `Spots 0 / 12`, `Trivia 0 / 36`; 12 pins on the map |
| 2 | Simulate GPS → *Tallinn Town Hall* | The blue button becomes `Check In Now! - Tallinn Town Hall`; the list re-sorts by distance |
| 3 | Drag the bottom sheet up / down | It snaps between "handle only" and two thirds of the screen |
| 4 | Tap the button, then tap the dashed stamp | Sound + stamp animation, the stamp fills in, `Spots 1 / 12` |
| 5 | Open a quiz, pick the wrong answer, submit | ❌ + buzz, nothing else changes |
| 6 | Pick the right answer, submit | ⭕ + chime, card turns green "Completed!" |
| 7 | Collection → Deco | `70 pt` (50 check-in + 20 quiz) |
| 8 | Tap a locked Deco you cannot afford, then one you can | "not enough point" popup / "Unlock" popup that spends the points |
| 9 | Deco Souvenir → *Choose from library* → any photo | Preview with the Spot selector pre-filled; tap it to search Spots |
| 10 | Start Editing → **Text** | A text appears centred; type, change font, colour, alignment, style |
| 11 | **Deco** tab → tap an unlocked Deco | It drops in the centre and the sheet closes |
| 12 | Drag the Deco onto the trash at the bottom | It is deleted |
| 13 | **Edit** tab → Brightness / Color Filter / Crop & Rotate | Texts and Decos hide; the photo changes; they come back afterwards |
| 14 | Close the sheet → **Save** | Lands on the Spot's *Your Photos* tab with the new thumbnail |
| 15 | Tap the thumbnail | Preview window: swipe or ‹ › to page, tap to toggle the date, **Edit** re-opens the editor |
| 16 | Reload the page | Everything is still there (PGlite → IndexedDB, photos → OPFS) |
| 17 | Tap a placed stamp → Uncheck-in | Stamp reverts, points stay as they were |

#### 3. Run the automated walkthrough

```bash
npx playwright install chromium   # once
npm run build
npm run preview                   # terminal 1 — serves http://localhost:4173
npm run smoke                     # terminal 2
```

It drives a headless Chromium through 20 assertions covering the table above and prints
`PASS` / `FAIL` per step. Screenshots of every screen land in `/tmp/shots`, which is the
quickest way to eyeball the UI. Point it elsewhere with `BASE=http://…  npm run smoke`, or
use a different browser binary with `CHROME_PATH=…`.

`npm run typecheck` and `npm run lint` cover the static side.

#### 4. Test on a real phone

`npm run dev` already listens on your LAN, but a plain `http://192.168.x.x:5173` is **not**
a secure context, so OPFS is disabled and photos will not survive a reload. Either:

- tunnel it — `npx localtunnel --port 5173` (or ngrok / `vite --https`), then open the
  HTTPS URL on the phone; or
- deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages) — it is a plain SPA
  with a hash router, so no server config is needed.

Over HTTPS you also get the real thing: actual GPS, the camera, and "Add to Home Screen"
installing it as a PWA.

#### 5. Start from a clean slate

The app seeds itself on first launch, so to test the very first run again, clear its storage:
Chrome DevTools → **Application** → **Storage** → *Clear site data* (this drops the
`tallinn-stamp-rally` IndexedDB database, the OPFS photos and the cached GPS position).

## 📖 Development Story & Engineering Process

### 1. Ideation & Initial Prototyping at a Hackathon

This project originated at the [**Vibe Coders Hackathon**](https://luma.com/3235mulg) at Cafe Boheem, Tallinn. 

The concept—a stamp rally and discovery app for exploring Tallinn's rich history and culture—was born out of a collaboration with my teammate [Akemi Hashimura](https://www.linkedin.com/in/akemi-hashimura-03b991272/), who holds a Master's degree in Digital Game Design (focusing on serious games) from Tallinn University and works as a local tour guide for Japanese visitors.

During the event, we built an initial prototype in a few hours using the no-code/AI app builder [**Bilt**](https://bilt.me/). While rapid prototyping is effective for quick visual showcases, we quickly encountered critical engineering limitations:
* **Black-box Architecture:** Inability to directly view, version-control, or edit the underlying code.
* **Brittle Iterations:** High failure rates and preview breakage when attempting continuous updates or bug fixes.

Recognizing the strong potential of our core concept, I decided to move away from no-code tools and rebuild the application from the ground up using proper software engineering principles.

### 2. Redesign & Engineering Process

To ensure long-term maintainability, code quality, and scalability, I established a structured development workflow:

#### 🎨 UI/UX Design (Penpot)

* Created intuitive, responsive UI designs using **Penpot**. 
* While Penpot supports interactive prototyping, I skipped this step to save maintenance overhead for our lean team, embedding design specs directly into the documentation instead.

#### 📄 Product Requirements Document (PRD) & Architecture

* Link to PRD: [https://app.notion.com/p/PRD-Tallinn-Stamp-Rally-39f7d3e40494802f831fde86f189f77c?source=copy_link]
* Authored a comprehensive PRD outlining functional requirements, data models, and user flows.
* **Pragmatic Architecture:** Designed the initial release as a lightweight, offline-capable **Progressive Web App (PWA)** for rapid deployment.
* **Forward-Looking DB Schema:** Structured the local data model to seamlessly transition into a multi-user social platform powered by **Supabase** in future releases.

#### 🤝 Cross-functional Collaboration & Data Pipeline

* **Iterative Specification Design:** By taking ownership of both UI/UX design and the PRD, I iteratively refined user flows alongside system specifications. This upfront investment in document-driven design minimized architectural rework during implementation.
* **Non-Technical Team Integration:** Once the database schema stabilized, I onboarded my teammate to create initial test data. To ensure a smooth workflow without overwhelming a non-technical contributor, I designed a structured Google Spreadsheet workflow configured for clean CSV exports and future schema updates.

#### ⚙️ Code Generation & Quality Control (OpenAI Codex)

* Promoted **OpenAI Codex** to generate the core codebase based on the PRD and Penpot design screenshots.
* Currently conducting code reviews, refactoring, UI polish, performance optimization, and bug fixes in preparation for the beta release.

### 3. Team Collaboration & Future Vision

Content quality—including historical accuracy, storytelling depth, and engagement—is just as critical as technical execution. 

Beyond app-only interactions, we envision a real-world ecosystem, including:
* Collaborative seasonal events with local landmarks and cultural sites.
* Physical merchandise featuring our custom stamp and souvenir artwork.
* Validating our core concept as a scalable model adaptable to other cities and countries.

To validate the project's social impact and business viability within Estonia's innovation ecosystem, we are also preparing an application for the **[Ideemeistrid](https://ideemeistrid.visionest.institute/ideas/a9aa14a0-7804-4f48-931f-6d93c3043242)** idea competition.