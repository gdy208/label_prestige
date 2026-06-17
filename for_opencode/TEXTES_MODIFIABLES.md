# Textes modifiables par le client

Textes d'information à externaliser (JSON / CMS / config) pour permettre au client de les modifier sans toucher au code.

---

## 1. Identité du site

| Champ | Valeur par défaut |
|---|---|
| Titre onglet | `Label Prestige - Site Officiel` |
| Logo texte | `LABEL PRESTIGE` |
| Sous-titre header | — |
| Favicon description | `Label Prestige` |

## 2. Navigation

| Champ | Valeur par défaut |
|---|---|
| Liens (6) | `Histoire`, `Activités`, `Documents`, `Concours`, `Serment Techno`, `Suggestions` |

## 3. Hero (accueil)

| Champ | Valeur par défaut |
|---|---|
| Titre principal | `SITE OFFICIEL DU LABEL PRESTIGE` |
| Sous-titre | `Association des Élèves Techno de l'INP-HB` |
| CTA | `Découvrir l'Association` |

## 4. Section Histoire

| Champ | Valeur par défaut |
|---|---|
| Titre section | `Notre Histoire` |
| Paragraphe 1 | *Le Label Prestige est une association d'étudiants en classes préparatoires techno de l'INP-HB fondée avec pour mission de rassembler, représenter et accompagner les étudiants technologiques dans leur parcours académique et professionnel.* |
| Paragraphe 2 | *Depuis sa création, l'association a su s'imposer comme un acteur majeur de la vie estudiantine à l'INP-HB, organisant des événements, des conférences et des activités qui renforcent la cohésion entre les étudiants et leur permettent de développer leurs compétences.* |
| Paragraphe 3 | *Notre vision est de créer une communauté solidaire où chaque étudiant techno peut s'épanouir, progresser et contribuer au rayonnement de notre école et de notre pays.* |

## 5. Section Activités (timeline)

| Champ | Valeur par défaut |
|---|---|
| Titre section | `Nos Activités` |

**8 activités, chacune avec :**
| Champ | Exemple |
|---|---|
| Date | `Septembre 2025` |
| Titre | `Rentrée Académique` |
| Description | `Favoriser la cohésion et l'intégration des nouveaux étudiants.` |

**6 activités futures (flou désactivé par date) — énigmes affichées si date non atteinte :**

| Activité | Date | Énigme (grec ancien) | Traduction |
|---|---|---|---|
| Otakunight | 29 Nov 2025 | `Η αλφαβήτα του μέλλοντος κρύβεται στο παρελθόν` | L'alphabet du futur se cache dans le passé |
| Soirée ciné gratuite | 13 Déc 2025 | `Ο χρόνος είναι το κλειδί για όλα τα μυστικά` | Le temps est la clé de tous les secrets |
| Collecte de fonds | 20 Déc 2025 | `Η σοφία έρχεται με την αλλαγή των εποχών` | La sagesse vient avec le changement des saisons |
| Projection CAN | 4 & 18 Jan 2026 | `Η δύναμη βρίσκεται στην ενότητα` | La force réside dans l'unité |
| AKWABA TECHNO | 9 Jan 2026 | `Η γνώση είναι η μεγαλύτερη δύναμη` | La connaissance est le plus grand pouvoir |
| Interclasses Techno | 10-17 Jan 2026 | `Η νίκη ανήκει στους επιμένοντες` | La victoire appartient à ceux qui persévèrent |

**Mécanisme attendu :** Si `Date.now() < date_activité` → carte floutée (blur 8px), survol = affichage de l'énigme. Si `Date.now() >= date_activité` → carte normale, contenu visible.

## 6. Section Concours

| Champ | Valeur par défaut |
|---|---|
| Titre section | `Concours` |

**8 concours, répartis en 2 catégories (INP-HB et Extérieur), chacun avec :**
| Champ | Exemple |
|---|---|
| École(s) | `ESCAE — INP-HB Yamoussoukro` |
| Frais | `12 000 FCFA` |
| Composition | `Écrit uniquement` |
| Matières | `Mathématiques 1, Culture générale, Anglais 1...` |
| Période | `Avril` |
| Résultats | `Mai` |

**Concours INP-HB (4) :**
- **CAE** — ESCAE, option CAE-MATHS, filières HEA-BF / ILT-SCM
- **GIN** — ESI, 3 options, filières STGI / STIC / ISEM
- **GCN** — INP-HB + USP, 3 options, filières GCTP / GCGT / TCCN / BTP
- **A2GP** — ESMG / ESA / ESPE, 2 options, filières TCCGP / TCMG

