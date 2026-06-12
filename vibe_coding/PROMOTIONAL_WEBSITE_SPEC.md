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
3. Activités — Timeline roadmap + activity cards (date, description, theme/keywords)

### Fonctionnalité : Révélation Temporelle (Événements Mystères)

- Objectif : Ajouter un effet de teasing sur la frise chronologique afin que certaines activités apparaissent comme « mystérieuses » avant leur date officielle, puis se révèlent automatiquement une fois la date atteinte.

- Comportement fonctionnel :
  - Chaque activité possède dans ses données : date de l'événement, titre, description détaillée, et une "phrase mystère" (court texte alternatif).
  - Si la date système est antérieure à la date de l'événement => état FUTUR (mystère) :
    - Le titre et la description détaillée visibles dans la carte/ligne de la timeline sont floutés (CSS `filter: blur(...)`), non sélectionnables (`user-select: none`) et inaccessibles à la lecture par copie.
    - À la place, la "phrase mystère" est affichée au centre de la carte en couleur dorée (--color-gold) avec un contraste élevé; un petit badge « Révélation à : YYYY‑MM‑JJ » peut être affiché en bas en texte secondaire.
  - Si la date système est égale ou postérieure à la date de l'événement => état ACTUEL / PASSÉ :
    - Le flou est retiré dynamiquement, le vrai titre et la description détaillée redeviennent lisibles et sélectionnables.

- Exigences techniques :
  - Le composant Timeline (Timeline.js) doit effectuer, côté client, une comparaison en temps réel entre la date système (Date.now()) et la date de chaque activité.
  - L'application doit écouter les horodatages affichés et mettre à jour l'état visuel sans nécessiter un rechargement de page (par ex. recalcul chaque minute via `setInterval` ou `requestAnimationFrame` optimisé si nécessaire).
  - Le texte flouté doit rester présent dans le DOM pour le SEO côté rendu initial (si rendu serveur), mais visuellement caché par CSS et inaccessible à la sélection. Pour les crawlers, s'assurer que le contenu n'est pas masqué via `display:none` afin de préserver l'indexation.

- Exigences visuelles & d'accessibilité :
  - Respect de la charte luxe / glassmorphism : la carte timeline conserve un fond verre (`backdrop-filter`), bords arrondis et bordure dorée subtile pour les activités mystères.
  - La "phrase mystère" doit utiliser `--color-gold` et une typographie affichée (Playfair/Cinzel) avec taille légèrement augmentée pour l'effet teasing.
  - Ajouter un attribut ARIA sur la carte : `aria-hidden="true"` pour le texte flouté lorsque l'état est FUTUR, et `aria-hidden="false"` lorsque révélé. Fournir un `aria-label` ou `aria-describedby` pour indiquer « Événement mystère, révélation le YYYY‑MM‑JJ » afin d'aider les lecteurs d'écran.

- Contraintes de performance :
  - Le rendu du flou et le calcul des dates doivent être légers : appliquer/retirer une classe CSS au niveau du conteneur plutôt que modifier individuellement plusieurs styles inline.
  - Limiter les opérations DOM : pré-calculer les états (futur/actuel) pour la page visible et n'itérer que sur les éléments dans le viewport quand possible (utiliser `IntersectionObserver`).
  - L'effet de flou doit être GPU-accelerated (utiliser `will-change: filter` et transitions CSS) pour ne pas ralentir le scrolling ni provoquer de jank.

- Données & API :
  - Schéma recommandé pour chaque activité (Firestore / JSON) :
    - id
    - date (ISO 8601)
    - title
    - description
    - mysteryText
    - tags
    - createdAt
  - Backwards compatibility : si `mysteryText` est absent, le comportement par défaut est d'afficher le titre et la description normalement.

- Tests d'acceptation :
  - [ ] Une activité avec date future affiche la phrase mystère en doré et masque le titre/description
  - [ ] Après la date, l'activité révèle automatiquement le titre et la description sans rechargement
  - [ ] Le flou n'affecte pas la performance de scroll (mesure cible : 60 fps sur desktop moyen)
  - [ ] Les lecteurs d'écran lisent l'état via `aria-label`/`aria-describedby` approprié


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
- After login, admin-only UI appears: upload form, Suggestions sidebar item, suggestions dashboard

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
- Accessibility: labels on forms, keyboard focus for modal, alt text for images

3D Canvas & Particles
- Lightweight Three.js scene (low poly floating geometry) or a WebGL shader-based particle system
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
- [ ] Activités timeline + activity cards (data-driven)
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
