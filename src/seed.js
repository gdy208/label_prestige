import { db } from './firebase.js';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const activities = [
  {
    date: 'Septembre 2025',
    title: 'Rentrée Académique',
    description: "Favoriser la cohésion et l'intégration des nouveaux étudiants.",
    order: 0,
  },
  {
    date: '8 Novembre 2025',
    title: 'Réunion avec les P2',
    description: 'Échanges et coordination avec les étudiants de deuxième année.',
    order: 1,
  },
  {
    date: '29 Novembre 2025',
    title: 'Otakunight',
    description: 'Soirée mangas, animés, J-pop. Valoriser la culture japonaise et geek, moment de détente.',
    order: 2,
  },
  {
    date: '13 Décembre 2025',
    title: 'Soirée ciné gratuite',
    description: 'Détente collective. Projecteur, film, chaises, collation payante.',
    order: 3,
  },
  {
    date: '20 Décembre 2025',
    title: 'Collecte de fonds',
    description: 'Action caritative pour des bénéficiaires choisis.',
    order: 4,
  },
  {
    date: '4 & 18 Janvier 2026',
    title: 'Projection CAN',
    description: "Créer une ambiance conviviale autour du sport.",
    order: 5,
  },
  {
    date: '9 Janvier 2026',
    title: 'AKWABA TECHNO (Bal de promo)',
    description: 'Accueillir la nouvelle promo et célébrer les réussites.',
    order: 6,
  },
  {
    date: '10 - 17 Janvier 2026',
    title: 'Interclasses Techno',
    description: "Renforcer l'esprit d'équipe et la compétition saine.",
    order: 7,
  },
];

const concours = [
  { category: 'INP-HB', name: 'Concours CAE', ecole: 'ESCAE (École Supérieure de Commerce et d\'Administration des Entreprises) — INP-HB Yamoussoukro', option: 'Mathématiques, Sciences de l\'Ingénieur et Physique (CAE-MATHS)', filieres: 'HEA-BF, ILT-SCM', frais: '20 000 FCFA (+ 3 000 FCFA frais dossier + 1 000 FCFA photo)', composition: 'Écrit', matieres: 'Mathématiques 1 (3h), Culture générale — français, philosophie (3h), Anglais 1 (3h)', periode: 'Avril', resultats: 'Mai', description: '', order: 0 },
  { category: 'INP-HB', name: 'Concours GIN', ecole: 'ESI (École Supérieure d\'Industrie) — INP-HB Yamoussoukro', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'STGI (→ EAI, MIP, PGE), STIC (→ EIT, INFO, TLR), ISEM', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 2 (5h), Informatique 1 (3h), Français 2 (3h), Anglais 2 (2h), Physique 1-2 (5h), Sciences Industrielles 1-2 (3h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 1 },
  { category: 'INP-HB', name: 'Concours GCN', ecole: 'INP-HB Yamoussoukro + Université de San-Pedro (USP)', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'GCTP (→ GCBU, GCHE, GCIT), GCGT, TCCN (USP), BTP (USP)', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 2 (5h), Informatique 1 (3h), Français 2 (3h), Anglais 2 (2h), Physique 1-2 (5h), Sciences Industrielles 1-2 (3h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 2 },
  { category: 'INP-HB', name: 'Concours A2GP', ecole: 'ESMG, ESA, ESPE (École Supérieure de Chimie, de Pétrole et d\'Énergie) — INP-HB Yamoussoukro', option: 'Mathématiques, Sciences de l\'Ingénieur et Physique | Chimie', filieres: 'TCCGP, TCMG (PE)', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 3 (4h), Informatique 1 (2h), Français 2 (3h), Anglais 2 (2h), Physique 3 (4h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 3 },
  { category: 'Extérieur', name: 'Concours ISE-ECO', ecole: '', option: '', filieres: '', frais: 'à remplir', composition: 'Écrit uniquement', matieres: 'Mathématiques et Français', periode: 'Début Avril', resultats: 'Fin Juin', description: 'L\'actuariat, l\'économie ou encore les statistiques. Si l\'un de ces domaines vous intéressent, le concours ISE-ECO (option Mathématiques) de l\'ENSEA est une belle opportunité qui s\'offre à vous. Toutefois, Il va falloir s\'y connaitre en séries de Fourier...', order: 4 },
  { category: 'Extérieur', name: 'Concours ECC', ecole: 'École Centrale Casablanca', option: '', filieres: '', frais: '12 000 FCFA', composition: 'Étude de dossiers, Écrit et Entretien de motivation', matieres: 'Mathématiques, Physiques et Anglais', periode: 'Mai', resultats: 'Juin', description: 'École Centrale Casablanca (ECC Casablanca), est une école d\'ingénieurs doté d\'une pédagogie innovante, de formations pluridisciplinaires et d\'une grande ouverture au monde. L\'École Centrale Casablanca est la première école d\'ingénieurs généraliste du Maroc.', order: 5 },
  { category: 'Extérieur', name: 'CCINP', ecole: 'Plus de trente écoles font partie du concours CCINP', option: '', filieres: '', frais: '220€', composition: 'Écrit et Oral', matieres: 'Toutes les matières au programme', periode: 'Mai', resultats: 'Juin', description: 'Le concours commun INP (CCINP) rassemble 32 écoles d\'ingénieurs spécialisées en aéronautique, chimie, en environnement, ou même en mécanique. Vous y trouverez votre compte...', order: 6 },
  { category: 'Extérieur', name: 'FUI-FF', ecole: 'X-Polytechnique de Paris', option: '', filieres: '', frais: 'Gratuit jusqu\'à nouvel ordre', composition: 'Écrit, Oral et Entretien de motivation', matieres: 'Mathématiques, Physiques, Anglais et Français', periode: 'Début Mars', resultats: 'Avril/Mai', description: 'Loic Koné, Christ Dakou, etc. Ces étudiants ont, pas plus tard que l\'année dernière eu la chance de franchir les portes de l\'école polytechnique. Vous avez toutes vos chances. Dès maintenant, mettez vous au travail, vous serez la fierté de votre famille, de l\'INP-HB et de toute la nation ivoirienne.', order: 7 },
];

export async function seedIfNeeded() {
  const activitiesSnap = await getDocs(collection(db, 'activites'));
  if (activitiesSnap.empty) {
    for (const a of activities) {
      await addDoc(collection(db, 'activites'), { ...a, createdAt: new Date() });
    }
    console.log('Activités seedées :', activities.length);
  }

  const concoursSnap = await getDocs(collection(db, 'concours'));
  if (concoursSnap.empty) {
    for (const c of concours) {
      await addDoc(collection(db, 'concours'), { ...c, createdAt: new Date() });
    }
    console.log('Concours seedés :', concours.length);
  }
}

export { activities as seedActivities, concours as seedConcours };
