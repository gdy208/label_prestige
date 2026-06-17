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
    <div class="flex justify-between items-center mb-6">
      <span class="text-base text-[#9CA3AF]">${activities.length} activité(s)</span>
      <button class="px-5 py-2.5 rounded-lg bg-[#C9A34D] text-black text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(201,163,77,0.3)] transition-all cursor-pointer border-none" id="add-activity-btn">+ Ajouter</button>
    </div>
    ${activities.length === 0 ? '<p class="text-center italic text-[#9CA3AF] py-16">Aucune activité pour le moment.</p>' : `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Ordre</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Date</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Titre</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Description</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${activities.map(a => `
            <tr class="hover:bg-[#C9A34D]/5 transition-colors">
              <td class="px-4 py-3 text-white border-b border-white/5">${a.order}</td>
              <td class="px-4 py-3 text-white border-b border-white/5">${esc(a.date)}</td>
              <td class="px-4 py-3 text-white border-b border-white/5">${esc(a.title)}</td>
              <td class="px-4 py-3 text-[#9CA3AF] border-b border-white/5 max-w-[300px] truncate">${esc(a.description)}</td>
              <td class="px-4 py-3 border-b border-white/5">
                <button class="px-4 py-2 rounded text-[0.75rem] font-semibold bg-[#C9A34D]/20 text-[#C9A34D] hover:bg-[#C9A34D]/30 border-none cursor-pointer transition-all mr-2 edit-act" data-id="${a.id}">Modifier</button>
                <button class="px-4 py-2 rounded text-[0.75rem] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 border-none cursor-pointer transition-all delete-act" data-id="${a.id}">Supprimer</button>
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
