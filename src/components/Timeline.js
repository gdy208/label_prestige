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

function getMonth(dateStr) {
  const months = {
    'Janvier': 'Janv.', 'Février': 'Févr.', 'Mars': 'Mars', 'Avril': 'Avr.', 'Mai': 'Mai', 'Juin': 'Juin',
    'Juillet': 'Juil.', 'Août': 'Août', 'Septembre': 'Sept.', 'Octobre': 'Oct.', 'Novembre': 'Nov.', 'Décembre': 'Déc.'
  };
  for (const [full, short] of Object.entries(months)) {
    if ((dateStr || '').includes(full)) return short;
  }
  return dateStr || '';
}

function renderTimeline(isAdmin) {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const data = cachedActivities.length ? cachedActivities : fallbackActivities;
  const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  container.innerHTML = '';

  sorted.forEach((activity) => {
    const isFuture = isFutureActivity(activity.date);
    const futureClass = isFuture && !isAdmin ? ' opacity-60 blur-sm hover:opacity-100 hover:blur-none' : '';
    const month = getMonth(activity.date);
    const isMulti = (activity.date || '').includes('&');

    const card = document.createElement('article');
    card.className = `glass grid gap-4 rounded-3xl p-6${futureClass}`;
    card.style.gridTemplateColumns = isMulti ? '140px 1fr' : '90px 1fr';

    const monthEl = document.createElement('p');
    monthEl.className = 'font-display text-xl font-bold text-[#d8b56d]';
    monthEl.textContent = month;
    card.appendChild(monthEl);

    const div = document.createElement('div');

    if (isFuture) {
      const badge = document.createElement('span');
      badge.className = 'inline-block text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-1 rounded mb-2 bg-[#d8b56d]/20 text-[#d8b56d]';
      badge.textContent = 'À Venir';
      div.appendChild(badge);
    }

    const titleEl = document.createElement('h3');
    titleEl.className = 'font-heading text-xl font-bold text-[#f7f2e8]';
    titleEl.textContent = activity.title || '';
    div.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'mt-2 font-sans text-sm leading-7 text-[#a9a9a9]';
    descEl.textContent = activity.description || '';
    div.appendChild(descEl);

    card.appendChild(div);
    container.appendChild(card);
  });
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
