# Roadmap Enrichie — Label Prestige Promotional Website

> Dernière mise à jour : 15/06/2026 (permissions refondues : droits par `poste` ; ajout Concours management)
> Les textes du site sont définis dans `CARTOGRAPHIE_TEXTE.md` et `TEXTES_MODIFIABLES.md`.

---

## Instructions pour l'agent IA

1. **Pas de génération de contenu autonome** — Utilise toujours les textes listés dans `CARTOGRAPHIE_TEXTE.md`.
2. **Exécution séquentielle** — Suis chaque phase dans l'ordre.
3. **Vérification** — Après chaque phase, `npm run build` et confirmation utilisateur.
4. **Fidélité technique** — Stack défini dans `PROMOTIONAL_WEBSITE_SPEC.md`.

---

## Phase 0 — Environment & Project Scaffolding
**Statut : ✅ Terminée**

Objectif : Serveur de dev local, structure de dossiers, Firebase SDK, Google Fonts, CSS design tokens.

| # | Tâche | Notes |
|---|-------|-------|
| 0.1-0.9 | Création package.json, Vite, Firebase SDK, dossiers, fonts, CSS, firebase.js | Vérifié : `npm run dev` fonctionne |

---

## Phase 1 — Header & Navigation
**Statut : ✅ Terminée**

Objectif : Header fixe luxueux avec liens de navigation et menu hamburger responsive.

| # | Tâche | Notes |
|---|-------|-------|
| 1.1-1.7 | Header HTML + Header.js (smooth-scroll) + CSS glassmorphism + hamburger + responsive | |

---

## Phase 2 — Hero & Content Sections
**Statut : ✅ Terminée**

Objectif : Hero visuellement fort + sections de contenu statiques (Histoire, Activités timeline, Concours, Serment Techno).

| # | Tâche | Notes |
|---|-------|-------|
| 2.1-2.3 | Hero (HTML + Hero.js animation entrée + styles) | Textes officiels |
| 2.4 | Section Histoire (3 paragraphes) | |
| 2.5-2.7 | Section Activités (structure timeline + Timeline.js avec 8 activités, énigmes, flou futur) | |
| 2.8-2.9 | Sections Concours (grille) + Serment Techno | |
| 2.10 | ScrollAnimations.js (IntersectionObserver) | |

---

## Phase 3 — 3D Canvas & Particle Background
**Statut : ✅ Terminée**

Objectif : Scène Three.js légère derrière le hero. Fallback CSS animé sur mobile.

| # | Tâche | Notes |
|---|-------|-------|
| 3.1 | Installer Three.js | `npm install three` |
| 3.2-3.4 | Canvas3D.js : renderer, scene, camera, géométrie low-poly, animation lente | 4 icosaèdres wireframe dorés |
| 3.5 | Particles.js : système de particules | 300 particules, mouvement brownien |
| 3.6 | Calque position fixe, z-index, pointer-events | Déjà dans main.css |
| 3.7 | Détection mobile + prefers-reduced-motion | Désactive Three.js si mobile/reduced-motion |
| 3.8 | CSS fallback animé | linear-gradient animé via @keyframes (GPU) |
| 3.9 | Audit performance | Build OK (34 modules) |

---

## Phase 4 — Authentication & Admin Gating
**Statut : ✅ Terminée**

Objectif : Connexion des membres du bureau, UI admin conditionnelle, permissions par poste.

### Firestore collections
- **`users/{uid}`** : `{ name, email, role, poste, promotion, active }`
  - Les permissions sont gérées par **`poste`** (pas `role`)
  - `active: false` → déconnexion immédiate côté app
