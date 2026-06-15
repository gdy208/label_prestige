# Promotional Website — Project Specification

## Project overview
A luxury-branded promotional website for an academic/association audience. Key goals: showcase history and activities, provide a document library (public + admin upload), manage suggestions from users, and present a high-end visual identity with 3D canvas + particle effects.

Tech stack (suggested)
- Static frontend: HTML/CSS/JS (index.html, app.js)
- Frameworks/libraries: Three.js or React Three Fiber for 3D canvas, particles.js or custom shader particles
- Firebase: Firestore + Firebase Storage + Auth (email/password for bureau members)
- Hosting: Firebase Hosting or Netlify/Vercel
- Build tools (optional): Vite / webpack

Branding & typography
- Theme: Luxury (gold/glass, glassmorphism, subtle motion)
- Fonts: Cinzel, Playfair Display, Inter
- Colors: gold accents (#C9A34D), deep navy/black background, semi-transparent glass panels

Navigation & layout
- Fixed header (luxury) with links: Histoire | Activités | Documents | Concours | Serment Techno | Suggestions
- Hero section: branded title, subtitle, CTA button
- Background: 3D canvas + particle visual effects
- Responsive: collapsed mobile header, hamburger menu, simplified hero and canvas

Pages / Sections
1. Home (hero, brief mission, CTA)
2. Histoire — Association mission & vision
3. Activités — Timeline roadmap + activity cards (date, description, theme/keywords). Les activités futures sont floutées (blur 8px) ; le survol révèle le contenu et affiche une énigme en grec ancien. La connexion admin supprime définitivement le flou.
4. Documents — "Base de Documents" modal/library with sidebar tree and document viewer
5. Concours — Contest descriptions (CCINP, X Polytechnique, etc.)
6. Serment Techno — Membership, commitments, payment/promo
7. Suggestions — public suggestion form and live-preview; admin dashboard for management
8. Admin area (protected) — upload, manage documents, suggestions dashboard

Document Library (UI + behavior)
- Triggered modal / overlay "Base de Documents" with two-pane layout:
  - Left: Tree navigation (categories: 1ère Année, 2ème Année, Concours Spéciaux) with subjects as subnodes (Mathématiques, Physique, Chimie, S.I., Informatique, CCINP, ISFA, X Polytechnique, École Centrale Casablanca, Gbinzin)
  - Right: Document viewer & grid of document cards
- Document card: title, meta (year, type, category), actions (download, delete)
- Admin-only: upload button visible when logged in; delete action restricted to admin
- Behaviors: expand/collapse tree, active selection highlighting, modal open/close, animated transitions

Member / Admin Access
- Login form (email/password) for bureau members
- Role-based access: admin/bureau flag in Firestore 'users' collection (or Firebase custom claims)
- After login, admin-only UI appears: upload form, Suggestions sidebar item, suggestions dashboard, and future activities unblurred (`.future-activity` class removed from timeline cards)

Document upload flow
- Admin upload form fields: document name, category, document type, academic year, file input
- On submit: upload file to Firebase Storage, write document metadata to Firestore `documents` collection with storagePath
- Fields in `documents` collection (recommended):
  - id (auto)
  - name
  - category (e.g., "1ère Année/Mathématiques")
  - type (pdf/notes/exam)
  - academicYear
  - storagePath
  - filename
  - createdBy (uid)
  - createdAt (timestamp)

Suggestions system
- Public submit form: category selector, title, detailed description, live preview panel
- Firestore collection: `suggestions` with fields:
  - id (auto)
  - category
  - title
  - description
  - status ("unread" | "read")
  - createdAt
  - email (optional)
- Admin dashboard features:
  - Total suggestions count
  - Unread suggestions count
  - Recent suggestions count (last 7 days)
  - Filters: by category, unread
  - Actions: mark as read, delete suggestion

Firebase integration & security notes
- Collections: `documents`, `suggestions`, `users` (optional)
- Storage: organize files under `/documents/{year}/{category}/{filename}`
- Security rules (high-level):
  - Documents: read allowed to all; write/delete only allowed to authenticated admins
  - Suggestions: create allowed to public; read/list/modify/delete only allowed to admins
  - Users: only admins can set role flags (use server/Cloud Functions or admin console)
- Authentication: Firebase Auth with email/password; admin flag set via custom claim or `users` collection

UI/UX & interactions
- Modal-style library overlay with backdrop blur (glass)
- Animated entrance effects (scroll-triggered) for sections and cards
- Success/alert notifications for upload/delete/submit actions
- Live preview for suggestion form (mirrors title and description in a styled card)
- Future activities blurred (filter: blur(8px)); hover reveals content + ancient Greek enigma
- Admin login removes blur from all future activities permanently
- Accessibility: labels on forms, keyboard focus for modal, alt text for images

3D Canvas & Particles
- Lightweight Three.js scene (low poly floating geometry) or a WebGL shader-based particle system
- **Performance strategy** (cumulable) :
  - Détection mobile (`window.innerWidth < 768`) → désactiver Three.js
  - Respecter `prefers-reduced-motion` du système
  - CSS fallback : remplacer le canvas 3D par un `linear-gradient` animé via CSS (GPU-native, zéro impact CPU/JS) sur mobile et/ou reduced-motion
- Provide an option to pause/disable animation for mobile or low-power devices
- Place canvas as background layer behind hero and header (z-index and pointer-events management)

Folder structure (suggested)
- public/
  - index.html
  - assets/
    - fonts/
    - images/
- src/
  - app.js (or main.js)
  - firebase.js (initialization + helpers)
  - styles/
  - components/
    - Header.js
    - Hero.js
    - Canvas3D.js
    - Particles.js
    - Timeline.js
    - DocumentLibrary.js
    - DocumentCard.js
    - LoginForm.js
    - AdminDashboard.js
    - SuggestionsForm.js
    - SuggestionList.js

Mapping to index.html & app.js (suggested function/component hooks)
- index.html:
  - root container and modal targets
  - link fonts and theme CSS
  - include index.html sections with semantic ids: #histoire, #activites, #documents, #concours, #serment-techno, #suggestions
- app.js:
  - initApp(): initialize Firebase, auth listener
  - mountUI(): wire header links to smooth-scroll
  - renderCanvas(): initialize 3D scene & particles
  - openDocumentLibrary(): show modal and load categories
  - fetchDocuments(category): query Firestore
  - uploadDocument(metadata, file): upload to Storage and create Firestore doc
  - submitSuggestion(data): add to `suggestions`
  - adminActions(): set up markAsRead/delete handlers

Acceptance criteria / checklist
- [ ] Header with fixed luxury styling + nav links (works across viewport sizes)
- [ ] Hero with 3D canvas background + CTA
- [ ] Histoire section content
- [ ] Activités timeline + activity cards (data-driven) with future activities blurred, hover-to-reveal with Greek enigmas, and unblur on admin login
- [ ] Documents modal with sidebar tree, document cards, download, delete
- [ ] Admin login and role-based UI gating
- [ ] Document upload: Storage + Firestore metadata + success/failure notifications
- [ ] Suggestions form + live preview + admin dashboard with counts and filters
- [ ] Firestore & Storage security rules implemented and tested
- [ ] Responsive and accessible across major screen sizes

Implementation plan (phased)
1. Project scaffolding: index.html, app.js, CSS, Firebase project setup
2. Header, Hero, and basic sections (Histoire, Activités, Concours, Serment Techno)
3. 3D canvas + particle background (desktop-first)
4. Document modal UI and Firestore read-only functionality
5. Auth and admin gating
6. Upload form + Storage write + Firestore write
7. Suggestions form + admin dashboard
8. Polish visuals, animations, fonts, responsive tweaks

Testing & verification
- Unit: small helper functions (optional)
- Manual: upload flows, suggestion submission, admin actions, responsive checks
- Security: test Firebase rules using the Firebase emulator or console

Notes & next steps
- If preferred, map each UI component to the exact lines in `index.html` and `app.js`—provide the files and a targeted mapping will be produced.
- Consider storing large documents metadata and CDN-cache headers when deploying for production.

---
Generated specification based on provided feature list. Request mapping to index.html/app.js or a starter template to continue.b
