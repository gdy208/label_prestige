import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

let container = null;
let currentData = null;

export async function setupAdminSerment(target) {
  container = target;
  target.innerHTML = '<p class="admin-placeholder">Chargement...</p>';
  await loadData();
  render();
}

async function loadData() {
  try {
    const snap = await getDoc(doc(db, 'config', 'serment'));
    if (snap.exists()) {
      currentData = snap.data();
    } else {
      currentData = { phone1: '', phone2: '' };
    }
  } catch (err) {
    console.error('Erreur chargement config serment :', err);
    currentData = { phone1: '', phone2: '' };
  }
}

function render() {
  if (!container) return;

  container.innerHTML = `
    <div class="admin-serment-form">
      <div class="admin-serment-section">
        <h4 class="admin-serment-title">Numéros de téléphone</h4>
        <p class="admin-serment-desc">Modifier les numéros affichés dans la section Serment Techno.</p>
        <div class="login-field">
          <label for="serment-phone1-input">Numéro 1</label>
          <input type="text" id="serment-phone1-input" class="admin-serment-input" value="${esc(currentData.phone1 || '')}" placeholder="ex: +225 0712344296" />
        </div>
        <div class="login-field">
          <label for="serment-phone2-input">Numéro 2</label>
          <input type="text" id="serment-phone2-input" class="admin-serment-input" value="${esc(currentData.phone2 || '')}" placeholder="ex: +225 0710019161" />
        </div>
        <button id="serment-save-phones" style="font-size:0.85rem;padding:10px 24px;border:none;border-radius:8px;background:#C9A34D;color:#000;font-weight:700;cursor:pointer;transition:all 0.3s">Sauvegarder les numéros</button>
        <p class="login-error" id="serment-phones-error"></p>
      </div>
    </div>
  `;

  const saveBtn = document.getElementById('serment-save-phones');
  saveBtn?.addEventListener('click', savePhones);
  saveBtn?.addEventListener('mouseenter', () => { saveBtn.style.boxShadow = '0 0 15px rgba(201,163,77,0.3)'; });
  saveBtn?.addEventListener('mouseleave', () => { saveBtn.style.boxShadow = 'none'; });
}

async function savePhones() {
  const phone1 = document.getElementById('serment-phone1-input').value.trim();
  const phone2 = document.getElementById('serment-phone2-input').value.trim();
  const errorEl = document.getElementById('serment-phones-error');

  const saveBtn = document.getElementById('serment-save-phones');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Sauvegarde...';
  errorEl.textContent = '';

  try {
    const ref = doc(db, 'config', 'serment');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { phone1, phone2 });
    } else {
      await setDoc(ref, { phone1, phone2 });
    }
    currentData.phone1 = phone1;
    currentData.phone2 = phone2;
    showNotification('Numéros mis à jour avec succès !', 'success');
  } catch (err) {
    console.error('Erreur sauvegarde numéros :', err);
    errorEl.textContent = 'Erreur lors de la sauvegarde.';
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Sauvegarder les numéros';
}

function showNotification(message, type) {
  const el = document.createElement('div');
  el.className = `doc-notification doc-notification-${type}`;
  el.textContent = message;
  const panel = container;
  if (panel) {
    panel.appendChild(el);
    el.style.display = 'block';
    setTimeout(() => el.remove(), 4000);
  }
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
