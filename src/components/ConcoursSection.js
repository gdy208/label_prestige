import { db } from '../firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const fallbackConcours = [
  { category: 'INP-HB', name: 'Concours CAE', ecole: 'ESCAE (École Supérieure de Commerce et d\'Administration des Entreprises) — INP-HB Yamoussoukro', option: 'Mathématiques, Sciences de l\'Ingénieur et Physique (CAE-MATHS)', filieres: 'HEA-BF, ILT-SCM', frais: '20 000 FCFA (+ 3 000 FCFA frais dossier + 1 000 FCFA photo)', composition: 'Écrit', matieres: 'Mathématiques 1 (3h), Culture générale — français, philosophie (3h), Anglais 1 (3h)', periode: 'Avril', resultats: 'Mai', description: '', order: 0 },
  { category: 'INP-HB', name: 'Concours GIN', ecole: 'ESI (École Supérieure d\'Industrie) — INP-HB Yamoussoukro', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'STGI (→ EAI, MIP, PGE), STIC (→ EIT, INFO, TLR), ISEM', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 2 (5h), Informatique 1 (3h), Français 2 (3h), Anglais 2 (2h), Physique 1-2 (5h), Sciences Industrielles 1-2 (3h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 1 },
  { category: 'INP-HB', name: 'Concours GCN', ecole: 'INP-HB Yamoussoukro + Université de San-Pedro (USP)', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'GCTP (→ GCBU, GCHE, GCIT), GCGT, TCCN (USP), BTP (USP)', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 2 (5h), Informatique 1 (3h), Français 2 (3h), Anglais 2 (2h), Physique 1-2 (5h), Sciences Industrielles 1-2 (3h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 2 },
  { category: 'INP-HB', name: 'Concours A2GP', ecole: 'ESMG, ESA, ESPE (École Supérieure de Chimie, de Pétrole et d\'Énergie) — INP-HB Yamoussoukro', option: 'Mathématiques, Sciences de l\'Ingénieur et Physique | Chimie', filieres: 'TCCGP, TCMG (PE)', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 3 (4h), Informatique 1 (2h), Français 2 (3h), Anglais 2 (2h), Physique 3 (4h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 3 },
  { category: 'Extérieur', name: 'Concours ISE-ECO', ecole: '', option: '', filieres: '', frais: 'à remplir', composition: 'Écrit uniquement', matieres: 'Mathématiques et Français', periode: 'Début Avril', resultats: 'Fin Juin', description: 'L\'actuariat, l\'économie ou encore les statistiques. Si l\'un de ces domaines vous intéressent, le concours ISE-ECO (option Mathématiques) de l\'ENSEA est une belle opportunité qui s\'offre à vous. Toutefois, Il va falloir s\'y connaitre en séries de Fourier...', order: 4 },
  { category: 'Extérieur', name: 'Concours ECC', ecole: 'École Centrale Casablanca', option: '', filieres: '', frais: '12 000 FCFA', composition: 'Étude de dossiers, Écrit et Entretien de motivation', matieres: 'Mathématiques, Physiques et Anglais', periode: 'Mai', resultats: 'Juin', description: 'École Centrale Casablanca (ECC Casablanca), est une école d\'ingénieurs doté d\'une pédagogie innovante, de formations pluridisciplinaires et d\'une grande ouverture au monde. L\'École Centrale Casablanca est la première école d\'ingénieurs généraliste du Maroc.', order: 5 },
  { category: 'Extérieur', name: 'CCINP', ecole: 'Plus de trente écoles font partie du concours CCINP', option: '', filieres: '', frais: '220€', composition: 'Écrit et Oral', matieres: 'Toutes les matières au programme', periode: 'Mai', resultats: 'Juin', description: 'Le concours commun INP (CCINP) rassemble 32 écoles d\'ingénieurs spécialisées en aéronautique, chimie, en environnement, ou même en mécanique. Vous y trouverez votre compte...', order: 6 },
  { category: 'Extérieur', name: 'FUI-FF', ecole: 'X-Polytechnique de Paris', option: '', filieres: '', frais: 'Gratuit jusqu\'à nouvel ordre', composition: 'Écrit, Oral et Entretien de motivation', matieres: 'Mathématiques, Physiques, Anglais et Français', periode: 'Début Mars', resultats: 'Avril/Mai', description: 'Loic Koné, Christ Dakou, etc. Ces étudiants ont, pas plus tard que l\'année dernière eu la chance de franchir les portes de l\'école polytechnique. Vous avez toutes vos chances. Dès maintenant, mettez vous au travail, vous serez la fierté de votre famille, de l\'INP-HB et de toute la nation ivoirienne.', order: 7 },
];

let cachedConcours = [];

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

function renderCard(concours) {
  const card = document.createElement('article');
  card.className = 'glass rounded-3xl p-6';

  const badge = document.createElement('span');
  badge.className = 'inline-flex rounded-full border border-[#d8b56d]/30 bg-[#d8b56d]/10 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8b56d]';
  badge.textContent = concours.category === 'INP-HB' ? 'INP-HB' : 'Extérieur';
  card.appendChild(badge);

  const title = document.createElement('h3');
  title.className = 'mt-5 font-heading text-2xl font-bold text-[#f7f2e8]';
  title.textContent = concours.name;
  card.appendChild(title);

  if (concours.description) {
    const desc = document.createElement('p');
    desc.className = 'mt-4 font-sans text-sm leading-7 text-[#a9a9a9]';
    desc.textContent = concours.description;
    card.appendChild(desc);
  }

  const details = document.createElement('div');
  details.className = 'mt-4 space-y-1.5 text-xs text-[#a9a9a9] font-sans';
  if (concours.ecole) details.innerHTML += `<p><span class="text-[#d8b56d]/70">École :</span> ${esc(concours.ecole)}</p>`;
  if (concours.frais) details.innerHTML += `<p><span class="text-[#d8b56d]/70">Frais :</span> ${esc(concours.frais)}</p>`;
  if (concours.periode) details.innerHTML += `<p><span class="text-[#d8b56d]/70">Période :</span> ${esc(concours.periode)}</p>`;
  if (details.innerHTML) card.appendChild(details);

  return card;
}

function render() {
  const container = document.getElementById('concours-container');
  if (!container) return;

  const data = cachedConcours.length ? cachedConcours : fallbackConcours;
  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-4';

  sorted.forEach(c => {
    grid.appendChild(renderCard(c));
  });

  container.appendChild(grid);
}

async function loadFromFirestore() {
  try {
    const q = query(collection(db, 'concours'), orderBy('order'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      cachedConcours = snap.docs.map(d => ({ ...d.data() }));
    }
  } catch (e) {
    console.warn('Firestore indisponible pour Concours, utilisation du fallback :', e.message);
  }
  render();
}

export function setupConcoursSection() {
  render();
  loadFromFirestore();
}
