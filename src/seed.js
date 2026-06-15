import { db } from './firebase.js';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const activities = [
  {
    date: 'Septembre 2025',
    title: 'Rentrée Académique',
    description: "Favoriser la cohésion et l'intégration des nouveaux étudiants.",
    enigme: '',
    enigmeHint: '',
    order: 0,
  },
  {
    date: '8 Novembre 2025',
    title: 'Réunion avec les P2',
    description: 'Échanges et coordination avec les étudiants de deuxième année.',
    enigme: '',
    enigmeHint: '',
    order: 1,
  },
  {
    date: '29 Novembre 2025',
    title: 'Otakunight',
    description: 'Soirée mangas, animés, J-pop. Valoriser la culture japonaise et geek, moment de détente.',
    enigme: 'Η αλφαβήτα του μέλλοντος κρύβεται στο παρελθόν',
    enigmeHint: "L'alphabet du futur se cache dans le passé",
    order: 2,
  },
  {
    date: '13 Décembre 2025',
    title: 'Soirée ciné gratuite',
    description: 'Détente collective. Projecteur, film, chaises, collation payante.',
    enigme: 'Ο χρόνος είναι το κλειδί για όλα τα μυστικά',
    enigmeHint: 'Le temps est la clé de tous les secrets',
    order: 3,
  },
  {
    date: '20 Décembre 2025',
    title: 'Collecte de fonds',
    description: 'Action caritative pour des bénéficiaires choisis.',
    enigme: 'Η σοφία έρχεται με την αλλαγή των εποχών',
    enigmeHint: 'La sagesse vient avec le changement des saisons',
    order: 4,
  },
  {
    date: '4 & 18 Janvier 2026',
    title: 'Projection CAN',
    description: "Créer une ambiance conviviale autour du sport.",
    enigme: 'Η δύναμη βρίσκεται στην ενότητα',
    enigmeHint: "La force réside dans l'unité",
    order: 5,
  },
  {
    date: '9 Janvier 2026',
    title: 'AKWABA TECHNO (Bal de promo)',
    description: 'Accueillir la nouvelle promo et célébrer les réussites.',
    enigme: 'Η γνώση είναι η μεγαλύτερη δύναμη',
    enigmeHint: 'La connaissance est le plus grand pouvoir',
    order: 6,
  },
  {
    date: '10 - 17 Janvier 2026',
    title: 'Interclasses Techno',
    description: "Renforcer l'esprit d'équipe et la compétition saine.",
    enigme: 'Η νίκη ανήκει στους επιμένοντες',
    enigmeHint: 'La victoire appartient à ceux qui persévèrent',
    order: 7,
  },
];

const enigmes = [
  { enigme: 'Γνώθι σαυτόν', enigmeHint: 'Connais-toi toi-même' },
  { enigme: 'Μηδέν άγαν', enigmeHint: 'Rien de trop' },
  { enigme: 'Ουδέν μονιμότερον του προσωρινού', enigmeHint: 'Rien n\'est plus permanent que le temporaire' },
  { enigme: 'Πάντα ῥεῖ', enigmeHint: 'Tout coule, tout change' },
  { enigme: 'Τὰ ἐναντία ἀλλήλοις συμφέρεσθαι', enigmeHint: 'Les contraires s\'attirent' },
  { enigme: 'Σπεῦδε βραδέως', enigmeHint: 'Hâte-toi lentement' },
  { enigme: 'Ἀνερρίφθω κύβος', enigmeHint: 'Le sort en est jeté' },
  { enigme: 'Ἓν οἶδα ὅτι οὐδὲν οἶδα', enigmeHint: 'Je sais que je ne sais rien' },
  { enigme: 'Τέλος καλόν, πᾶν καλόν', enigmeHint: 'Toute est bien qui finit bien' },
  { enigme: 'Λαβύρινθος λόγων', enigmeHint: 'Un labyrinthe de mots' },
  { enigme: 'Ἡ ἀρχή ἥμισυ τοῦ παντός', enigmeHint: 'Le commencement est la moitié du tout' },
  { enigme: 'Φιλοτιμία ψυχῆς καινόν', enigmeHint: 'L\'ambition renouvelle l\'âme' },
  { enigme: 'Σοφία ἀληθής πράσσειν', enigmeHint: 'La vraie sagesse est dans l\'action' },
  { enigme: 'Χρόνος ἐστὶ κίνησις ἀίδιος', enigmeHint: 'Le temps est un mouvement éternel' },
  { enigme: 'Ἡ γνῶσις δύναμίς ἐστι', enigmeHint: 'La connaissance est le pouvoir' },
];

