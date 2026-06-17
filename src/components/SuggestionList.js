import { db } from '../firebase.js';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

let container = null;
let suggestions = [];
let filterCategory = '';
let filterStatus = '';

const CATEGORIES = [
  'Événements & Activités',
  'Pédagogie & Cours',
  'Infrastructure & Équipements',
  'Communication & Réseaux sociaux',
  'Vie Associative',
  'Autres',
];

export async function setupSuggestionList(target) {
  container = target;
  target.innerHTML = '<p class="admin-placeholder">Chargement des suggestions...</p>';
  await loadSuggestions();
  render();
}

function render() {
  if (!container) return;

  const total = suggestions.length;
  const unread = suggestions.filter(s => s.status === 'unread').length;
  const lastWeek = suggestions.filter(s => {
    const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const filtered = suggestions.filter(s => {
    if (filterStatus === 'unread' && s.status !== 'unread') return false;
    if (filterCategory && s.category !== filterCategory) return false;
    return true;
  });

  const filterButtons = [
    { id: '', label: 'Toutes' },
    { id: 'unread', label: 'Non lues' },
    ...CATEGORIES.map(c => ({ id: c, label: c })),
  ];

  container.innerHTML = `
    <div class="suggestion-stats">
      <div class="suggestion-stat-card">
        <span class="suggestion-stat-number">${total}</span>
        <span class="suggestion-stat-label">Total</span>
      </div>
      <div class="suggestion-stat-card">
        <span class="suggestion-stat-number">${unread}</span>
        <span class="suggestion-stat-label">Non lues</span>
      </div>
      <div class="suggestion-stat-card">
        <span class="suggestion-stat-number">${lastWeek}</span>
        <span class="suggestion-stat-label">7 derniers jours</span>
      </div>
    </div>

    <div class="suggestion-filters">
      ${filterButtons.map(b => `
        <button class="suggestion-filter-btn${b.id === filterStatus || b.id === filterCategory ? ' active' : ''}"
                data-filter="${b.id}">${esc(b.label)}</button>
      `).join('')}
    </div>

    ${filtered.length === 0
      ? `<p class="admin-placeholder">${suggestions.length === 0 ? 'Aucune suggestion' : 'Aucune suggestion ne correspond aux critères sélectionnés.'}</p>`
      : `<div class="suggestion-list">
          ${filtered.map(s => `
            <div class="suggestion-item${s.status === 'unread' ? ' suggestion-unread' : ''}" data-id="${s.id}">
              <div class="suggestion-item-header">
                <span class="suggestion-item-badge">${esc(s.category)}</span>
                <span class="suggestion-item-status">${s.status === 'unread' ? 'Non lue' : 'Lue'}</span>
                <span class="suggestion-item-date">${formatDate(s.createdAt)}</span>
              </div>
              <h4 class="suggestion-item-title">${esc(s.title)}</h4>
              <p class="suggestion-item-desc">${esc(s.description)}</p>
              <div class="suggestion-item-actions">
                ${s.status === 'unread' ? `<button class="btn btn-outline-gold mark-read-btn" style="font-size:0.75rem;padding:6px 14px">Marquer comme lu</button>` : ''}
                <button class="btn btn-outline delete-sug-btn" style="font-size:0.75rem;padding:6px 14px">Supprimer</button>
              </div>
            </div>
          `).join('')}
        </div>`
    }
  `;

  container.querySelectorAll('.suggestion-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.filter;
      if (CATEGORIES.includes(val)) {
        filterCategory = filterCategory === val ? '' : val;
        filterStatus = '';
      } else {
        filterStatus = filterStatus === val ? '' : val;
        filterCategory = '';
      }
      render();
    });
  });

  container.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = btn.closest('.suggestion-item');
      const id = item.dataset.id;
      try {
        await updateDoc(doc(db, 'suggestions', id), { status: 'read' });
        await loadSuggestions();
        render();
      } catch (err) {
        console.error('Erreur marquage lu :', err);
      }
    });
  });

  container.querySelectorAll('.delete-sug-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette suggestion ?')) return;
      const item = btn.closest('.suggestion-item');
      const id = item.dataset.id;
      try {
        await deleteDoc(doc(db, 'suggestions', id));
        await loadSuggestions();
        render();
      } catch (err) {
        console.error('Erreur suppression :', err);
      }
    });
  });
}

async function loadSuggestions() {
  try {
    const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    suggestions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Erreur chargement suggestions :', err);
    suggestions = [];
    if (container) {
      container.innerHTML = '<p class="admin-placeholder">Impossible de charger les suggestions. Vérifiez votre connexion internet.</p>';
    }
  }
}

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
