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
    <p style="color:var(--color-text-secondary);font-size:0.85rem;margin-bottom:16px">${members.length} membre(s)</p>
    ${members.length === 0 ? '<p class="admin-placeholder">Aucun membre trouvé.</p>' : `
    <div style="overflow-x:auto">
      <table class="admin-table" id="members-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Poste</th>
            <th>Promotion</th>
            <th>Actif</th>
            ${canEdit() ? '<th>Actions</th>' : ''}
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

  const fieldStyle = 'padding:4px 6px;font-size:0.8rem;width:100%;min-width:120px;background:var(--color-navy);color:var(--color-text-primary);border:1px solid var(--color-glass-border);border-radius:var(--radius-button)';

  const actions = isDev
    ? `<td><button class="btn btn-gold save-member" data-id="${m.id}" disabled style="font-size:0.7rem;padding:4px 10px">Sauvegarder</button></td>`
    : '';

  return `
    <tr>
      <td>${esc(m.name || '—')}</td>
      <td>${esc(m.email || '—')}</td>
      <td>${isDev
        ? `<select class="member-role" style="${fieldStyle}">${roleOpts}</select>`
        : `<span style="color:var(--color-text-secondary)">${esc(m.role || '—')}</span>`
      }</td>
      <td>${isDev
        ? `<input type="text" class="member-field member-poste" value="${esc(m.poste || '')}" style="${fieldStyle}" placeholder="poste" />`
        : `<span style="color:var(--color-text-secondary)">${esc(m.poste || '—')}</span>`
      }</td>
      <td>${isDev
        ? `<input type="text" class="member-field member-promotion" value="${esc(m.promotion || '')}" style="${fieldStyle}" placeholder="promotion" />`
        : `<span style="color:var(--color-text-secondary)">${esc(m.promotion || '—')}</span>`
      }</td>
      <td style="text-align:center">
        <input type="checkbox" class="toggle-active" data-id="${m.id}" ${active ? 'checked' : ''} ${!canToggle() ? 'disabled' : ''} style="width:18px;height:18px;cursor:${canToggle() ? 'pointer' : 'default'};accent-color:var(--color-gold)" />
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
