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
  const baseStyle = 'width:100%;padding:12px 16px;font-family:Inter,sans-serif;font-size:0.95rem;color:#FFFAF0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;outline:none;transition:border-color 0.2s';
  if (f.type === 'textarea') {
    return `<textarea id="cf-${f.key}" rows="3" style="${baseStyle};resize:vertical">${val}</textarea>`;
  }
  if (f.type === 'select') {
    const opts = (f.options || []).map(o =>
      `<option value="${esc(o)}"${o === value ? ' selected' : ''}>${esc(o)}</option>`
    ).join('');
    return `<select id="cf-${f.key}" style="${baseStyle}">${opts}</select>`;
  }
  return `<input type="text" id="cf-${f.key}" value="${val}" style="${baseStyle}" />`;
}

function createModal(concours, isNew) {
  overlay = document.createElement('div');
  overlay.className = 'login-modal-overlay';
  overlay.innerHTML = `
    <div class="login-modal" style="background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(201,163,77,0.2);border-radius:16px;padding:40px;max-width:600px;max-height:85vh;overflow-y:auto;width:90%;position:relative">
      <button class="login-modal-close" style="position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.5rem;cursor:pointer;padding:4px 8px;line-height:1">&times;</button>
      <h2 class="login-modal-title" style="font-family:Playfair Display,serif;font-size:1.5rem;color:#C9A34D;margin-bottom:24px;text-align:center">${isNew ? 'Ajouter un concours' : 'Modifier : ' + esc(concours.name)}</h2>
      <form id="concours-form">
        ${infoFields.map(f => `
          <div class="login-field" style="margin-bottom:16px">
            <label for="cf-${f.key}" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">${f.label}</label>
            ${fieldHTML(f, isNew ? '' : concours[f.key])}
          </div>
        `).join('')}
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0" />
        ${dataFields.map(f => `
          <div class="login-field" style="margin-bottom:16px">
            <label for="cf-${f.key}" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">${f.label}</label>
            ${fieldHTML(f, isNew ? '' : concours[f.key])}
          </div>
        `).join('')}
        <p class="login-error" id="cf-error" style="color:#ef4444;font-size:0.85rem;margin-bottom:12px;text-align:center"></p>
        <button type="submit" class="login-submit" style="width:100%;padding:12px 24px;font-size:0.95rem;font-weight:600;color:#000;background:linear-gradient(135deg,#C9A34D,#A8882D);border:none;border-radius:8px;cursor:pointer;transition:opacity 0.2s">Enregistrer</button>
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
  if (overlay) {
    overlay.remove();
    overlay = null;
    editingId = null;
    editingData = null;
    onSubmit = null;
  }
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
