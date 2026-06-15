# AGENTS.md — Label Prestige Fork2

## Quick start
```bash
npm run dev      # Vite dev server
npm run build    # Vite production build
npm run preview  # Preview production build
```

No testing, linting, typechecking, or formatter tooling configured. Assume none.

## Stack
- **Build**: Vite 8 (vanilla JS, ES modules — `"type": "module"` in package.json)
- **Runtime**: Firebase 12 (Auth, Firestore, Storage)
- **3D**: Three.js (import not yet added to package.json; planned for canvas background)
- **Fonts**: Cinzel (display), Playfair Display (headings), Inter (body) — loaded via Google Fonts in `index.html`

## Project state — Phase 2 (Hero + Content Sections) complete
- **`Header.js` (27 loc)** — smooth-scroll + hamburger toggle
- **`Hero.js`** — entrance fade-in/stagger animation on load
- **`Timeline.js`** — 8 activities from data array, future-date blur, Greek riddles on hover
- **`ScrollAnimations.js`** — IntersectionObserver for sections and cards
- **Empty stubs still (0 lines)**: Canvas3D, Particles, DocumentLibrary, DocumentCard, LoginForm, AdminDashboard, SuggestionsForm, SuggestionList
- **CSS is complete**: design tokens in `main.css`, component styles in `components.css`, responsive breakpoints in `responsive.css`
- **Firebase init** is done in `src/firebase.js` — uses `import.meta.env.VITE_FIREBASE_*` env vars with dummy fallbacks

## Architecture

### Entrypoint
`index.html` → `<script type="module" src="/src/app.js">`
- `app.js` imports `firebase.js` and `Header.js`
- Mounts header, sets up Firebase `onAuthStateChanged`, toggles mobile nav

### Firebase config pattern
```js
import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key"
```
All Firebase env vars follow `VITE_FIREBASE_*` naming (Vite convention). Dummy fallbacks prevent crashes at dev time; create `.env.local` for real values (already gitignored).

## Important conventions
- **Language**: All UI text is French (navigation, labels, messages, content)
- **Design system**: Gold (`#C9A34D`) on navy (`#0A0E1A`), glassmorphism (`backdrop-filter: blur(20px)`), Cinzel for display, Playfair Display for headings
- **No JS framework** — vanilla DOM manipulation only
- **File structure mirrors spec**: `src/components/` matches the component list in `for_opencode/PROMOTIONAL_WEBSITE_SPEC.md`

## Reference documents (in `for_opencode/`)
| File | Use |
|---|---|
| `PROMOTIONAL_WEBSITE_SPEC.md` | Full feature spec, UI behavior, data models |
| `CARTOGRAPHIE_TEXTE.md` | Audit of all visible text on the site (French, exact strings) |
| `ROADMAP_ENRICHIE.md` | Step-by-step build plan with all UI text per phase |
| `TEXTES_MODIFIABLES.md` | ~80 editable text fields grouped by section |

Use these instead of guessing UI strings — all French text content is defined there.

## Firestore collections
- `documents` — fields: `name`, `category`, `type`, `academicYear`, `storagePath`, `filename`, `createdBy`, `createdAt`
- `suggestions` — fields: `category`, `title`, `description`, `status` ("unread" | "read"), `createdAt`, `email` (optional)

## Key behaviors to preserve
- **Future activities** (date > now) are blurred (`filter: blur(8px)`); hover reveals content + ancient Greek riddle. Admin login permanently removes blur (removes `.future-activity` class)
- **Activities are CRUD via Firestore**: `activites` collection, riddle pool in `enigmes` collection, auto-assign with no-repeat cycle
- **Document library** is a modal with sidebar tree (categories/subjects) and card grid
- **Suggestions**: public submit form with live preview; admin-only dashboard with stats (total, unread, last 7 days) and filters by category
- **Admin gating**: Firebase Auth email/password. Two roles in Firestore `users/{uid}.role`:
  - `super_admin` (Président/VP) — manages members + all bureau rights
  - `bureau` — manages activities, documents, suggestions
- **AdminDashboard.js** is the central hub with tabs: Activités, Membres (super_admin only), Suggestions
- **Members created via Firebase Console** (Option B — not via app UI)
