import { db } from '../firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { openConcoursForm } from './ConcoursForm.js';

let container = null;
let concoursList = [];

const fields = [
  { key: 'ecole', label: 'École' },
  { key: 'option', label: 'Option' },
  { key: 'filieres', label: 'Filières' },
  { key: 'frais', label: 'Frais' },
  { key: 'composition', label: 'Composition' },
  { key: 'matieres', label: 'Matières' },
  { key: 'periode', label: 'Période' },
  { key: 'resultats', label: 'Résultats' },
  { key: 'description', label: 'Description' },
];

export async function setupAdminConcours(target) {
  container = target;
  target.innerHTML = '<p class="admin-placeholder">Chargement des concours...</p>';
  await loadConcours();
  render();
}

function render() {
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="color:var(--color-text-secondary);font-size:0.85rem">${concoursList.length} concours</span>
      <button class="btn btn-gold" id="add-concours-btn" style="font-size:0.75rem;padding:8px 16px">+ Ajouter</button>
    </div>
    ${concoursList.length === 0 ? '<p class="admin-placeholder">Aucun concours.</p>' : `
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Catégorie</th>
            <th>Nom</th>
            <th>Modifier</th>
          </tr>
        </thead>
        <tbody>
          ${concoursList.map(c => `
            <tr>
              <td>${c.order}</td>
              <td>${esc(c.category)}</td>
              <td>${esc(c.name)}</td>
              <td>
                <button class="btn btn-outline-gold edit-concours" data-id="${c.id}" style="font-size:0.7rem;padding:4px 10px">Modifier</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`}
  `;

  document.getElementById('add-concours-btn')?.addEventListener('click', () => {
    openConcoursForm(null, () => { loadConcours().then(render); });
  });

  container.querySelectorAll('.edit-concours').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = concoursList.find(x => x.id === btn.dataset.id);
      if (c) openConcoursForm(c, () => { loadConcours().then(render); });
    });
  });
}

async function loadConcours() {
  try {
    const q = query(collection(db, 'concours'), orderBy('order'));
    const snap = await getDocs(q);
    concoursList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Erreur chargement concours :', err);
    concoursList = [];
  }
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
