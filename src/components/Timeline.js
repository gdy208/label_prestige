import { db } from '../firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getState, subscribe } from '../auth.js';

const fallbackActivities = [
  { date: 'Septembre 2025', title: 'Rentrée Académique', description: "Favoriser la cohésion et l'intégration des nouveaux étudiants.", order: 0 },
  { date: '8 Novembre 2025', title: 'Réunion avec les P2', description: 'Échanges et coordination avec les étudiants de deuxième année.', order: 1 },
  { date: '29 Novembre 2025', title: 'Otakunight', description: 'Soirée mangas, animés, J-pop. Valoriser la culture japonaise et geek, moment de détente.', order: 2 },
  { date: '13 Décembre 2025', title: 'Soirée ciné gratuite', description: 'Détente collective. Projecteur, film, chaises, collation payante.', order: 3 },
  { date: '20 Décembre 2025', title: 'Collecte de fonds', description: 'Action caritative pour des bénéficiaires choisis.', order: 4 },
  { date: '4 & 18 Janvier 2026', title: 'Projection CAN', description: "Créer une ambiance conviviale autour du sport.", order: 5 },
  { date: '9 Janvier 2026', title: 'AKWABA TECHNO (Bal de promo)', description: 'Accueillir la nouvelle promo et célébrer les réussites.', order: 6 },
  { date: '10 - 17 Janvier 2026', title: 'Interclasses Techno', description: "Renforcer l'esprit d'équipe et la compétition saine.", order: 7 },
];

let cachedActivities = [];

function parseActivityDate(dateStr) {
  const months = {
    'Janvier': 0, 'Février': 1, 'Mars': 2, 'Avril': 3, 'Mai': 4, 'Juin': 5,
    'Juillet': 6, 'Août': 7, 'Septembre': 8, 'Octobre': 9, 'Novembre': 10, 'Décembre': 11
  };
  const cleaned = (dateStr || '').replace(/&/g, '').trim();
  for (const [month, idx] of Object.entries(months)) {
    if (cleaned.includes(month)) {
      const dayMatch = cleaned.match(/(\d+)/);
      const day = dayMatch ? parseInt(dayMatch[1]) : 1;
      const yearMatch = cleaned.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      return new Date(year, idx, day);
    }
  }
  return new Date();
}

function isFutureActivity(dateStr) {
  return parseActivityDate(dateStr) > new Date();
}

function renderTimeline(isAdmin) {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const data = cachedActivities.length ? cachedActivities : fallbackActivities;
  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'timeline-wrapper';

  const line = document.createElement('div');
  line.className = 'timeline-line';
  wrapper.appendChild(line);

  sorted.forEach((activity, index) => {
    const isFuture = isFutureActivity(activity.date);
    const card = document.createElement('div');
    card.className = `timeline-card${isFuture && !isAdmin ? ' future-activity' : ''}`;
    card.dataset.index = index;

    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    card.appendChild(dot);

    const content = document.createElement('div');
    content.className = 'timeline-content';

    const dateEl = document.createElement('span');
    dateEl.className = 'activity-date';
    dateEl.textContent = activity.date || '';
    content.appendChild(dateEl);

    const titleEl = document.createElement('h3');
    titleEl.className = 'activity-title';
    titleEl.textContent = activity.title || '';
    content.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'activity-description';
    descEl.textContent = activity.description || '';
    content.appendChild(descEl);

    card.appendChild(content);

    card.classList.add(index % 2 === 0 ? 'timeline-left' : 'timeline-right');
    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
}

async function loadFromFirestore() {
  try {
    const q = query(collection(db, 'activites'), orderBy('order'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      cachedActivities = snap.docs.map(d => ({ ...d.data() }));
    }
  } catch (e) {
    console.warn('Firestore indisponible pour Timeline, utilisation du fallback :', e.message);
  }
  renderTimeline(getState().isAdmin);
}

export function setupTimeline(isAdmin) {
  renderTimeline(isAdmin);
  loadFromFirestore();
}

subscribe(authState => {
  renderTimeline(authState.isAdmin);
});
