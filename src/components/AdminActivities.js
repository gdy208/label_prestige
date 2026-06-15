import { db } from '../firebase.js';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { openActivityForm } from './ActivityForm.js';

let container = null;
let activities = [];

export async function setupAdminActivities(target) {
  container = target;
  target.innerHTML = '<p class="admin-placeholder">Chargement des activités...</p>';
  await loadActivities();
  render();
}

function render() {
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="color:var(--color-text-secondary);font-size:0.85rem">${activities.length} activité(s)</span>
      <button class="btn btn-gold" id="add-activity-btn" style="font-size:0.75rem;padding:8px 16px">+ Ajouter</button>
    </div>
    ${activities.length === 0 ? '<p class="admin-placeholder">Aucune activité pour le moment.</p>' : `
    <div style="overflow-x:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Ordre</th>
            <th>Date</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${activities.map(a => `
            <tr>
              <td>${a.order}</td>
              <td>${esc(a.date)}</td>
              <td>${esc(a.title)}</td>
              <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.description)}</td>
              <td>
                <button class="btn btn-outline-gold edit-act" data-id="${a.id}" style="font-size:0.7rem;padding:4px 10px;margin-right:4px">Modifier</button>
                <button class="btn btn-outline delete-act" data-id="${a.id}" style="font-size:0.7rem;padding:4px 10px">Supprimer</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`}
  `;

  document.getElementById('add-activity-btn')?.addEventListener('click', () => {
    openActivityForm(null, () => { loadActivities().then(render); });
  });

  container.querySelectorAll('.edit-act').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = activities.find(x => x.id === btn.dataset.id);
      if (a) openActivityForm(a, () => { loadActivities().then(render); });
    });
  });

  container.querySelectorAll('.delete-act').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return;
      try {
        await deleteDoc(doc(db, 'activites', btn.dataset.id));
        await loadActivities();
        render();
      } catch (err) {
        console.error('Erreur suppression :', err);
      }
    });
  });
}

async function loadActivities() {
  try {
    const q = query(collection(db, 'activites'), orderBy('order'));
    const snap = await getDocs(q);
    activities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Erreur chargement activités :', err);
    activities = [];
  }
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
