# Label Prestige — Site Officiel

Site vitrine de l'association **Label Prestige** (Association des Élèves Techno de l'INP-HB).

> **URL :** [label-website-cebde.web.app](https://label-website-cebde.web.app)  
> **Licence :** [MIT](LICENSE)

---

## Stack

| Technologie | Usage |
|---|---|
| **Vite 8** | Build vanilla JS ES modules |
| **Firebase 12** | Auth, Firestore, Hosting |
| **Supabase Storage** | Stockage documents et images |
| **Three.js** | 3D canvas + particules (fallback CSS sur mobile) |
| **Google Fonts** | Cinzel, Playfair Display, Inter |

## Installation

```bash
npm install
npm run dev       # dev server
npm run build     # production build
npm run preview   # preview build
```

## Configuration

Copier `.env.local` (fourni par le développeur) :

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

```
src/
├── app.js                    # Entrypoint
├── firebase.js               # Firebase init
├── supabase.js               # Supabase init
├── auth.js                   # Auth pub/sub store
├── seed.js                   # Auto-seed Firestore collections
├── components/
│   ├── Header.js
│   ├── Hero.js
│   ├── Timeline.js           # Activités roadmap (flou futur)
│   ├── ConcoursSection.js
│   ├── SermentSection.js     # Serment dynamique (numéros + pulls)
│   ├── Canvas3D.js / Particles.js
│   ├── ScrollAnimations.js
│   ├── LoginForm.js
│   ├── AdminDashboard.js     # Hub central admin
│   ├── AdminActivities.js / ActivityForm.js
│   ├── AdminConcours.js / ConcoursForm.js
│   ├── AdminMembers.js
│   ├── AdminSerment.js       # Gestion numéros + photos pull
│   ├── SuggestionList.js / SuggestionsForm.js
│   ├── DocumentLibrary.js / DocumentCard.js
└── styles/
    ├── main.css              # Design tokens + globals
    ├── components.css        # Tous les composants
    └── responsive.css        # Breakpoints
```

## Fonctionnalités

- **Timeline activités** — roadmap avec flou sur les activités futures, défloutage automatique pour les admins
- **Concours** — 8 concours INP-HB et extérieurs, modifiables via admin
- **Documents** — bibliothèque technique avec arborescence + upload/suppression (admins)
- **Suggestions** — formulaire public + dashboard admin (stats, filtres, actions)
- **Serment Techno** — section dynamique : numéros modifiables par tout admin, photos du pull uploadables par président et développeur
- **Membres** — gestion des rôles et permissions par `poste`
- **Mot du développeur** — message visible par tous les admins, éditable par le développeur

## Permissions

| poste | Activités | Concours | Membres | Suggestions | Documents | Serment (photos) |
|---|---|---|---|---|---|---|
| **developpeur** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **président\*** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **\*bureau\*** | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

## Déploiement

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

---

Ce projet est sous licence MIT — voir le fichier [LICENSE](LICENSE) pour plus de détails.

Développé avec ❤️ par **Gédéon Kouamé**
