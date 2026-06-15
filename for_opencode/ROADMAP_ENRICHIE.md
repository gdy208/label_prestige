# Roadmap Enrichie — Label Prestige Promotional Website

> Roadmap originale issue de [ROADMAP.md](./ROADMAP.md), enrichie des textes du site extraits dans [RESULTATS_ANALYSE.md](./RESULTATS_ANALYSE.md) (section 3).

---

## Instructions pour l'agent IA

1. **Pas de génération de contenu autonome** — Ne génère PAS toi-même les textes informatifs, descriptions ou copy des sections. Utilise les textes listés ci-dessous.
2. **Consultation utilisateur obligatoire** — Demande toujours à l'utilisateur le texte spécifique si un placeholder est nécessaire.
3. **Exécution séquentielle** — Suis chaque phase et tâche dans l'ordre.
4. **Vérification** — Après chaque phase, confirme avec l'utilisateur avant de passer à la suivante.
5. **Fidélité technique** — Respecte strictement la stack technique et les règles de branding définies dans `PROMOTIONAL_WEBSITE_SPEC.md`.

---

## Phase 0 — Environment & Project Scaffolding

> **Objectif :** Serveur de dev local fonctionnel, structure de dossiers en place, projet Firebase créé, dépendances installées.

**Textes du site concernés :** Aucun (phase d'infrastructure uniquement).

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 0.1 | Créer le dossier racine et `package.json` | DevOps | — |
| 0.2 | Installer Vite | DevOps | — |
| 0.3 | Créer la structure de dossiers | Frontend | Voir arborescence ci-dessous |
| 0.4 | Créer un projet Firebase (Console) | DevOps | Activer Firestore, Storage, Auth |
| 0.5 | Installer Firebase SDK | DevOps | — |
| 0.6 | Créer `src/firebase.js` | Backend | — |
| 0.7 | Ajouter Google Fonts : **Cinzel**, **Playfair Display**, **Inter** | Frontend | — |
| 0.8 | Créer `main.css` avec les custom properties | Design | — |
| 0.9 | Vérifier que `npm run dev` sert une page blanche avec les bonnes polices | DevOps | — |

---

## Phase 1 — Header & Navigation

> **Objectif :** Header fixe luxueux avec liens de navigation et menu hamburger responsive.

**Textes du site concernés (source : section B) :**

- **Logo :** `LABEL PRESTIGE`
- **Liens de navigation :**
  - `Histoire` → `#histoire`
  - `Activités` → `#activites`
  - `Documents` → `#documents`
  - `Concours` → `#concours`
  - `Serment Techno` → `#serment-techno`
  - `Suggestions` → `#suggestions`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 1.1 | Structure HTML du `<header>` et `<nav>` | Frontend | Utiliser les textes ci-dessus |
| 1.2 | `Header.js` : smooth-scroll vers chaque section | Frontend | — |
| 1.3 | Style glassmorphism, bordure dorée, police Cinzel | Design | — |
| 1.4 | Bouton Login (UI uniquement) | Frontend | — |
| 1.5 | Icône hamburger (CSS ou JS min) | Frontend | — |
| 1.6 | Menu overlay mobile | Frontend | — |
| 1.7 | Breakpoint responsive ≤ 768px | Design | — |

---

## Phase 2 — Hero Section & Content Sections

> **Objectif :** Hero visuellement fort + sections de contenu statiques.

### Hero (source : section C)

- **Titre principal :** `SITE OFFICIEL DU LABEL PRESTIGE`
- **Sous-titre :** `Association des Élèves Techno de l'INP-HB`
- **CTA :** `Découvrir l'Association`

### Section Notre Histoire (source : section D)

- **Titre :** `Notre Histoire`
- **Paragraphe 1 :**
  ```
  Le Label Prestige est une association d'élèves techno de l'INP-HB fondée avec pour mission de rassembler, représenter et accompagner les étudiants technologiques dans leur parcours académique et professionnel.
  ```
- **Paragraphe 2 :**
  ```
  Depuis sa création, l'association a su s'imposer comme un acteur majeur de la vie estudiantine à l'INP-HB, organisant des événements, des conférences et des activités qui renforcent la cohésion entre les étudiants et leur permettent de développer leurs compétences.
  ```
- **Paragraphe 3 :**
  ```
  Notre vision est de créer une communauté solidaire où chaque étudiant techno peut s'épanouir, progresser et contribuer au rayonnement de notre école et de notre pays.
  ```

### Section Nos Activités (source : section E)

- **Titre :** `Nos Activités`
- **8 activités** avec date, titre, description. Les activités futures (Otakunight, Soirée ciné, Collecte de fonds, Projection CAN, AKWABA TECHNO, Interclasses Techno) sont floutées (blur 8px) par défaut. Le survol supprime le flou et révèle une énigme en grec ancien avec sa traduction. La connexion admin supprime définitivement le flou.

### Section Concours (source : section I)

- **Titre :** `Concours`
- **Catégorie INP-HB** : CAE, GIN, GCN, A2GP (cf. `CARTOGRAPHIE_TEXTE.md` section 9 pour les textes exacts)
- **Catégorie Extérieur** : ISE-ECO, ECC, CCINP, FUI-FF
- Chaque concours avec : école(s), frais, composition, matières, période, résultats, description

### Section Serment Techno (source : section J)

- **Titre :** `Serment Techno`
- **Sous-titre :** `HONORE TON ENGAGEMENT`
- **4 textes d'accompagnement :**
  - Rejoins l'élite des Technos...
  - Investis dans ton avenir...
  - Sois reconnu et respecté...
  - Ne sois pas celui qui manque à l'appel...
- **Infos paiement :**
  ```
  Effectue ton Serment Techno par Wave, Orange Money ou MTN Mobile Money :
  +225 0712344296 et +225 0710019161
  "L'excellence n'est pas un acte, mais une habitude. Ton Serment Techno en est la première expression."
  ```
- **Galerie du pull exclusif :** 4 images, alt : `Pull Label Prestige`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 2.1 | `<section id="hero">` avec titre, sous-titre, CTA | Frontend | Textes ci-dessus |
| 2.2 | `Hero.js` : animation d'entrée | Frontend | — |
| 2.3 | Style hero : plein écran, centré, overlay | Design | — |
| 2.4 | `<section id="histoire">` avec les 3 paragraphes | Frontend | Police Playfair Display |
| 2.5 | `<section id="activites">` structure timeline | Frontend | — |
| 2.6 | `Timeline.js` avec les 8 activités, énigmes grecques et dates | Frontend | Activités futures masquées (classe `.future-activity`) ; énigmes et traductions dans le HTML au survol |
| 2.7 | Style glassmorphism des cartes activités + flou des activités futures | Design | `.future-activity { filter: blur(8px); }` ; au hover `blur(0)` + affichage de l'énigme |
| 2.8 | `<section id="concours">` en grille | Frontend | — |
| 2.9 | `<section id="serment-techno">` | Frontend | — |
| 2.10 | Animations scroll-triggered | Frontend | — |

---

## Phase 3 — 3D Canvas & Particle Background

> **Objectif :** Scène Three.js légère derrière le hero. Fallback CSS animé sur mobile pour éviter les lags.

**Textes du site concernés :** Aucun (élément visuel uniquement).

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 3.1 | Installer Three.js | DevOps | `npm install three` |
| 3.2 | `Canvas3D.js` : renderer, scene, camera | Frontend | — |
| 3.3 | Géométrie flottante low-poly | Frontend | — |
| 3.4 | Animation lente | Frontend | — |
| 3.5 | `Particles.js` : système de particules | Frontend | — |
| 3.6 | Calque position fixe, z-index, pointer-events | Design | — |
| 3.7 | Détection mobile + `prefers-reduced-motion` | Frontend | Si mobile ou `reduce-motion`, désactiver Three.js et activer CSS fallback |
| 3.8 | CSS fallback animé | Frontend | `linear-gradient` animé via CSS (GPU-native) comme remplacement léger |
| 3.9 | Audit performance | Frontend | Vérifier FPS sur mobile + desktop |

---

## Phase 4 — Document Library Modal (Read-Only)

> **Objectif :** Modale bibliothèque de documents avec lecture depuis Firestore.

### Textes du site concernés

**Section Base de Documents (source : section F) :**
- **Titre :** `Base de Documents`
- **Formulaire d'accès** (pour le bureau) :
  - Label : `Nom d'utilisateur` — Placeholder : `Entrez votre nom d'utilisateur`
  - Label : `Mot de passe` — Placeholder : `Entrez votre mot de passe`
  - Bouton : `Se connecter`
- **Grille des catégories :**
  - 1ère Année : Mathématiques, Physique, Chimie, Science Industrielle, Informatique
  - 2ème Année : Mathématiques, Physique, Chimie, Science Industrielle
  - Concours Spéciaux : CCINP, ISFA, X Polytechnique, École Centrale Casablanca, Gbinzin

**Interface Bibliothèque Technique (source : section G) :**
- **Titre modale :** `Bibliothèque Technique`
- **Arborescence complète :**
  - `1ère Année` → Mathématiques, Physique, Chimie, Sciences Industrielles, Informatique
  - `2ème Année` → Mathématiques, Physique, Chimie, Sciences Industrielles
  - `Concours Spéciaux` → CCINP, ISFA, X Polytechnique, École Centrale Casablanca, Gbinzin
  - `Suggestions` (visible si connecté) → Gestion des Suggestions
- **Upload (admin uniquement) :** titre, champs, bouton `Téléverser`
- **Cartes de documents :** badge type, taille, description `Document partagé par {uploader}`, boutons `📥 Télécharger`, `🗑️ Supprimer`
- **Messages :**
  - Chargement : `Chargement des documents...`
  - Vide : `Aucun document disponible` — `Les membres du bureau n'ont pas encore téléversé de documents pour cette catégorie.`
  - Erreur : `Erreur de chargement` — `Impossible de charger les documents. Vérifiez votre connexion internet.`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 4.1 | Créer collection Firestore `documents` + seed | Backend | — |
| 4.2 | Uploader fichiers sample dans Storage | Backend | — |
| 4.3 | `DocumentLibrary.js` : modale overlay | Frontend | — |
| 4.4 | Panneau gauche : arborescence | Frontend | Textes ci-dessus |
| 4.5 | Expand/collapse des noeuds | Frontend | — |
| 4.6 | Highlight sélection | Frontend | — |
| 4.7 | `DocumentCard.js` | Frontend | — |
| 4.8 | `fetchDocuments(category)` | Backend | — |
| 4.9 | Clic arbre → requête → rendu cartes | Frontend | — |
| 4.10 | Action Télécharger | Backend | — |
| 4.11 | Fermeture modale | Frontend | — |
| 4.12 | Animation ouverture/fermeture | Design | — |

---

## Phase 5 — Authentication & Admin Gating

> **Objectif :** Connexion des membres du bureau, UI admin conditionnelle.

### Textes du site concernés

**Dialogues JS Login (source : section K) :**
- `Veuillez remplir tous les champs.`
- `Connexion réussie ! Accès aux fonctionnalités administrateur activé.`
- `Identifiants incorrects. Accès réservé aux membres du bureau.`
- `Bienvenue {username} dans l'espace administrateur du Label Prestige!`

**Comptes d'administration (source : section L) — 25 membres** avec identifiants (à ne pas exposer en production).

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 5.1 | `LoginForm.js` : modale email/mot de passe | Frontend | Utiliser labels de la section F |
| 5.2 | `signInWithEmailAndPassword()` | Backend | — |
| 5.3 | Créer comptes admin test | DevOps | — |
| 5.4 | Flag admin (Firestore `users` ou custom claims) | Backend | — |
| 5.5 | `onAuthStateChanged()` + état global `isAdmin` | Backend | — |
| 5.6 | UI admin conditionnelle (upload, delete, dashboard suggestions, déblurrage des activités futures) | Frontend | Supprimer la classe `.future-activity` des cartes après connexion admin |
| 5.7 | Bouton Logout | Frontend | — |
| 5.8 | Feedback utilisateur "Connecté en tant que..." | Frontend | — |
| 5.9 | Gestion erreurs auth | Frontend | Messages de la section K |

---

## Phase 6 — Document Upload (Admin)

> **Objectif :** Upload de documents par les admins.

### Textes du site concernés (source : section G)

- **Titre section upload :** `📤 Téléverser un document`
- **Champs :** Nom du document, Catégorie (dropdown), Type de document (dropdown), Année (dropdown), Fichier
- **Bouton :** `Téléverser`
- **Dialogues JS :**
  - `Vous devez être connecté pour téléverser un document.`
  - `Veuillez remplir tous les champs et sélectionner un fichier`
  - `Téléversement en cours...`
  - `Document "{docName}" téléversé avec succès!`
  - `Erreur lors du téléversement du document: {message}`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 6.1 | UI formulaire upload (visible admin uniquement) | Frontend | Textes ci-dessus |
| 6.2 | Validation client-side | Frontend | — |
| 6.3 | `uploadDocument()` vers Storage | Backend | — |
| 6.4 | Écriture metadata Firestore | Backend | — |
| 6.5 | Barre de progression | Frontend | — |
| 6.6 | Notification succès | Frontend | — |
| 6.7 | Notification erreur | Frontend | — |
| 6.8 | Rafraîchir liste après upload | Frontend | — |

---

## Phase 7 — Document Delete (Admin) + Storage Cleanup

> **Objectif :** Suppression de documents par les admins.

### Textes du site concernés (source : section G et K)

- `🗑️ Supprimer` (bouton sur chaque carte, admin uniquement)
- `Document non trouvé`
- `Erreur lors du téléchargement du document: {message}`
- `Vous devez être connecté pour supprimer un document.`
- `Êtes-vous sûr de vouloir supprimer ce document ?`
- `Document supprimé avec succès!`
- `Erreur lors de la suppression du document: {message}`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 7.1 | Bouton Delete sur chaque `DocumentCard` | Frontend | Visible admin uniquement |
| 7.2 | Dialogue de confirmation | Frontend | Texte ci-dessus |
| 7.3 | `deleteDocument()` : Firestore + Storage | Backend | — |
| 7.4 | Notification succès | Frontend | — |
| 7.5 | Mise à jour UI optimiste | Frontend | — |
| 7.6 | Gestion erreurs | Backend | — |

---

## Phase 8 — Suggestions System

> **Objectif :** Formulaire public de suggestions + dashboard admin.

### Textes du site concernés (source : section H et K)

**Section Boîte à Suggestions :**
- **Titre :** `Boîte à Suggestions`
- **Formulaire public :**
  - Titre : `💡 Soumettre une Suggestion`
  - Catégories : `Événements & Activités`, `Pédagogie & Cours`, `Infrastructure & Équipements`, `Communication & Réseaux sociaux`, `Vie Associative`, `Autres`
  - Label : `Titre de la suggestion` — Placeholder : `Titre concis de votre suggestion`
  - Label : `Description détaillée` — Placeholder : `Décrivez votre suggestion en détail...`
  - Boutons : `Aperçu` | `Soumettre la Suggestion`
- **Fenêtre d'aperçu :**
  - Titre : `👁️ Aperçu de votre Suggestion`
  - Placeholder : `Votre suggestion apparaîtra ici en temps réel`

**Tableau de Bord Admin :**
- Titre : `📊 Tableau de Bord des Suggestions`
- Statistiques : Total, Non lues, 7 derniers jours
- Filtres : Toutes, Non lues, Événements, Pédagogie, Infrastructure, Communication, Vie Associative, Autres
- Actions : `✓ Marquer comme lu` | `🗑️ Supprimer`
- États : Chargement, vide, erreur

**Dialogues JS Suggestions (source : section K) :**
- `Veuillez remplir tous les champs du formulaire.`
- `Envoi en cours...`
- `Votre suggestion a été soumise avec succès ! Merci pour votre contribution.`
- `Erreur lors de l'envoi de la suggestion: {message}`
- `Erreur lors du marquage de la suggestion: {message}`
- `Êtes-vous sûr de vouloir supprimer cette suggestion ?`
- `Suggestion supprimée avec succès!`
- `Erreur lors de la suppression de la suggestion: {message}`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 8.1 | Créer collection Firestore `suggestions` | Backend | — |
| 8.2 | `SuggestionsForm.js` avec catégories et champs | Frontend | Textes ci-dessus |
| 8.3 | Live preview temps réel | Frontend | — |
| 8.4 | `submitSuggestion()` | Backend | — |
| 8.5 | Notification succès + reset formulaire | Frontend | — |
| 8.6 | Dashboard admin : cartes stats | Frontend | — |
| 8.7 | `SuggestionList.js` : liste des suggestions | Frontend | — |
| 8.8 | Filtres par catégorie | Frontend | — |
| 8.9 | Action "Marquer comme lu" | Backend | — |
| 8.10 | Action "Supprimer" | Backend | — |
| 8.11 | Dashboard accessible uniquement si admin | Frontend | — |

---

## Phase 9 — Firebase Security Rules

> **Objectif :** Règles de sécurité Firestore et Storage pour l'environnement de production.

### Textes du site concernés (source : section L)

- **Configuration Firebase :**
  - `apiKey`, `authDomain`, `projectId: "label-76667"`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`
- **Collections :** `documents`, `suggestions`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 9.1 | Règles Firestore | Backend | Template dans ROADMAP.md |
| 9.2 | Règles Storage | Backend | Template dans ROADMAP.md |
| 9.3 | Tests avec Firebase Emulator | Backend | — |
| 9.4 | Tests cas positifs | Backend | — |
| 9.5 | Tests cas négatifs | Backend | — |
| 9.6 | Déploiement règles en production | DevOps | — |

---

## Phase 10 — Polish, Responsiveness & Deployment

> **Objectif :** Polish visuel final, accessibilité, responsive, déploiement.

### Textes du site concernés (source : section A)

- **Titre de l'onglet :** `Label Prestige - Site Officiel`

| # | Tâche | Owner | Notes |
|---|-------|-------|-------|
| 10.1 | Audit design system | Design | — |
| 10.2 | Cohérence glassmorphism | Design | — |
| 10.3 | Micro-animations | Design | — |
| 10.4 | Tests responsive | Frontend | — |
| 10.5 | Hero simplifié mobile | Frontend | — |
| 10.6 | Audit accessibilité | Frontend | — |
| 10.7 | Balises meta | Frontend | — |
| 10.8 | `<title>` avec `Label Prestige - Site Officiel` | Frontend | Section A |
| 10.9 | Favicon | Design | — |
| 10.10 | Optimisation assets | Frontend | — |
| 10.11 | Audit Lighthouse ≥ 90 | Frontend | — |
| 10.12 | Config hosting (Firebase/Netlify/Vercel) | DevOps | — |
| 10.13 | Build + déploiement | DevOps | — |
| 10.14 | Vérification production | DevOps | — |

---

## Contenu non couvert par la roadmap

Les textes suivants, présents dans le site, ne sont rattachables à aucune phase de la roadmap. Ils devraient être intégrés dans les phases correspondantes ou justifier des phases supplémentaires :

### Section K — Dialogues JavaScript (compléments techniques)
- Messages d'erreur et de confirmation pour les opérations CRUD (documents et suggestions). Déjà partiellement couverts dans les phases 6, 7, 8, mais les messages suivants sont absents :
  - `Document non trouvé` (phase 7)
  - `Erreur lors du téléchargement du document: {message}` (phase 4)

### Section L — Données Techniques
- **Configuration Firebase complète** (apiKey, authDomain, etc.) — utile pour la phase 0.6, mais les valeurs exactes ne sont pas mentionnées dans la roadmap.
- **Liste des 25 comptes d'administration** (username + mot de passe) — utile pour la phase 5.3 (création des comptes test). Non listée dans la roadmap.

### Messages d'état vides/erreur
- États vides de la bibliothèque (`Aucun document disponible`) et du dashboard suggestions (`Aucune suggestion`) — présents dans le HTML mais pas explicitement listés dans les tâches roadmap.

---

*Généré le 2026-06-14 à partir de RESULTATS_ANALYSE.md section 3, ROADMAP.md et PROMOTIONAL_WEBSITE_SPEC.md.*
