import { db } from '../firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const fallbackConcours = [
  { category: 'INP-HB', name: 'Concours CAE', ecole: 'ESCAE (École Supérieure de Commerce et d\'Administration des Entreprises) — INP-HB Yamoussoukro', option: 'Mathématiques, Sciences de l\'Ingénieur et Physique (CAE-MATHS)', filieres: 'HEA-BF, ILT-SCM', frais: '20 000 FCFA (+ 3 000 FCFA frais dossier + 1 000 FCFA photo)', composition: 'Écrit', matieres: 'Mathématiques 1 (3h), Culture générale — français, philosophie (3h), Anglais 1 (3h)', periode: 'Avril', resultats: 'Mai', description: '', order: 0 },
  { category: 'INP-HB', name: 'Concours GIN', ecole: 'ESI (École Supérieure d\'Industrie) — INP-HB Yamoussoukro', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'STGI (→ EAI, MIP, PGE), STIC (→ EIT, INFO, TLR), ISEM', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 2 (5h), Informatique 1 (3h), Français 2 (3h), Anglais 2 (2h), Physique 1-2 (5h), Sciences Industrielles 1-2 (3h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 1 },
  { category: 'INP-HB', name: 'Concours GCN', ecole: 'INP-HB Yamoussoukro + Université de San-Pedro (USP)', option: 'Mathématiques | Physique et Chimie | Sciences de l\'Ingénieur', filieres: 'GCTP (→ GCBU, GCHE, GCIT), GCGT, TCCN (USP), BTP (USP)', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 2 (5h), Informatique 1 (3h), Français 2 (3h), Anglais 2 (2h), Physique 1-2 (5h), Sciences Industrielles 1-2 (3h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 2 },
  { category: 'INP-HB', name: 'Concours A2GP', ecole: 'ESMG, ESA, ESPE (École Supérieure de Chimie, de Pétrole et d\'Énergie) — INP-HB Yamoussoukro', option: 'Mathématiques, Sciences de l\'Ingénieur et Physique | Chimie', filieres: 'TCCGP, TCMG (PE)', frais: '20 000 FCFA', composition: 'Écrit', matieres: 'Mathématiques 3 (4h), Informatique 1 (2h), Français 2 (3h), Anglais 2 (2h), Physique 3 (4h), Chimie 1-2 (3h)', periode: 'Avril', resultats: '', description: '', order: 3 },
  { category: 'Extérieur', name: 'Concours ISE-ECO', ecole: '', option: '', filieres: '', frais: 'à remplir', composition: 'Écrit uniquement', matieres: 'Mathématiques et Français', periode: 'Début Avril', resultats: 'Fin Juin', description: 'L\'actuariat, l\'économie ou encore les statistiques. Si l\'un de ces domaines vous intéressent, le concours ISE-ECO (option Mathématiques) de l\'ENSEA est une belle opportunité qui s\'offre à vous. Toutefois, Il va falloir s\'y connaitre en séries de Fourier...', order: 4 },
  { category: 'Extérieur', name: 'Concours ECC', ecole: 'École Centrale Casablanca', option: '', filieres: '', frais: '12.000 XOF', composition: 'Étude de dossiers, Écrit et Entretien de motivation', matieres: 'Mathématiques, Physiques et Anglais', periode: 'Mai', resultats: 'Juin', description: 'École Centrale Casablanca (ECC Casablanca), est une école d\'ingénieurs doté d\'une pédagogie innovante, de formations pluridisciplinaires et d\'une grande ouverture au monde. L\'École Centrale Casablanca est la première école d\'ingénieurs généraliste du Maroc.', order: 5 },
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
  const card = document.createElement('div');
  card.className = 'concours-card';

  let html = `<h4 class="concours-name">${esc(concours.name)}</h4>`;

  if (concours.ecole) html += `<p class="concours-ecole"><strong>École :</strong> ${esc(concours.ecole)}</p>`;
  if (concours.option) html += `<p class="concours-filiere"><strong>Option :</strong> ${esc(concours.option)}</p>`;
  if (concours.filieres) html += `<p class="concours-filiere"><strong>Filières :</strong> ${esc(concours.filieres)}</p>`;
  if (concours.frais) html += `<p class="concours-frais"><strong>Frais :</strong> ${esc(concours.frais)}</p>`;
  if (concours.composition) html += `<p class="concours-composition"><strong>Composition :</strong> ${esc(concours.composition)}</p>`;
  if (concours.matieres) html += `<p class="concours-matieres"><strong>Matières :</strong> ${esc(concours.matieres)}</p>`;
  if (concours.periode) html += `<p class="concours-periode"><strong>Période :</strong> ${esc(concours.periode)}</p>`;
  if (concours.resultats) html += `<p class="concours-resultats"><strong>Résultats :</strong> ${esc(concours.resultats)}</p>`;
  if (concours.description) html += `<p class="concours-description">${esc(concours.description)}</p>`;

  card.innerHTML = html;
  return card;
}

function render() {
  const container = document.getElementById('concours-container');
  if (!container) return;

  const data = cachedConcours.length ? cachedConcours : fallbackConcours;
  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const categories = {};
  sorted.forEach(c => {
    if (!categories[c.category]) categories[c.category] = [];
    categories[c.category].push(c);
  });

  container.innerHTML = '';

  Object.entries(categories).forEach(([catName, concoursList]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'concours-category';

    const title = document.createElement('h3');
    title.className = 'concours-category-title';
    title.textContent = catName === 'INP-HB' ? 'Concours INP-HB' : 'Concours Extérieur';
    wrapper.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'concours-grid';

    concoursList.forEach(c => {
      grid.appendChild(renderCard(c));
    });

    wrapper.appendChild(grid);
    container.appendChild(wrapper);
  });
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
