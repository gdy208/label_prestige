# AGENTS.md — Label Prestige Fork2

## Quick start
```bash
npm run dev      # Vite dev server
npm run build    # Vite production build (base: '/', pour Firebase)
npm run build:gh # Vite production build (base: '/label_prestige/', pour GitHub Pages)
npm run preview  # Preview production build
```

**GitHub Pages** : https://labelprestigeoff.github.io/label_prestige/
Se déclenche en pushant sur `master` (GitHub Actions ou manuel).
Le `base` est défini via `BASE_URL` dans `vite.config.js`. Pour un build local :
```bash
BASE_URL=/label_prestige/ npm run build
```

No testing, linting, typechecking, or formatter tooling configured. Assume none.

## Stack
- **Build**: Vite 8, vanilla JS ES modules (`"type": "module"` in package.json)
- **Runtime**: Firebase 12 (Auth, Firestore), Supabase Storage (bucket `documents`, public)
- **3D**: Three.js — `isLowPowerDevice()` (mobile/touch/reduced-motion) disables 3D, uses CSS gradient fallback
- **Fonts**: Cinzel (display), Playfair Display (headings), Inter (body) — loaded via `<link>` in `index.html`
- **Design tokens**: CSS custom properties in `src/styles/main.css` (gold #C9A34D, navy #0A0E1A, glass effects)

## Project state — 12 phases done, site live
All components implemented. Site déployé sur Firebase Hosting.

URL : https://label-website-cebde.web.app

`firebase.json` and `firestore.rules` exist at root. No `.firebaserc` — Firebase used client-side only (Auth + Firestore). Storage via Supabase (bucket `documents`, public). `public/assets/fonts/` and `public/assets/images/` are empty directories.

## Architecture
Each component is a pure JS module exporting a `setup*()` function. No framework — direct DOM manipulation via `querySelector`/`innerHTML`/template literals. All overlays inject into `<div id="modal-root">`.

### Key modules
- `src/supabase.js` — Supabase client init (Storage bucket `documents`, also used for serment pull images)
- `src/auth.js` — Firebase Auth pub/sub store
- `src/firebase.js` — Firebase init (Auth, Firestore)
- `src/seed.js` — Auto-seeds Firestore collections if empty
- `src/components/AdminSerment.js` — Serment config panel (phones + pull image upload)
- `src/components/SermentSection.js` — Dynamic serment section rendering (Firestore + real-time)

### Entrypoint
`index.html → <script type="module" src="/src/app.js">`
- `app.js` on `DOMContentLoaded`: sets up Header, Hero, Timeline, ScrollAnimations, background (3D or CSS fallback), seed
- `onAuthStateChanged` + `onSnapshot` on `users/{uid}` for real-time permission/activation changes
- `active: false` in Firestore → instant `signOut`

### Auth state (`src/auth.js`)
`{ user, role, poste, isAdmin }` — simple pub/sub: `subscribe(fn)`, `getState()`, `setState(partial)`.

### Permission model — by `poste` (not `role`)
| poste | Membres (éditer) | Membres (activer) | Activités | Concours | Suggestions | Documents |
|---|---|---|---|---|---|---|
| developpeur | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| président* | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| *bureau* | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

`posteMatches()` in `AdminDashboard.js:17`: `startsWith`, case+accent insensitive (NFD decomposition) — so `"presidente_24"` matches `"président"`.

### Firestore collections
| Collection | Fields |
|---|---|
| `activites` | date, title, description, order, createdAt |
| `concours` | category, name, ecole, option, filieres, frais, composition, matieres, periode, resultats, description, order, createdAt |
| `suggestions` | category, title, description, status (unread/read), createdAt, email |
| `documents` | name, category, type, academicYear, storagePath, storageRef, filename, createdBy, createdAt |
| `users/{uid}` | name, email, role (super_admin/bureau), poste, promotion, active |
| `config/roles` | deprecated — poste is free text |

## Key behaviors
- **Future activities** (date > now): blurred (`filter: blur(8px)`). Admin login removes blur (`.future-activity` class removed via `renderTimeline(true)`)
- **Admin dashboard tabs**: Activités + Concours (developpeur/président), Membres (developpeur only), Suggestions (all admins)
- **Account creation**: Firebase Console only. Never from UI.
- **Seed**: `seed.js` auto-seeds `activites` (8), `concours` (8) if collections empty — runs on every page load

## Reference docs (`for_opencode/`)
- `PROMOTIONAL_WEBSITE_SPEC.md` — full spec, UI behavior, data models
- `ROADMAP_ENRICHIE.md` — build plan with phase status
- `CARTOGRAPHIE_TEXTE.md` — audit of all visible text (French)
- `TEXTES_MODIFIABLES.md` — ~80 editable text fields grouped by section
