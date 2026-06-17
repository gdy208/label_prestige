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
    <div class="flex justify-between items-center mb-6">
      <span class="text-base text-[#9CA3AF]">${concoursList.length} concours</span>
      <button class="px-5 py-2.5 rounded-lg bg-[#C9A34D] text-black text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(201,163,77,0.3)] transition-all cursor-pointer border-none" id="add-concours-btn">+ Ajouter</button>
    </div>
    ${concoursList.length === 0 ? '<p class="text-center italic text-[#9CA3AF] py-16">Aucun concours.</p>' : `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Ordre</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Catégorie</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Nom</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${concoursList.map(c => `
            <tr class="hover:bg-[#C9A34D]/5 transition-colors">
              <td class="px-4 py-3 text-white border-b border-white/5">${c.order}</td>
              <td class="px-4 py-3 text-white border-b border-white/5">${esc(c.category)}</td>
              <td class="px-4 py-3 text-white border-b border-white/5">${esc(c.name)}</td>
              <td class="px-4 py-3 border-b border-white/5">
                <button class="px-4 py-2 rounded text-[0.75rem] font-semibold bg-[#C9A34D]/20 text-[#C9A34D] hover:bg-[#C9A34D]/30 border-none cursor-pointer transition-all edit-concours" data-id="${c.id}">Modifier</button>
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
