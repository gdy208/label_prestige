# Promotional Website — Project Specification

## Project overview
A luxury-branded promotional website for an academic/association audience. Key goals: showcase history and activities, provide a document library (public + admin upload), manage suggestions from users, and present a high-end visual identity with 3D canvas + particle effects.

## Tech stack
- **Build**: Vite 8 (vanilla JS, ES modules)
- **Runtime**: Firebase 12 (Auth, Firestore, Storage)
- **3D**: Three.js (low-poly floating geometry + particles), CSS gradient fallback on mobile/reduced-motion
- **Fonts**: Cinzel (display), Playfair Display (headings), Inter (body)
- **Hosting**: Firebase Hosting or Netlify/Vercel

## Branding & typography
- Theme: Luxury (gold/glass, glassmorphism, subtle motion)
- Colors: gold accents (#C9A34D), deep navy/black background (#0A0E1A), semi-transparent glass panels
- Fonts: Cinzel (display/luxury), Playfair Display (headings), Inter (body)

## Navigation & layout
- Fixed header with links: Histoire | Activités | Documents | Concours | Serment Techno | Suggestions
- Hero section: branded title, subtitle, CTA button
- Background: 3D canvas + particle effects (Three.js); CSS gradient fallback on mobile or prefers-reduced-motion
- Responsive: collapsed mobile header, hamburger menu, simplified hero

## Sections
1. **Hero** — branded title, subtitle, CTA
2. **Histoire** — Association mission & vision (3 paragraphs)
3. **Activités** — Timeline roadmap with activity cards from Firestore. Future activities blurred (`filter: blur(8px)`). Admin login removes blur permanently.
4. **Documents** — "Base de Documents" modal/library with sidebar tree and document viewer
5. **Concours** — Contest descriptions (CAE, GIN, GCN, A2GP + ISE-ECO, ECC, CCINP, FUI-FF)
6. **Serment Techno** — Membership, commitments, payment/promo
7. **Suggestions** — Public suggestion form + live preview; admin dashboard for management

## Authentication & Permissions

### Firestore `users/{uid}`
Champs : `uid`, `name`, `email`, `role` (`super_admin` | `bureau`), `poste`, `promotion`, `active`

### Permission par poste (`poste`)
Les droits sont gérés par le champ **`poste`** (pas `role`). Le `role` est un second niveau indicatif.

| Poste | Membres (éditer) | Membres (activer/inactiver) | Activités (CRUD) | Concours (modifier) | Suggestions | Documents |
|---|---|---|---|---|---|---|---|
| **developpeur** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **président** (et dérivés) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **\*bureau\*** (autres) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Non connecté | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

- `"developpeur"` : seul à pouvoir éditer le rôle et le poste des autres membres
- `"président"` : peut activer/désactiver les comptes uniquement
- Les autres membres (bureau) : suggestions + upload documents uniquement
- Non connecté : lecture seule

### Membres — cas d'usage
- Création des comptes Firebase Auth via la **Console Firebase** (Option B — pas d'UI)
- L'app lit `users/{uid}` sur `onSnapshot` pour refléter les changements en temps réel
- Désactivation : `active: false` dans Firestore → déconnexion immédiate via `onSnapshot`

## Activities system (Firestore CRUD)
- **Collection `activites`**: `{ date, title, description, order, createdAt }`
- AdminActivities panel (dans AdminDashboard) : créer, modifier, supprimer une activité
- **Restreint aux postes** `developpeur` et `président`
- Timeline.js lit depuis Firestore ; fallback vers tableau statique si collection vide
- Activités futures (date > now) : flou `filter: blur(8px)` sur `.future-activity` ; retiré si admin connecté

## Concours system (Firestore edit)
- **Collection `concours`** : `{ category, name, ecole, option, filieres, frais, composition, matieres, periode, resultats, description, order, createdAt }`
- 8 concours seedés au premier lancement (4 INP-HB + 4 Extérieur)
- AdminConcours panel (dans AdminDashboard) : liste, ajouter et modifier chaque concours
- **Restreint aux postes** `developpeur` et `président`
- ConcoursForm.js : modal avec tous les champs (text, select, textarea) — ajout et édition
- Le nom et la catégorie (INP-HB / Extérieur) sont requis à la création ; `order` est auto-incrémenté

## Admin Dashboard
- `AdminDashboard.js` : hub central accessible via bouton "Panneau d'Administration" dans le header (visible si connecté)
- Onglets :
  - **Activités** : visible si `poste` matche `developpeur` ou `président`
  - **Concours** : visible si `poste` matche `developpeur` ou `président`
  - **Membres** : visible si `poste === "developpeur"`
  - **Suggestions** : visible pour tout admin connecté
- Matching flexible des postes : `"presidente_24"` match `"président"` (startsWith insensible à la casse et aux accents)

## Members management
- `AdminMembers.js` panel affiché dans l'onglet Membres du dashboard (visible `developpeur` uniquement)
- **Fonctionnalités selon poste :**
  - `"developpeur"` : lister, éditer rôle (select bureau/super_admin) + poste (input texte libre) + promotion (input texte libre), activer/désactiver — bouton Sauvegarder par ligne
  - `"président"` (matching flexible) : lister, activer/désactiver instantanément (toggle direct)
  - Autres : liste en lecture seule
- Création des comptes Firebase Auth via la console Firebase (hors scope de l'UI)
- La collection `users` expose : `name`, `email`, `role`, `poste`, `active`, `promotion`
- `poste` et `promotion` sont des champs texte libre (input), pas de sélection depuis une liste prédéfinie

## Document Library
- Triggered modal / overlay "Bibliothèque Technique" with two-pane layout:
  - Left: Tree navigation (1ère Année & 2ème Année → Mathématiques/Physique/Chimie/Sciences Industrielles/Informatique, Sujets Concours)
  - Right: Document grid of document cards
- Ouverture via lien de navigation "Documents" ou bouton hero "Accéder aux Ressources"
- DocumentCard : badge type (Cours/TD/Devoir/Correction/Autre), meta, bouton Télécharger
- Firestore `documents` collection : `{ name, category, type, academicYear, storagePath, filename, createdBy, createdAt }`
- Admin-only upload/delete : Phase 9

## Suggestions system
- Public submit form: category selector, title, description, live preview
- Firestore collection `suggestions`: `{ category, title, description, status ("unread"|"read"), createdAt, email (optional) }`
- Admin dashboard: stats (total, unread, last 7 days), filters by category, mark as read, delete

## 3D Canvas & Particles
- Three.js scene with low-poly floating geometry + particle system
- Performance fallback strategy (cumulable):
  - Détection mobile (`window.innerWidth < 768` ou `maxTouchPoints > 0`) → désactiver Three.js
  - Respecter `prefers-reduced-motion: reduce`
  - CSS fallback : `linear-gradient` animé via CSS (GPU-native)
- Canvas en arrière-plan : `position: fixed; z-index: -1; pointer-events: none`

## Firestore collections summary
| Collection | Description |
|---|---|
| `documents` | Document metadata (name, category, type, academicYear, storagePath, filename, createdBy, createdAt) |
| `suggestions` | User suggestions (category, title, description, status, createdAt, email) |
| `activites` | Activities for timeline (date, title, description, order) |
| `concours` | Contest data (category, name, ecole, option, filieres, frais, composition, matieres, periode, resultats, description, order) |
| `users` | User roles (uid, name, email, role, poste, promotion, active) |
| `config/roles` | Predefined role list (items array) |

## Folder structure
```
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
    AdminActivities.js
    AdminConcours.js
    ConcoursForm.js
    AdminMembers.js
    SuggestionsForm.js
    SuggestionList.js
    ScrollAnimations.js
```

## Acceptance criteria
- [x] Phase 0: Scaffolding (Vite, Firebase, CSS design tokens)
- [x] Phase 1: Header + navigation (smooth-scroll, hamburger)
- [x] Phase 2: Hero + content sections (Histoire, Activités, Concours, Serment)
- [x] Phase 3: 3D Canvas + particles + CSS fallback
- [x] Phase 4: Auth + admin gating (login/logout, permission detection, admin UI conditional)
- [x] Phase 5: Admin Dashboard hub (tabs: Activités, Membres, Suggestions)
- [x] Phase 6: Activities CRUD (Firestore + AdminActivities + Timeline refactor, future blur)
- [x] Phase 6.5: Concours management (Firestore + AdminConcours + ConcoursForm ajout/édition)
- [x] Phase 7: Members management (Firestore users + AdminMembers) — permission par `poste`
- [x] Phase 8: Document Library modal (Firestore read)
- [x] Phase 9: Document upload + delete (admin only)
- [x] Phase 10: Suggestions form + admin dashboard
- [x] Phase 11: Firebase Security Rules (firestore.rules, firebase.json, Supabase RLS doc)
- [x] Phase 12: Polish, responsiveness, deployment