## 7. Section Serment Techno

| Champ | Valeur par défaut |
|---|---|
| Titre section | `Serment Techno` |
| Sous-titre | `HONORE TON ENGAGEMENT` |
| Accroche 1 | *Rejoins l'élite des Technos — En accomplissant ton Serment Techno...* |
| Accroche 2 | *Investis dans ton avenir — Chaque franc contribue directement...* |
| Accroche 3 | *Sois reconnu et respecté — Porte fièrement les couleurs...* |
| Accroche 4 | *Ne sois pas celui qui manque à l'appel — Tous tes camarades...* |
| Titre paiement | `Effectue ton Serment Techno par Wave, Orange Money ou MTN Mobile Money :` |
| Numéro 1 | `+225 0712344296` |
| Numéro 2 | `+225 0710019161` |
| Slogan | `"L'excellence n'est pas un acte, mais une habitude. Ton Serment Techno en est la première expression."` |
| Titre galerie | `Honore ton Serment et reçois ton pull exclusif` |
| Alt image pull | `Pull Label Prestige` |

## 8. Section Documents

| Champ | Valeur par défaut |
|---|---|
| Titre section | `Base de Documents` |
| Titre modale | `Bibliothèque Technique` |
| Label login | `Nom d'utilisateur` |
| Placeholder login | `Entrez votre nom d'utilisateur` |
| Label password | `Mot de passe` |
| Placeholder password | `Entrez votre mot de passe` |
| Texte bouton login | `Se connecter` |

**Catégories (arborescence) :**
- 1ère Année : Mathématiques, Physique, Chimie, Science Industrielle, Informatique
- 2ème Année : Mathématiques, Physique, Chimie, Science Industrielle
- Concours Spéciaux : CCINP, ISFA, X Polytechnique, École Centrale Casablanca, Gbinzin

## 9. Section Suggestions

| Champ | Valeur par défaut |
|---|---|
| Titre section | `Boîte à Suggestions` |
| Titre formulaire | `💡 Soumettre une Suggestion` |
| Titre aperçu | `👁️ Aperçu de votre Suggestion` |
| Placeholder aperçu | `Votre suggestion apparaîtra ici en temps réel` |
| Label catégorie | `Catégorie` |
| Label titre | `Titre de la suggestion` |
| Placeholder titre | `Titre concis de votre suggestion` |
| Label description | `Description détaillée` |
| Placeholder description | `Décrivez votre suggestion en détail...` |
| Texte bouton aperçu | `Aperçu` |
| Texte bouton soumettre | `Soumettre la Suggestion` |
| Titre dashboard | `📊 Tableau de Bord des Suggestions` |

**Catégories de suggestions :**
Événements & Activités, Pédagogie & Cours, Infrastructure & Équipements, Communication & Réseaux sociaux, Vie Associative, Autres

## 10. Messages utilisateur (JS)

| Contexte | Message |
|---|---|
| Login vide | `Veuillez remplir tous les champs.` |
| Login succès | `Connexion réussie ! Accès aux fonctionnalités administrateur activé.` |
| Login échec | `Identifiants incorrects. Accès réservé aux membres du bureau.` |
| Bienvenue | `Bienvenue {username} dans l'espace administrateur du Label Prestige!` |
| Upload vide | `Veuillez remplir tous les champs et sélectionner un fichier` |
| Upload en cours | `Téléversement en cours...` |
| Upload succès | `Document "{docName}" téléversé avec succès!` |
| Upload erreur | `Erreur lors du téléversement du document: {message}` |
| Delete confirmation | `Êtes-vous sûr de vouloir supprimer ce document ?` |
| Delete succès | `Document supprimé avec succès!` |
| Suggestion vide | `Veuillez remplir tous les champs du formulaire.` |
| Suggestion envoi | `Envoi en cours...` |
| Suggestion succès | `Votre suggestion a été soumise avec succès ! Merci pour votre contribution.` |
| États vides docs | `Aucun document disponible` + `Les membres du bureau n'ont pas encore téléversé de documents pour cette catégorie.` |
| États vides suggestions | `Aucune suggestion` + `Aucune suggestion ne correspond aux critères sélectionnés.` |
| Erreur chargement docs | `Erreur de chargement` + `Impossible de charger les documents. Vérifiez votre connexion internet.` |

---

**Total : ~80 champs de texte modifiables** (hors messages JS : ~25 supplémentaires).

Recommandation de format : un fichier `config/content.json` structuré par section, chargé au runtime ou injecté au build.