- **`config/roles`** : `{ items: [...] }` — liste des postes (immuable, fournie par l'utilisateur)

### Permission matrix
| poste | Membres (éditer) | Membres (activer) | Activités (CRUD) | Concours (modifier) | Suggestions | Documents |
|---|---|---|---|---|---|---|
| `developpeur` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `président` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `*bureau*` (autres) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| non connecté | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

- Matching flexible des postes présidents : `"presidente_24"` match `"président"` (via `posteMatches()` : startsWith insensible à la casse et aux accents)

### Textes du site (source : CARTOGRAPHIE_TEXTE.md section F & K)
- Login modal : Email, Mot de passe, "Se connecter"
- Messages : `Veuillez remplir tous les champs.`, `Connexion réussie !`, `Identifiants incorrects.`
- Placeholders : `Entrez votre email`, `Entrez votre mot de passe`

| # | Tâche | Notes |
|---|-------|-------|
| 4.1 | LoginForm.js : modal email/password | UI + `signInWithEmailAndPassword()` |
| 4.2 | `onAuthStateChanged` → lire `users/{uid}.role` dans Firestore | Stocker dans un état global simple |
| 4.3 | Header : bouton "Panneau d'Administration" visible si connecté | + bouton Déconnexion |
| 4.4 | Déblurrage des activités futures si connecté | Remove `.future-activity` class |
| 4.5 | Gestion erreurs auth + feedback utilisateur | Messages FR |
| 4.6 | Création comptes Firebase Auth via Console | Option B : hors scope UI |

---

## Phase 5 — Admin Dashboard (Hub central)
**Statut : ✅ Terminée**

Objectif : Panneau central avec onglets pour gérer activités, membres, suggestions.

| # | Tâche | Notes |
|---|-------|-------|
| 5.1 | AdminDashboard.js : onglets avec visibilité par poste | Activités : `['developpeur','président']`, Membres : `['developpeur']`, Suggestions : tous |
| 5.2 | CSS dashboard : tabs, cards, boutons d'action | |
| 5.3 | Intégration Header : clic "Panneau d'Administration" → ouvre dashboard | Overlay ou page dédiée |

---

## Phase 6 — Activities CRUD (Firestore + Admin Panel)
**Statut : ✅ Terminée**

Objectif : Les activités passent d'un tableau statique à Firestore. Les membres avec poste `developpeur` ou `président` peuvent créer/modifier/supprimer des activités depuis l'admin. Les énigmes sont gérées via un pool dédié.

### Restriction d'accès
- Onglet Activités visible uniquement si `poste ∈ ["developpeur", "président"]`
- `président` ne peut renseigner que le nom et la date de l'activité ; les autres champs (description, énigme, ordre) sont gérés par `developpeur`

### Firestore collections
- **`activites/{autoId}`** : `{ date, title, description, enigme, enigmeHint, order, createdAt }`
- **`enigmes/{autoId}`** : `{ enigme (grec ancien), enigmeHint (traduction), used (boolean) }`

### Logique de pioche des énigmes
1. À la création d'une activité → pioche aléatoire d'une énigme `used: false`
2. L'énigme passe à `used: true` après assignation
3. Si plus aucune énigme disponible → toutes repassent à `used: false` (cycle)

### Seed au premier lancement
- **8 activités existantes** de `Timeline.js` vers Firestore si collection vide
- **15 énigmes grecques** créées automatiquement

| # | Tâche | Notes |
|---|-------|-------|
| 6.1 | Créer collections `activites` + `enigmes` dans Firestore | |
| 6.2 | Seed automatique des 8 activités + 15 énigmes au premier lancement | Si collections vides |
| 6.3 | AdminActivities.js : liste des activités avec boutons Modifier/Supprimer/Ajouter | Onglet Activités du dashboard |
| 6.4 | ActivityForm.js (modal) : date, titre, description, ordre | Énigme assignée auto, modifiable manuellement |
| 6.5 | `addActivity()`, `updateActivity()`, `deleteActivity()` | Firestore writes |
| 6.6 | Timeline.js refactor : lire depuis Firestore, fallback vers tableau statique si vide | Garder flou futur/passé existant |
| 6.7 | Notifications succès/erreur FR | |
| 6.8 | ActivityForm limité pour `président` : seuls nom + date sont modifiables | Autres champs en lecture seule |

---

## Phase 6.5 — Concours Management (Admin Edit)
**Statut : ✅ Terminée**

Objectif : Les président·es et le développeur peuvent ajouter et modifier les informations des concours depuis l'admin.

### Firestore
- **Collection `concours/{autoId}`** : `{ category, name, ecole, option, filieres, frais, composition, matieres, periode, resultats, description, order, createdAt }`
- 8 concours seedés au premier lancement (4 INP-HB + 4 Extérieur)

### Règles d'accès
- Onglet Concours visible si `poste` matche `developpeur` ou `président` (matching flexible)

| # | Tâche | Notes |
|---|-------|-------|
| 6.5.1 | Créer collection Firestore `concours` + seed automatique des 8 concours | Si collection vide |
| 6.5.2 | AdminConcours.js : liste des concours avec bouton Modifier + Ajouter | Tableau : Ordre, Catégorie, Nom |
| 6.5.3 | ConcoursForm.js : modal avec tous les champs (text + textarea) | Ajout + édition, catégorie (select) + nom + tous les champs |
| 6.5.4 | Onglet Concours dans AdminDashboard | `requires: ['developpeur', 'président']` |

---

## Phase 7 — Members Management
**Statut : ✅ Terminée**

Objectif : Gérer les membres du bureau selon les permissions par poste.

### Règles d'affichage AdminMembers.js
- `developpeur` : édition complète (rôle, poste, activation), postes depuis `config/roles`
- `président` : activation/désactivation instantanée uniquement
- Autres : liste en lecture seule

| # | Tâche | Notes |
|---|-------|-------|
| 7.1 | AdminMembers.js : liste des membres Firestore | Onglet Membres (visible `developpeur` uniquement) |
| 7.2 | Édition rôle/poste par `developpeur` uniquement | Postes depuis `config/roles`, selects inline avec bouton Sauvegarder |
| 7.3 | Activation/désactivation (`active: true/false`) | `developpeur` + `président` ; instantanée pour président, via save pour dev |
| 7.4 | Création des comptes via Firebase Console (documenté dans l'UI) | Hors scope de l'application |
| 7.5 | CSS table membres + formulaires | Inline selects + toggle checkbox |

---

## Phase 8 — Document Library Modal (Read-Only)
**Statut : ✅ Terminée**

Objectif : Modale bibliothèque de documents avec lecture depuis Firestore.

### Textes du site (source : sections F & G)
- Titre section : `Base de Documents`
- Titre modale : `Bibliothèque Technique`
- Arborescence : 1ère Année (Mathématiques, Physique, Chimie, Sciences Industrielles, Informatique), 2ème Année, Concours Spéciaux
- Messages : `Chargement des documents...`, `Aucun document disponible`, `Erreur de chargement`

| # | Tâche | Notes |
|---|-------|-------|
| 8.1 | Création collection Firestore `documents` | Créée à l'upload (Phase 9) |
| 8.2 | DocumentLibrary.js : modale overlay + arborescence | Expand/collapse, highlight, ouverture via nav + hero |
| 8.3 | DocumentCard.js : carte document | Badge type, meta, bouton Télécharger |
| 8.4 | `fetchDocuments(category)` : requête Firestore | `where('category', '==', ...)` |
| 8.5 | Animation ouverture/fermeture modale | Réutilise le pattern `.login-modal-overlay` |

---

## Phase 9 — Document Upload + Delete (Admin)
**Statut : ⏳ À faire**

Objectif : Upload/suppression de documents par les membres connectés.

### Textes (sections G & K)
- Titre upload : `📤 Téléverser un document`
- Champs : Nom, Catégorie, Type (Cours/TD/Devoir/Correction/Autre), Année, Fichier
- Dialogues : `Veuillez remplir tous les champs...`, `Téléversement en cours...`, succès/erreur

| # | Tâche | Notes |
|---|-------|-------|
| 9.1 | UI formulaire upload (visible si connecté) | |
| 9.2 | `uploadDocument()` : Storage + Firestore | |
| 9.3 | Barre de progression + notification | |
| 9.4 | Bouton Delete sur DocumentCard (admin) + confirmation | |
| 9.5 | `deleteDocument()` : Firestore + Storage cleanup | |

---

## Phase 10 — Suggestions System
**Statut : ⏳ À faire**

Objectif : Formulaire public de suggestions + dashboard admin.

### Textes (sections H & K)
- Titre : `Boîte à Suggestions`
- Catégories : Événements & Activités, Pédagogie & Cours, Infrastructure & Équipements, Communication & Réseaux sociaux, Vie Associative, Autres
- Dashboard : stats (Total, Non lues, 7 jours), filtres, actions

| # | Tâche | Notes |
|---|-------|-------|
| 10.1 | Créer collection Firestore `suggestions` | |
| 10.2 | SuggestionsForm.js : formulaire + live preview | |
| 10.3 | `submitSuggestion()` → Firestore | |
| 10.4 | SuggestionList.js (admin) : stats + filtres + marquer lu + supprimer | Onglet Suggestions du dashboard |

---

## Phase 11 — Firebase Security Rules
**Statut : ⏳ À faire**

Objectif : Règles Firestore et Storage pour la production.

| # | Tâche | Notes |
|---|-------|-------|
| 11.1 | Règles Firestore : `documents` (read all, write admin), `suggestions` (create all, read/modify admin), `activites` (read all, write bureau+super_admin), `enigmes` (read all, write admin), `concours` (read all, write developpeur+président), `users` (read/write super_admin only), `config` (read all, write super_admin) | |
| 11.2 | Règles Storage : `/documents/{year}/{category}/{filename}` | Write admin only |
| 11.3 | Tests avec Firebase Emulator | |
| 11.4 | Déploiement règles | |

---

## Phase 12 — Polish, Responsiveness & Deployment
**Statut : ⏳ À faire**

Objectif : Audit visuel, responsive, accessibilité, déploiement.

| # | Tâche | Notes |
|---|-------|-------|
| 12.1-12.14 | Audit design, responsive, accessibilité, Lighthouse, favicon, hosting, build, déploiement | |

---

*Roadmap générée le 15/06/2026 — 9 phases terminées (dont Phase 6.5), 4 à faire.*
