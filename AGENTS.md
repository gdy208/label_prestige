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
- **3D**: Three.js (low-poly floating geometry + particles, CSS fallback on mobile)
- **Fonts**: Cinzel (display), Playfair Display (headings), Inter (body)

## Project state — Phases 0-6.5 complete (7 done, 6 to go)

### Components implemented
| Component | Status | Description |
|---|---|---|
| Header.js | ✅ | Smooth-scroll, hamburger toggle, login/admin/logout buttons wired to auth state |
| Hero.js | ✅ | Entrance fade-in/stagger animation |
| Timeline.js | ✅ | Reads from Firestore `activites`, fallback to static array; future-date blur, Greek riddles on hover; real-time blur removal on login |
| ScrollAnimations.js | ✅ | IntersectionObserver for sections and cards |
| Canvas3D.js | ✅ | 4 low-poly icosahedrons wireframe (Three.js) |
| Particles.js | ✅ | 300 gold particles with brownian motion |
| LoginForm.js | ✅ | Email/password modal, Firestore role+poste check, specific error messages per auth code, recreates DOM on each open |
| AdminDashboard.js | ✅ | Hub with tabs (Activités, Concours, Membres, Suggestions), tab visibility by poste, matching flexible des postes présidents |
| AdminActivities.js | ✅ | CRUD table for activities (add/edit/delete) with Firestore |
| ActivityForm.js | ✅ | Modal form with auto riddle assignment from `enigmes` pool (cycle) |
| AdminConcours.js | ✅ | Liste + ajouter + modifier concours (8 seedés) |
| ConcoursForm.js | ✅ | Modal with all fields (text, select, textarea) — add/edit |
| seed.js | ✅ | Auto-seed activites (8), enigmes (15), concours (8) if collections empty |
| auth.js | ✅ | Global state store with subscribe pattern (user, role, poste, isAdmin) |

### Stubs (0 lines)
- AdminMembers.js
- DocumentLibrary.js
- DocumentCard.js
- SuggestionsForm.js
- SuggestionList.js

## Architecture

### Entrypoint
`index.html` → `<script type="module" src="/src/app.js">`
- `app.js` imports Firebase, auth, all components, seed
- `onAuthStateChanged` + `onSnapshot` on `users/{uid}` for real-time permission/activation changes
- All overlays injected into `<div id="modal-root">`

### Auth state (src/auth.js)
```js
{ user, role, poste, isAdmin }
```
- `subscribe(fn)` — called on every state change
- `getState()` — sync read
- `setState(partial)` — Object.assign + notify listeners

### Permission model — by `poste` (not `role`)
| poste | Membres (éditer) | Membres (activer) | Activités | Concours | Suggestions | Documents |
|---|---|---|---|---|---|---|
| developpeur | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| président* | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| *bureau* (autres) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

* Matching flexible : `"presidente_24"` match `"président"` (startsWith, insensible à la casse et aux accents)

### Firestore collections
| Collection | Fields |
|---|---|
| `activites` | date, title, description, enigme, enigmeHint, order, createdAt |
| `enigmes` | enigme (grec ancien), enigmeHint (traduction), used (boolean) |
| `concours` | category, name, ecole, option, filieres, frais, composition, matieres, periode, resultats, description, order, createdAt |
| `suggestions` | category, title, description, status (unread/read), createdAt, email |
| `documents` | name, category, type, academicYear, storagePath, filename, createdBy, createdAt |
| `users/{uid}` | name, email, role (super_admin/bureau), poste, promotion, active |
| `config/roles` | items (array of poste names) |

## Key behaviors to preserve
- **Future activities** (date > now) blurred (`filter: blur(8px)`); hover reveals content + Greek riddle. Admin login removes blur (`.future-activity` class removed via `renderTimeline(true)`)
- **Riddle assignment**: random pick from `enigmes` where `used: false` → mark `used: true`. If all used, reset all to `false` (cycle)
- **Admin dashboard tabs**: Activités + Concours (developpeur/président), Membres (developpeur only), Suggestions (all admins)
- **Modal overflow**: All admin modals use `max-height:85vh; overflow-y:auto`
- **Account creation**: via Firebase Console only (Option B). Never from UI.
- **Deactivation**: `active: false` in Firestore → instant signOut via `onSnapshot`
- **Real-time monitoring**: `onSnapshot` on `users/{uid}` catches role/poste/active changes live

## Reference documents (in `for_opencode/`)
| File | Use |
|---|---|
| `PROMOTIONAL_WEBSITE_SPEC.md` | Full feature spec, UI behavior, data models |
| `ROADMAP_ENRICHIE.md` | Step-by-step build plan with phase status |
| `CARTOGRAPHIE_TEXTE.md` | Audit of all visible text (French) |
| `TEXTES_MODIFIABLES.md` | ~80 editable text fields grouped by section |

## Upcoming phases
- Phase 7: AdminMembers.js (list, edit role/poste, activate/deactivate by permission)
- Phase 8: DocumentLibrary.js modal (Firestore read)
- Phase 9: Document upload + delete (admin)
- Phase 10: SuggestionsForm.js + SuggestionList.js
- Phase 11: Firebase Security Rules
- Phase 12: Polish, responsiveness, deployment
