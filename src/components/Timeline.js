const activities = [
  {
    date: 'Septembre 2025',
    title: 'Rentrée Académique',
    description: "Favoriser la cohésion et l'intégration des nouveaux étudiants."
  },
  {
    date: '8 Novembre 2025',
    title: 'Réunion avec les P2',
    description: 'Échanges et coordination avec les étudiants de deuxième année.'
  },
  {
    date: '29 Novembre 2025',
    title: 'Otakunight',
    description: 'Soirée mangas, animés, J-pop. Valoriser la culture japonaise et geek, moment de détente.',
    future: true,
    enigme: 'Η αλφαβήτα του μέλλοντος κρύβεται στο παρελθόν',
    enigmeHint: "L'alphabet du futur se cache dans le passé"
  },
  {
    date: '13 Décembre 2025',
    title: 'Soirée ciné gratuite',
    description: 'Détente collective. Projecteur, film, chaises, collation payante.',
    future: true,
    enigme: 'Ο χρόνος είναι το κλειδί για όλα τα μυστικά',
    enigmeHint: 'Le temps est la clé de tous les secrets'
  },
  {
    date: '20 Décembre 2025',
    title: 'Collecte de fonds',
    description: 'Action caritative pour des bénéficiaires choisis.',
    future: true,
    enigme: 'Η σοφία έρχεται με την αλλαγή των εποχών',
    enigmeHint: 'La sagesse vient avec le changement des saisons'
  },
  {
    date: '4 & 18 Janvier 2026',
    title: 'Projection CAN',
    description: "Créer une ambiance conviviale autour du sport.",
    future: true,
    enigme: 'Η δύναμη βρίσκεται στην ενότητα',
    enigmeHint: "La force réside dans l'unité"
  },
  {
    date: '9 Janvier 2026',
    title: 'AKWABA TECHNO (Bal de promo)',
    description: 'Accueillir la nouvelle promo et célébrer les réussites.',
    future: true,
    enigme: 'Η γνώση είναι η μεγαλύτερη δύναμη',
    enigmeHint: 'La connaissance est le plus grand pouvoir'
  },
  {
    date: '10 - 17 Janvier 2026',
    title: 'Interclasses Techno',
    description: "Renforcer l'esprit d'équipe et la compétition saine.",
    future: true,
    enigme: 'Η νίκη ανήκει στους επιμένοντες',
    enigmeHint: 'La victoire appartient à ceux qui persévèrent'
  }
];

function parseActivityDate(dateStr) {
  const months = {
    'Janvier': 0, 'Février': 1, 'Mars': 2, 'Avril': 3, 'Mai': 4, 'Juin': 5,
    'Juillet': 6, 'Août': 7, 'Septembre': 8, 'Octobre': 9, 'Novembre': 10, 'Décembre': 11
  };

  const cleaned = dateStr.replace(/&/g, '').trim();

  for (const [month, idx] of Object.entries(months)) {
    if (cleaned.includes(month)) {
      const dayMatch = cleaned.match(/(\d+)/);
      const day = dayMatch ? parseInt(dayMatch[1]) : 1;
      const yearMatch = cleaned.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : 2025;
      return new Date(year, idx, day);
    }
  }

  if (cleaned.includes('Septembre')) return new Date(2025, 8, 1);
  return new Date(2025, 11, 31);
}

function isFutureActivity(dateStr) {
  const date = parseActivityDate(dateStr);
  return date > new Date();
}

function getRiddleHTML(activity) {
  if (!activity.future) return '';
  return `
    <div class="activity-riddle">
      <p class="riddle-text">${activity.enigme}</p>
      <p class="riddle-hint">${activity.enigmeHint}</p>
    </div>
  `;
}

export function setupTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = '';

  const timelineWrapper = document.createElement('div');
  timelineWrapper.className = 'timeline-wrapper';

  const timelineLine = document.createElement('div');
  timelineLine.className = 'timeline-line';
  timelineWrapper.appendChild(timelineLine);

  activities.forEach((activity, index) => {
    const isFuture = isFutureActivity(activity.date);
    const card = document.createElement('div');
    card.className = `timeline-card${isFuture ? ' future-activity' : ''}`;
    card.dataset.index = index;

    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    card.appendChild(dot);

    const content = document.createElement('div');
    content.className = 'timeline-content';

    const dateEl = document.createElement('span');
    dateEl.className = 'activity-date';
    dateEl.textContent = activity.date;
    content.appendChild(dateEl);

    const titleEl = document.createElement('h3');
    titleEl.className = 'activity-title';
    titleEl.textContent = activity.title;
    content.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'activity-description';
    descEl.textContent = activity.description;
    content.appendChild(descEl);

    if (isFuture && activity.future) {
      const riddleEl = document.createElement('div');
      riddleEl.className = 'activity-riddle';
      const riddleText = document.createElement('p');
      riddleText.className = 'riddle-text';
      riddleText.textContent = activity.enigme;
      const riddleHint = document.createElement('p');
      riddleHint.className = 'riddle-hint';
      riddleHint.textContent = activity.enigmeHint;
      riddleEl.appendChild(riddleText);
      riddleEl.appendChild(riddleHint);
      content.appendChild(riddleEl);
    }

    card.appendChild(content);

    if (index % 2 === 0) {
      card.classList.add('timeline-left');
    } else {
      card.classList.add('timeline-right');
    }

    timelineWrapper.appendChild(card);
  });

  container.appendChild(timelineWrapper);
}
