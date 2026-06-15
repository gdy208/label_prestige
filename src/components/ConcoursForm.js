import { db } from '../firebase.js';
import { collection, addDoc, updateDoc, doc as fDoc } from 'firebase/firestore';

let overlay = null;
let editingId = null;
let editingData = null;
let onSubmit = null;

const infoFields = [
  { key: 'name', label: 'Nom du concours', type: 'text' },
  { key: 'category', label: 'Catégorie', type: 'select', options: ['INP-HB', 'Extérieur'] },
];

const dataFields = [
  { key: 'ecole', label: 'École', type: 'text' },
  { key: 'option', label: 'Option', type: 'text' },
  { key: 'filieres', label: 'Filières', type: 'text' },
  { key: 'frais', label: 'Frais', type: 'text' },
  { key: 'composition', label: 'Composition', type: 'text' },
  { key: 'matieres', label: 'Matières', type: 'text' },
  { key: 'periode', label: 'Période', type: 'text' },
  { key: 'resultats', label: 'Résultats', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
];

function fieldHTML(f, value) {
  const val = esc(value || '');
  if (f.type === 'textarea') {
    return `<textarea id="cf-${f.key}" rows="3" style="width:100%;padding:10px 14px;font-family:var(--font-body);font-size:0.95rem;color:var(--color-text-primary);background:rgba(255,255,255,0.05);border:1px solid var(--color-glass-border);border-radius:var(--radius-button);outline:none;resize:vertical">${val}</textarea>`;
  }
  if (f.type === 'select') {
    const opts = (f.options || []).map(o =>
      `<option value="${esc(o)}"${o === value ? ' selected' : ''}>${esc(o)}</option>`
    ).join('');
    return `<select id="cf-${f.key}" style="width:100%;padding:10px 14px;font-family:var(--font-body);font-size:0.95rem;color:var(--color-text-primary);background:rgba(255,255,255,0.05);border:1px solid var(--color-glass-border);border-radius:var(--radius-button);outline:none">${opts}</select>`;
  }
  return `<input type="text" id="cf-${f.key}" value="${val}" style="width:100%;padding:10px 14px;font-family:var(--font-body);font-size:0.95rem;color:var(--color-text-primary);background:rgba(255,255,255,0.05);border:1px solid var(--color-glass-border);border-radius:var(--radius-button);outline:none" />`;
}

function createModal(concours, isNew) {
  overlay = document.createElement('div');
  overlay.className = 'login-modal-overlay';
  overlay.innerHTML = `
    <div class="login-modal" style="max-width:600px;max-height:85vh;overflow-y:auto">
      <button class="login-modal-close" aria-label="Fermer">&times;</button>
      <h2 class="login-modal-title">${isNew ? 'Ajouter un concours' : 'Modifier : ' + esc(concours.name)}</h2>
      <form id="concours-form">
        ${infoFields.map(f => `
          <div class="login-field">
            <label for="cf-${f.key}">${f.label}</label>
            ${fieldHTML(f, isNew ? '' : concours[f.key])}
          </div>
        `).join('')}
        <hr style="border:none;border-top:1px solid var(--color-glass-border);margin:16px 0" />
        ${dataFields.map(f => `
          <div class="login-field">
            <label for="cf-${f.key}">${f.label}</label>
            ${fieldHTML(f, isNew ? '' : concours[f.key])}
          </div>
        `).join('')}
        <p class="login-error" id="cf-error"></p>
        <button type="submit" class="btn btn-gold login-submit">Enregistrer</button>
      </form>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);

  overlay.querySelector('.login-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('concours-form').addEventListener('submit', handleSubmit);
}

function getFormData() {
  const data = {};
  [...infoFields, ...dataFields].forEach(f => {
    const el = document.getElementById(`cf-${f.key}`);
    if (el) data[f.key] = el.value;
  });
  return data;
}

async function handleSubmit(e) {
  e.preventDefault();

  const data = getFormData();
  const errorEl = document.getElementById('cf-error');
  const submitBtn = document.querySelector('#concours-form .login-submit');

  if (!data.name || !data.category) {
    errorEl.textContent = 'Veuillez remplir le nom et la catégorie.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enregistrement en cours...';
  errorEl.textContent = '';

  try {
    if (editingId) {
      await updateDoc(fDoc(db, 'concours', editingId), data);
    } else {
      const maxOrder = editingData?.order ?? 0;
      await addDoc(collection(db, 'concours'), { ...data, order: maxOrder + 1, createdAt: new Date() });
    }
    close();
    if (onSubmit) onSubmit();
  } catch (err) {
    errorEl.textContent = 'Erreur lors de l\'enregistrement.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enregistrer';
  }
}

function close() {
  if (overlay) overlay.classList.remove('active');
}

function open(concours, cb) {
  editingId = concours?.id || null;
  editingData = concours || null;
  onSubmit = cb || null;
  if (!overlay) createModal(concours, !editingId);
  overlay.classList.add('active');
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

export function openConcoursForm(concours, cb) { open(concours, cb); }
export function closeConcoursForm() { close(); }
