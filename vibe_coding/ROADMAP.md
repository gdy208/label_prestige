# 🗺️ Implementation Roadmap — Label Prestige Promotional Website

> Derived from [PROMOTIONAL_WEBSITE_SPEC.md](file:///home/gedeon/projets/label-prestige-fork2/PROMOTIONAL_WEBSITE_SPEC.md)
> Generated: 2026-06-11

---

## 🤖 Instructions for the AI Agent

This roadmap is specifically designed for an AI agent guiding the implementation of the Label Prestige project.

1.  **No Autonomous Content Generation:** DO NOT generate informational text, descriptions, or copy for the various sections (Histoire, Activités, Concours, Serment Techno, etc.) yourself.
2.  **User Consultation Mandate:** ALWAYS ask the user for the specific text and information to be used for each section. If a placeholder is needed for UI testing, explicitly state it is a temporary placeholder and ask for the final content.
3.  **Sequential Execution:** Follow each phase and task in order. Do not skip ahead unless explicitly directed by the user.
4.  **Verification:** After completing a task or a phase, confirm the results with the user and wait for approval before moving to the next one.
5.  **Technical Fidelity:** Strictly adhere to the technical stack and branding guidelines defined in `PROMOTIONAL_WEBSITE_SPEC.md`.

---

## How to Use This Roadmap

Each **phase** is a self-contained milestone. Complete all tasks within a phase before moving to the next. Each task has:
- A checkbox `[ ]` — tick it when done
- An **owner hint** (Frontend / Backend / Design / DevOps)
- Concrete **deliverables** and **acceptance criteria** at the end of each phase

---

## Phase 0 — Environment & Project Scaffolding

> **Goal:** A running local dev server with the folder structure in place, Firebase project created, and all dependencies installed.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 0.1 | [x] Create the project root directory and initialize `package.json` (`npm init -y`) | DevOps | — |
| 0.2 | [x] Install Vite as the build tool (`npm i -D vite`) | DevOps | Optional: webpack is also acceptable |
| 0.3 | [x] Create the folder structure per spec | Frontend | See tree below |
| 0.4 | [x] Create a Firebase project in the Firebase Console | DevOps | Enable **Firestore**, **Storage**, **Auth (Email/Password)** |
| 0.5 | [x] Install Firebase SDK (`npm i firebase`) | DevOps | — |
| 0.6 | [x] Create `src/firebase.js` with `initializeApp()`, Firestore, Storage, and Auth exports | Backend | Use environment variables or a config object for keys |
| 0.7 | [x] Add Google Fonts to `index.html`: **Cinzel**, **Playfair Display**, **Inter** | Frontend | Via `<link>` tags or `@import` in CSS |
| 0.8 | [x] Create base CSS file (`src/styles/main.css`) with CSS custom properties for the design system | Design | See branding tokens below |
| 0.9 | [x] Verify `npm run dev` serves a blank page with the correct fonts | DevOps | — |

### Folder Structure to Create
```
public/
  index.html
  assets/
    fonts/
    images/
src/
  app.js
  firebase.js
  styles/
    main.css
    components.css
    responsive.css
  components/
    Header.js
    Hero.js
    Canvas3D.js
    Particles.js
    Timeline.js
    DocumentLibrary.js
    DocumentCard.js
    LoginForm.js
    AdminDashboard.js
    SuggestionsForm.js
    SuggestionList.js
```

### Branding Tokens (CSS Custom Properties)
```css
:root {
  /* Colors */
  --color-gold: #C9A34D;
  --color-gold-light: #E8D48B;
  --color-navy: #0A0E1A;
  --color-navy-light: #141B2D;
  --color-glass-bg: rgba(255, 255, 255, 0.06);
  --color-glass-border: rgba(201, 163, 77, 0.2);
  --color-text-primary: #FFFAF0;
  --color-text-secondary: rgba(255, 250, 240, 0.65);

  /* Typography */
  --font-display: 'Cinzel', serif;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing / Radii */
  --radius-glass: 16px;
  --blur-glass: 20px;
  --transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### ✅ Phase 0 Acceptance Criteria
- [x] `npm run dev` starts a local server
- [x] The browser shows a page with the correct background color and fonts loaded
- [x] `firebase.js` exports `app`, `db`, `storage`, `auth` without errors in the console

---

## Phase 1 — Header & Navigation

> **Goal:** A fixed, luxury-styled header with navigation links and a responsive hamburger menu.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 1.1 | [ ] Build the HTML structure in `index.html`: `<header>` with `<nav>` containing links for **Histoire**, **Activités**, **Documents**, **Concours**, **Serment Techno**, **Suggestions** | Frontend | Use semantic `<nav>` and `<a>` with `href="#section-id"` |
| 1.2 | [ ] Create `Header.js` component: attach smooth-scroll behavior to each nav link | Frontend | Use `element.scrollIntoView({ behavior: 'smooth' })` |
| 1.3 | [ ] Style the header: fixed position, glassmorphism background (`backdrop-filter: blur()`), gold accent border-bottom, Cinzel font for brand name | Design | `z-index` must be above the 3D canvas |
| 1.4 | [ ] Add a **Login** button in the header (right side) — no functionality yet, just the UI element | Frontend | Style as a ghost/outlined gold button |
| 1.5 | [ ] Build the hamburger menu icon (CSS-only or minimal JS toggle) | Frontend | Three-line icon that animates to an ✕ on open |
| 1.6 | [ ] Create the mobile slide-out or overlay menu | Frontend | Full-screen overlay with nav links stacked vertically |
| 1.7 | [ ] Add responsive breakpoint: collapse nav links into hamburger at `≤ 768px` | Design | Use `@media` queries in `responsive.css` |

### ✅ Phase 1 Acceptance Criteria
- [ ] Header stays fixed on scroll, with gold accent and glass effect
- [ ] Clicking any nav link smooth-scrolls to the corresponding `<section>`
- [ ] On mobile (≤ 768px), nav collapses into a hamburger menu that toggles an overlay
- [ ] Login button is visible but non-functional

---

## Phase 2 — Hero Section & Content Sections

> **Goal:** A stunning hero with branded title/subtitle/CTA, plus static content sections for Histoire, Activités, Concours, and Serment Techno.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 2.1 | [ ] Create the `<section id="hero">` in `index.html`: large title (Cinzel), subtitle (Playfair Display), and a gold CTA button | Frontend | CTA can link to `#documents` or `#activites` |
| 2.2 | [ ] Build `Hero.js`: entrance animation (fade-in + slide-up on load) for the hero text and button | Frontend | Use CSS `@keyframes` or JS `IntersectionObserver` |
| 2.3 | [ ] Style the hero: full-viewport height, centered content, text-shadow for depth, gradient overlay to ensure text readability over future 3D canvas | Design | — |
| 2.4 | [ ] Create `<section id="histoire">`: association mission & vision content | Frontend | Use Playfair Display for headings, Inter for body |
| 2.5 | [ ] Create `<section id="activites">`: placeholder timeline structure | Frontend | Will be enhanced in Phase 2b |
| 2.6 | [ ] Build `Timeline.js`: a vertical or horizontal timeline component with activity cards (date, description, theme/keywords) | Frontend | Start with hardcoded data; data-driven version can come later |
| 2.6.1 | [ ] Design & create CSS styles for "Révélation Temporelle" (blur élégant, gold mystery text, contrast handling, user-select control) | Design | Visuals must match glassmorphism & luxury token system; include `will-change: filter` and mobile fallbacks |
| 2.6.2 | [ ] Implement JS logic in `Timeline.js` / `app.js`: real-time date comparison (Date.now() vs event.date), dynamic toggling of CSS classes, and light polling/update strategy (e.g., per-minute re-evaluation + IntersectionObserver optimization) | Frontend | Ensure minimal DOM work; use class toggles and ARIA attributes; fall back gracefully when `mysteryText` absent |
| 2.7 | [ ] Style activity cards: glassmorphism card with gold border on hover, subtle scale animation | Design | — |
| 2.8 | [ ] Create `<section id="concours">`: descriptions for CCINP, X Polytechnique, etc. | Frontend | Use grid/flexbox cards layout |
| 2.9 | [ ] Create `<section id="serment-techno">`: membership, commitments, payment/promo info | Frontend | — |
| 2.10 | [ ] Add scroll-triggered entrance animations to all sections (fade-in, slide-up) | Frontend | Use `IntersectionObserver` in `app.js` |

### ✅ Phase 2 Acceptance Criteria
- [ ] Hero is full-viewport, visually impactful, with animated text entrance
- [ ] All four content sections render with styled headings and body text
- [ ] The Activités section has a timeline with at least 3 sample activity cards
- [ ] Scroll-triggered animations fire correctly as each section enters the viewport

---

## Phase 3 — 3D Canvas & Particle Background

> **Goal:** A lightweight Three.js scene behind the hero/header with optional particle effects.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 3.1 | [ ] Install Three.js (`npm i three`) | DevOps | — |
| 3.2 | [ ] Create `Canvas3D.js`: initialize a `WebGLRenderer`, `Scene`, `PerspectiveCamera` | Frontend | Render to a `<canvas>` element positioned behind hero |
| 3.3 | [ ] Add low-poly floating geometry (e.g., icosahedrons, torus knots) with gold wireframe or emissive material | Frontend | Keep draw calls under 20 for performance |
| 3.4 | [ ] Animate geometry: slow rotation, gentle floating motion | Frontend | Use `requestAnimationFrame` loop |
| 3.5 | [ ] Create `Particles.js`: add a particle system (using `THREE.Points` or a custom shader) | Frontend | Gold/white particles, slow drift |
| 3.6 | [ ] Layer the canvas: set `position: fixed`, `z-index: -1`, `pointer-events: none` | Design | Ensure it doesn't intercept clicks |
| 3.7 | [ ] Add a **pause/disable toggle** for the 3D animation | Frontend | Button in footer or hero corner; saves preference to `localStorage` |
| 3.8 | [ ] Auto-disable or simplify canvas on mobile / low-power devices | Frontend | Check `navigator.hardwareConcurrency` or viewport width |
| 3.9 | [ ] Performance audit: ensure ≤ 16ms frame time on mid-range hardware | Frontend | Use Chrome DevTools Performance tab |

### ✅ Phase 3 Acceptance Criteria
- [ ] 3D canvas renders behind the hero with floating geometry and particles
- [ ] Canvas does NOT capture pointer events (buttons and links still clickable)
- [ ] A toggle exists to pause/disable the animation
- [ ] On mobile, animation is simplified or disabled automatically
- [ ] No visible frame drops on desktop (60 fps target)

---

## Phase 4 — Document Library Modal (Read-Only)

> **Goal:** A polished two-pane document library modal that reads documents from Firestore.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 4.1 | [ ] Create the Firestore `documents` collection and seed it with 5–10 sample documents (manually or via script) | Backend | Fields: `name`, `category`, `type`, `academicYear`, `storagePath`, `filename`, `createdBy`, `createdAt` |
| 4.2 | [ ] Upload corresponding sample files to Firebase Storage under `/documents/{year}/{category}/{filename}` | Backend | PDFs or placeholder files |
| 4.3 | [ ] Build `DocumentLibrary.js`: modal/overlay component with backdrop blur | Frontend | Triggered by clicking "Documents" in nav |
| 4.4 | [ ] Implement the **left pane** — tree navigation with categories and subjects | Frontend | Categories: 1ère Année, 2ème Année, Concours Spéciaux. Subjects: Mathématiques, Physique, Chimie, S.I., Informatique, CCINP, ISFA, X Polytechnique, École Centrale Casablanca, Gbinzin |
| 4.5 | [ ] Implement expand/collapse behavior for tree nodes | Frontend | CSS transitions + JS toggle |
| 4.6 | [ ] Implement active selection highlighting on tree nodes | Frontend | Gold left-border + subtle background change |
| 4.7 | [ ] Build `DocumentCard.js`: card component showing title, meta (year, type, category), and a **Download** button | Frontend | — |
| 4.8 | [ ] Implement `fetchDocuments(category)` in `firebase.js`: query Firestore filtered by `category` | Backend | Use `where()` clause; order by `createdAt desc` |
| 4.9 | [ ] Wire tree selection → Firestore query → render document cards in the **right pane** | Frontend | Show a loading spinner during fetch |
| 4.10 | [ ] Implement the **Download** action: generate a signed URL or use `getDownloadURL()` from Firebase Storage | Backend | Open in new tab or trigger browser download |
| 4.11 | [ ] Modal close: clicking backdrop, pressing Escape, or clicking an ✕ button | Frontend | Trap keyboard focus inside modal for accessibility |
| 4.12 | [ ] Animate modal open/close (scale + fade transition) | Design | — |

### ✅ Phase 4 Acceptance Criteria
- [ ] Clicking "Documents" opens a full-screen modal with glass styling
- [ ] Left tree shows categories; clicking a category fetches and displays document cards
- [ ] Download button successfully opens/downloads the file
- [ ] Modal can be closed via backdrop click, Escape key, or ✕ button
- [ ] Modal is keyboard-accessible (focus trap, tab navigation)

---

## Phase 5 — Authentication & Admin Gating

> **Goal:** Bureau members can log in; admin-only UI elements appear only when authenticated.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 5.1 | [ ] Build `LoginForm.js`: modal or dropdown with email and password fields + submit button | Frontend | Triggered by the header "Login" button |
| 5.2 | [ ] Implement `signInWithEmailAndPassword()` using Firebase Auth | Backend | Handle errors: wrong password, user not found |
| 5.3 | [ ] Create 1–2 test admin accounts in Firebase Console (Auth → Users) | DevOps | — |
| 5.4 | [ ] Set admin flag: either via Firestore `users` collection (`{ uid, role: 'admin' }`) or Firebase custom claims | Backend | Custom claims require a Cloud Function; `users` collection is simpler for MVP |
| 5.5 | [ ] Implement `onAuthStateChanged()` listener in `app.js` — on login, check admin flag and set a global `isAdmin` state | Backend | — |
| 5.6 | [ ] Conditionally show/hide admin UI: **Upload button** in document library, **Delete button** on document cards, **Suggestions** nav link (admin dashboard variant) | Frontend | Toggle visibility via CSS class or DOM manipulation |
| 5.7 | [ ] Add a **Logout** button (replaces Login when authenticated) | Frontend | Calls `signOut()` |
| 5.8 | [ ] Show user feedback: "Logged in as [email]" toast or small indicator in header | Frontend | — |
| 5.9 | [ ] Handle auth errors gracefully with user-friendly messages | Frontend | e.g., "Invalid credentials. Please try again." |

### ✅ Phase 5 Acceptance Criteria
- [ ] Clicking "Login" opens a form; valid credentials log the user in
- [ ] After login, admin-only elements (upload, delete, suggestions dashboard) become visible
- [ ] Logging out hides admin elements and shows the Login button again
- [ ] Invalid credentials show an error message (not a raw Firebase error)

---

## Phase 6 — Document Upload (Admin)

> **Goal:** Authenticated admins can upload documents via a form; files go to Storage, metadata to Firestore.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 6.1 | [ ] Build the **Upload Form** UI inside the document library modal (visible only to admins) | Frontend | Fields: Document name, Category (dropdown matching tree), Document type (pdf/notes/exam), Academic year, File input |
| 6.2 | [ ] Validate form inputs client-side before submission | Frontend | Required fields, file size limit (e.g., 20 MB), accepted MIME types |
| 6.3 | [ ] Implement `uploadDocument(metadata, file)` in `firebase.js`: upload file to Storage at `/documents/{year}/{category}/{filename}` | Backend | Use `uploadBytesResumable()` for progress tracking |
| 6.4 | [ ] On successful upload, write metadata document to Firestore `documents` collection | Backend | Include `storagePath`, `createdBy` (current user UID), `createdAt` (server timestamp) |
| 6.5 | [ ] Show an **upload progress bar** during file upload | Frontend | Use the `state_changed` observer from `uploadBytesResumable` |
| 6.6 | [ ] Display a **success notification** (toast) on successful upload | Frontend | Auto-dismiss after 3 seconds |
| 6.7 | [ ] Display an **error notification** if upload or Firestore write fails | Frontend | — |
| 6.8 | [ ] After successful upload, refresh the document list for the current category | Frontend | — |

### ✅ Phase 6 Acceptance Criteria
- [ ] Admin sees an "Upload" button in the document library; clicking it reveals the form
- [ ] Submitting the form uploads the file to Storage and creates a Firestore document
- [ ] A progress bar shows upload progress; a success toast appears on completion
- [ ] The newly uploaded document appears in the document card grid immediately
- [ ] Non-admin users do NOT see the upload button

---

## Phase 7 — Document Delete (Admin) + Storage Cleanup

> **Goal:** Admins can delete documents; deletion removes both the Firestore record and the Storage file.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 7.1 | [ ] Add a **Delete** button/icon on each `DocumentCard` (visible only to admins) | Frontend | Use a trash icon with a red hover state |
| 7.2 | [ ] Implement a **confirmation dialog** before deletion ("Are you sure you want to delete [name]?") | Frontend | — |
| 7.3 | [ ] Implement `deleteDocument(docId, storagePath)` in `firebase.js`: delete Firestore document + delete file from Storage | Backend | Use `deleteDoc()` + `deleteObject()` |
| 7.4 | [ ] Show a **success notification** after deletion | Frontend | — |
| 7.5 | [ ] Remove the deleted card from the UI without a full re-fetch (optimistic update) | Frontend | — |
| 7.6 | [ ] Handle errors (e.g., file already deleted from Storage) gracefully | Backend | — |

### ✅ Phase 7 Acceptance Criteria
- [ ] Admin sees a delete icon on each document card
- [ ] Clicking delete shows a confirmation; confirming removes the document from Firestore and Storage
- [ ] The card disappears from the grid with a fade-out animation
- [ ] Non-admin users do NOT see the delete button

---

## Phase 8 — Suggestions System

> **Goal:** Public users can submit suggestions; admins have a dashboard to view, filter, and manage them.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 8.1 | [ ] Create the Firestore `suggestions` collection (no seed data needed) | Backend | Fields: `category`, `title`, `description`, `status` ("unread"), `createdAt`, `email` (optional) |
| 8.2 | [ ] Build `SuggestionsForm.js`: public form with category selector, title input, description textarea, optional email input | Frontend | Place in `<section id="suggestions">` |
| 8.3 | [ ] Implement **live preview**: as the user types, mirror title and description into a styled card beside the form | Frontend | Update on `input` event |
| 8.4 | [ ] Implement `submitSuggestion(data)` in `firebase.js`: add document to `suggestions` collection with `status: 'unread'` and `createdAt: serverTimestamp()` | Backend | — |
| 8.5 | [ ] Show **success notification** on submission; reset the form | Frontend | — |
| 8.6 | [ ] Build `AdminDashboard.js` (suggestions section): **stats cards** showing total count, unread count, recent count (last 7 days) | Frontend | Query Firestore for counts |
| 8.7 | [ ] Build `SuggestionList.js`: list/grid of suggestion cards with category badge, title, description preview, status indicator, and date | Frontend | — |
| 8.8 | [ ] Implement **filters**: by category dropdown, toggle "unread only" | Frontend | Re-query Firestore with `where()` clauses |
| 8.9 | [ ] Implement **Mark as Read** action: update `status` to `"read"` in Firestore | Backend | — |
| 8.10 | [ ] Implement **Delete Suggestion** action with confirmation | Backend | — |
| 8.11 | [ ] Wire the admin dashboard so it's accessible only when logged in as admin | Frontend | Could be a separate modal/view or a section that replaces the public suggestions form |

### ✅ Phase 8 Acceptance Criteria
- [ ] Any visitor can fill out and submit the suggestion form
- [ ] Live preview updates in real time as the user types
- [ ] A success message appears and the form resets after submission
- [ ] Admin dashboard shows total, unread, and recent suggestion counts
- [ ] Admin can filter by category and unread status
- [ ] Admin can mark a suggestion as read or delete it
- [ ] Non-admin users see only the public form, not the dashboard

---

## Phase 9 — Firebase Security Rules

> **Goal:** Production-ready security rules that enforce the access model defined in the spec.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 9.1 | [ ] Write **Firestore security rules** | Backend | See rules template below |
| 9.2 | [ ] Write **Storage security rules** | Backend | See rules template below |
| 9.3 | [ ] Test rules using the **Firebase Emulator Suite** | Backend | Run `firebase emulators:start` |
| 9.4 | [ ] Test positive cases: public read documents, public create suggestion, admin upload/delete | Backend | — |
| 9.5 | [ ] Test negative cases: unauthenticated upload, unauthenticated suggestion delete, non-admin delete | Backend | — |
| 9.6 | [ ] Deploy rules to production (`firebase deploy --only firestore:rules,storage`) | DevOps | — |

### Firestore Rules Template
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Documents: public read, admin write/delete
    match /documents/{docId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Suggestions: public create, admin read/update/delete
    match /suggestions/{sugId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users: admin-only
    match /users/{userId} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Rules Template
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{allPaths=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
      // For stricter enforcement, check custom claims or Firestore user role
    }
  }
}
```

### ✅ Phase 9 Acceptance Criteria
- [ ] All Firestore/Storage rules are deployed
- [ ] Emulator tests pass for both positive and negative access scenarios
- [ ] No console errors related to permission denials in normal usage flows

---

## Phase 10 — Polish, Responsiveness & Deployment

> **Goal:** Final visual polish, accessibility, responsive tweaks, and production deployment.

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 10.1 | [ ] Audit all sections for consistent use of the design system (fonts, colors, spacing) | Design | — |
| 10.2 | [ ] Ensure all **glassmorphism** panels have consistent `backdrop-filter`, `border`, and `background` | Design | — |
| 10.3 | [ ] Add **micro-animations**: button hover effects, card hover scales, nav link underline transitions | Design | — |
| 10.4 | [ ] Test and fix responsive layout at breakpoints: `320px`, `480px`, `768px`, `1024px`, `1440px` | Frontend | — |
| 10.5 | [ ] Simplify hero on mobile: reduce text size, stack elements vertically | Frontend | — |
| 10.6 | [ ] Accessibility audit: form `<label>` elements, `alt` text on images, color contrast (WCAG AA), keyboard navigation | Frontend | Use Lighthouse or axe DevTools |
| 10.7 | [ ] Add `<meta>` tags: description, viewport, Open Graph (title, description, image) | Frontend | For SEO and social sharing |
| 10.8 | [ ] Add a `<title>` tag with the association name | Frontend | — |
| 10.9 | [ ] Add a favicon (gold-themed icon) | Design | Place in `public/assets/images/` |
| 10.10 | [ ] Optimize assets: compress images, lazy-load off-screen sections | Frontend | — |
| 10.11 | [ ] Run Lighthouse audit: target scores ≥ 90 for Performance, Accessibility, Best Practices, SEO | Frontend | — |
| 10.12 | [ ] Configure Firebase Hosting (or Netlify/Vercel): `firebase init hosting`, set `public` directory, add rewrites if needed | DevOps | — |
| 10.13 | [ ] Build production bundle (`npm run build`) and deploy | DevOps | `firebase deploy` or equivalent |
| 10.14 | [ ] Verify production site: all features functional, no console errors, HTTPS enforced | DevOps | — |

### ✅ Phase 10 Acceptance Criteria
- [ ] Site looks premium and polished on all screen sizes
- [ ] Lighthouse scores ≥ 90 across all four categories
- [ ] All forms have proper labels and the site is keyboard-navigable
- [ ] Production URL is live and HTTPS-secured
- [ ] All features (document library, upload, suggestions, admin) work in production

---

## Summary & Effort Estimates

| Phase | Est. Effort | Can Parallelize With |
|-------|-------------|----------------------|
| 0 — Scaffolding | 0.5 day | — |
| 1 — Header & Nav | 1 day | — |
| 2 — Hero & Sections | 1.5 days | Phase 3 |
| 3 — 3D Canvas & Particles | 1.5 days | Phase 2 |
| 4 — Document Library (Read) | 2 days | — |
| 5 — Auth & Admin Gating | 1 day | — |
| 6 — Document Upload | 1 day | Phase 7, Phase 8 |
| 7 — Document Delete | 0.5 day | Phase 6, Phase 8 |
| 8 — Suggestions System | 2 days | Phase 6, Phase 7 |
| 9 — Security Rules | 1 day | — |
| 10 — Polish & Deploy | 2 days | — |
| **Total** | **~14 days** | **~10 days with parallelization** |

### Dependency Graph

```
Phase 0 (Scaffolding)
  └─► Phase 1 (Header & Nav)
        ├─► Phase 2 (Hero & Sections) ─────┐
        └─► Phase 3 (3D Canvas) ───────────┤
                                            ▼
                                    Phase 4 (Document Library)
                                            │
                                            ▼
                                    Phase 5 (Auth & Admin)
                                     ┌──────┼──────┐
                                     ▼      ▼      ▼
                              Phase 6    Phase 7  Phase 8
                             (Upload)   (Delete) (Suggestions)
                                     └──────┼──────┘
                                            ▼
                                    Phase 9 (Security Rules)
                                            │
                                            ▼
                                    Phase 10 (Polish & Deploy)
```

> **Tip:** Phases 2 & 3 can be built in parallel. Phases 6, 7, & 8 can also be parallelized once Phase 5 (Auth) is complete. This can compress the timeline to **~10 working days**.

> **Important:** Before starting Phase 4, ensure Firestore and Storage are properly configured in the Firebase Console with at least sample data seeded.

---

*Ready to start? Begin with Phase 0 and work through each phase sequentially (or parallelize where indicated).*