const concours = [
  { category: 'INP-HB', name: 'Concours CAE', ecole: 'ESCAE — INP-HB Yamoussoukro', option: 'Mathématiques, Sciences de l\'Ingénieur et Physique (CAE-MATHS)', filieres: 'HEA-BF (Banque Finance et Assurance), ILT-SCM (Supply Chain Management)', frais: '20.000 XOF', composition: 'Écrit uniquement', matieres: 'Mathématiques 1, Culture générale (français, philosophie), Anglais 1', periode: 'Avril', resultats: 'Mai', description: '', order: 0 },
  { category: 'INP-HB', name: 'Concours GIN', ecole: 'ESI (École Supérieure d\'Industrie) — INP-HB Yamoussoukro', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'STGI (→ EAI, MIP, PGE), STIC (→ EIT, INFO, TLR), ISEM', frais: '20.000 XOF', composition: 'Écrit uniquement', matieres: 'Mathématiques 2, Informatique 1, Français 2, Anglais 2, Physique 1/2, Sciences Industrielles 1/2, Chimie 1/2', periode: 'Avril', resultats: '', description: '', order: 1 },
  { category: 'INP-HB', name: 'Concours GCN', ecole: 'INP-HB Yamoussoukro + Université de San-Pedro (USP)', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'GCTP (→ GCBU, GCHE, GCIT), GCGT, TCCN (USP), BTP (USP)', frais: '20.000 XOF', composition: 'Écrit uniquement', matieres: 'Mathématiques 2, Informatique 1, Français 2, Anglais 2, Physique 1/2, Sciences Industrielles 1/2, Chimie 1/2', periode: 'Avril', resultats: '', description: '', order: 2 },
  { category: 'INP-HB', name: 'Concours A2GP', ecole: 'ESMG, ESA, ESPE — INP-HB Yamoussoukro', option: 'Maths, Sciences de l\'Ingénieur et Physique | Chimie', filieres: 'TCCGP (→ GPI, FPF, GBP), TCMG (→ ETDE, MICA, PE)', frais: '20.000 XOF', composition: 'Écrit uniquement', matieres: 'Mathématiques 3, Informatique 1, Français 2, Anglais 2, Physique 3, Chimie 1/2', periode: 'Avril', resultats: '', description: '', order: 3 },
  { category: 'Extérieur', name: 'Concours ISE-ECO', ecole: '', option: '', filieres: '', frais: 'à remplir', composition: 'Écrit uniquement', matieres: 'Mathématiques et Français', periode: 'Début Avril', resultats: 'Fin Juin', description: 'L\'actuariat, l\'économie ou encore les statistiques. Si l\'un de ces domaines vous intéressent, le concours ISE-ECO (option Mathématiques) de l\'ENSEA est une belle opportunité qui s\'offre à vous. Toutefois, Il va falloir s\'y connaitre en séries de Fourier...', order: 4 },
  { category: 'Extérieur', name: 'Concours ECC', ecole: 'École Centrale Casablanca', option: '', filieres: '', frais: '12.000 XOF', composition: 'Étude de dossiers, Écrit et Entretien de motivation', matieres: 'Mathématiques, Physiques et Anglais', periode: 'Mai', resultats: 'Juin', description: 'École Centrale Casablanca (ECC Casablanca), est une école d\'ingénieurs doté d\'une pédagogie innovante, de formations pluridisciplinaires et d\'une grande ouverture au monde. L\'École Centrale Casablanca est la première école d\'ingénieurs généraliste du Maroc.', order: 5 },
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

  const enigmesSnap = await getDocs(collection(db, 'enigmes'));
  if (enigmesSnap.empty) {
    for (const e of enigmes) {
      await addDoc(collection(db, 'enigmes'), { ...e, used: false });
    }
    console.log('Énigmes seedées :', enigmes.length);
  }

  const concoursSnap = await getDocs(collection(db, 'concours'));
  if (concoursSnap.empty) {
    for (const c of concours) {
      await addDoc(collection(db, 'concours'), { ...c, createdAt: new Date() });
    }
    console.log('Concours seedés :', concours.length);
  }
}

export { activities as seedActivities, enigmes as seedEnigmes, concours as seedConcours };
