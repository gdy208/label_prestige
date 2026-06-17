import { db } from '../firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getState } from '../auth.js';

let container = null;
let members = [];
let currentUserPoste = null;

export async function setupAdminMembers(target) {
  container = target;
  currentUserPoste = getState().poste;
  target.innerHTML = '<p class="admin-placeholder">Chargement des membres...</p>';
  await loadMembers();
  render();
}

async function loadMembers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    members = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Erreur chargement membres :', err);
    members = [];
  }
}

function isPresident(poste) {
  if (!poste) return false;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return norm(poste).startsWith('president');
}

function canEdit() {
  return currentUserPoste === 'developpeur';
}

function canToggle() {
  return canEdit() || isPresident(currentUserPoste);
}

function render() {
  if (!container) return;

  container.innerHTML = `
    <p class="text-base text-[#9CA3AF] mb-6">${members.length} membre(s)</p>
    ${members.length === 0 ? '<p class="text-center italic text-[#9CA3AF] py-16">Aucun membre trouvé.</p>' : `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm" id="members-table">
        <thead>
          <tr>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Nom</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Email</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Rôle</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Poste</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Promotion</th>
            <th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Actif</th>
            ${canEdit() ? '<th class="text-left px-4 py-3 font-semibold uppercase tracking-wider text-[0.75rem] text-[#C9A34D] border-b border-[#C9A34D]/10">Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${members.map(m => renderRow(m)).join('')}
        </tbody>
      </table>
    </div>`}
  `;

  if (canEdit()) {
    container.querySelectorAll('.save-member').forEach(btn => {
      btn.addEventListener('click', () => saveMember(btn.dataset.id));
    });
    container.querySelectorAll('.member-role').forEach(sel => {
      sel.addEventListener('change', () => {
        const row = sel.closest('tr');
        row.querySelector('.save-member').disabled = false;
      });
    });
    container.querySelectorAll('.member-field').forEach(inp => {
      inp.addEventListener('input', () => {
        const row = inp.closest('tr');
        row.querySelector('.save-member').disabled = false;
      });
    });
  }

  if (canToggle()) {
    container.querySelectorAll('.toggle-active').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.dataset.id;
        const checked = chk.checked;
        if (canEdit()) {
          const row = chk.closest('tr');
          row.querySelector('.save-member').disabled = false;
        } else {
          toggleActive(id, checked);
        }
      });
    });
  }
}

function renderRow(m) {
  const isDev = canEdit();
  const isPres = isPresident(currentUserPoste) && !isDev;
  const active = m.active !== false;

  const roleOpts = `
    <option value="bureau" ${m.role === 'bureau' ? 'selected' : ''}>bureau</option>
    <option value="super_admin" ${m.role === 'super_admin' ? 'selected' : ''}>super_admin</option>
  `;

  const inputStyle = 'padding:6px 8px;font-size:0.85rem;width:100%;min-width:130px;background:#000;color:#FFFAF0;border:1px solid rgba(201,163,77,0.25);border-radius:6px';

  const actions = isDev
    ? `<td class="px-4 py-3 border-b border-white/5"><button class="px-4 py-2 rounded text-[0.75rem] font-semibold bg-[#C9A34D]/20 text-[#C9A34D] hover:bg-[#C9A34D]/30 border-none cursor-pointer transition-all save-member" data-id="${m.id}" disabled>Sauvegarder</button></td>`
    : '';

  return `
    <tr class="hover:bg-[#C9A34D]/5 transition-colors">
      <td class="px-4 py-3 text-white border-b border-white/5">${esc(m.name || '—')}</td>
      <td class="px-4 py-3 text-white border-b border-white/5">${esc(m.email || '—')}</td>
      <td class="px-4 py-3 border-b border-white/5">${isDev
        ? `<select class="member-role" style="${inputStyle}">${roleOpts}</select>`
        : `<span class="text-[#9CA3AF]">${esc(m.role || '—')}</span>`
      }</td>
      <td class="px-4 py-3 border-b border-white/5">${isDev
        ? `<input type="text" class="member-field member-poste" value="${esc(m.poste || '')}" style="${inputStyle}" placeholder="poste" />`
        : `<span class="text-[#9CA3AF]">${esc(m.poste || '—')}</span>`
      }</td>
      <td class="px-4 py-3 border-b border-white/5">${isDev
        ? `<input type="text" class="member-field member-promotion" value="${esc(m.promotion || '')}" style="${inputStyle}" placeholder="promotion" />`
        : `<span class="text-[#9CA3AF]">${esc(m.promotion || '—')}</span>`
      }</td>
      <td class="px-4 py-3 border-b border-white/5 text-center">
        <input type="checkbox" class="toggle-active" data-id="${m.id}" ${active ? 'checked' : ''} ${!canToggle() ? 'disabled' : ''} style="width:18px;height:18px;cursor:${canToggle() ? 'pointer' : 'default'};accent-color:#C9A34D" />
      </td>
      ${actions}
    </tr>
  `;
}

async function saveMember(id) {
  const row = document.querySelector(`.save-member[data-id="${id}"]`)?.closest('tr');
  if (!row) return;

  const role = row.querySelector('.member-role')?.value;
  const poste = row.querySelector('.member-poste')?.value;
  const promotion = row.querySelector('.member-promotion')?.value;
  const active = row.querySelector('.toggle-active')?.checked;

  try {
    await updateDoc(doc(db, 'users', id), { role, poste, promotion, active });
    row.querySelector('.save-member').disabled = true;
  } catch (err) {
    console.error('Erreur mise à jour membre :', err);
  }
}

async function toggleActive(id, active) {
  try {
    await updateDoc(doc(db, 'users', id), { active });
  } catch (err) {
    console.error('Erreur mise à jour statut :', err);
  }
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
