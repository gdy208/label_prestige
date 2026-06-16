import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { supabase } from '../supabase.js';
import { getState } from '../auth.js';

const PULL_SLOTS = [
  { id: 'face', label: 'Vue face' },
  { id: 'dos', label: 'Vue dos' },
  { id: 'detail', label: 'Vue détail' },
  { id: 'porte', label: 'Vue porté' },
];

let container = null;
let currentData = null;
let uploadStates = {};

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
      currentData = {
        phone1: '',
        phone2: '',
        pulls: PULL_SLOTS.map(s => ({ id: s.id, label: s.label, url: '' })),
      };
    }
  } catch (err) {
    console.error('Erreur chargement config serment :', err);
    currentData = { phone1: '', phone2: '', pulls: [] };
  }
}

function render() {
  if (!container) return;

  const state = getState();
  const canUpload = posteMatches(state.poste, 'developpeur') || posteMatches(state.poste, 'président');
  const pulls = currentData.pulls?.length ? currentData.pulls : PULL_SLOTS;

  container.innerHTML = `
    <div class="admin-serment-form">
      <!-- Phone numbers -->
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
        <button class="btn btn-gold" id="serment-save-phones" style="font-size:0.8rem;padding:8px 20px">Sauvegarder les numéros</button>
        <p class="login-error" id="serment-phones-error"></p>
      </div>

      <!-- Pull photos -->
      <div class="admin-serment-section">
        <h4 class="admin-serment-title">Photos du pull</h4>
        <p class="admin-serment-desc">${canUpload ? 'Téléverser les photos du pull exclusif.' : 'Seuls les président·es et le développeur peuvent modifier les photos.'}</p>
        <div class="admin-serment-pulls">
          ${pulls.map((p, i) => `
            <div class="admin-serment-pull-slot" data-slot="${p.id}">
              <span class="admin-serment-pull-label">${esc(p.label)}</span>
              <div class="admin-serment-pull-preview" id="serment-pull-prev-${p.id}">
                ${p.url ? `<img src="${esc(p.url)}" alt="${esc(p.label)}" />` : '<span class="admin-serment-pull-empty">Aucune image</span>'}
              </div>
              ${canUpload ? `
                <input type="file" id="serment-pull-file-${p.id}" class="admin-serment-file-input" accept="image/png,image/jpeg,image/webp" ${uploadStates[p.id]?.uploading ? 'disabled' : ''} />
                <div class="admin-serment-pull-actions">
                  <button class="btn btn-outline-gold serment-upload-btn" data-slot="${p.id}" style="font-size:0.7rem;padding:4px 12px;flex:1" ${uploadStates[p.id]?.uploading ? 'disabled' : ''}>
                    ${uploadStates[p.id]?.uploading ? 'Téléversement...' : p.url ? 'Remplacer' : 'Téléverser'}
                  </button>
                  ${p.url ? `<button class="btn btn-outline serment-remove-btn" data-slot="${p.id}" style="font-size:0.7rem;padding:4px 12px">Supprimer</button>` : ''}
                </div>
                ${uploadStates[p.id]?.progress !== undefined ? `<div class="admin-serment-progress"><div class="admin-serment-progress-bar" style="width:${uploadStates[p.id].progress}%"></div></div>` : ''}
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('serment-save-phones')?.addEventListener('click', savePhones);

  if (canUpload) {
    container.querySelectorAll('.serment-upload-btn').forEach(btn => {
      btn.addEventListener('click', () => handleUpload(btn.dataset.slot));
    });
    container.querySelectorAll('.serment-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => handleRemove(btn.dataset.slot));
    });
  }
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
      await setDoc(ref, {
        phone1,
        phone2,
        pulls: PULL_SLOTS.map(s => ({ id: s.id, label: s.label, url: '' })),
      });
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

async function handleUpload(slotId) {
  const fileInput = document.getElementById(`serment-pull-file-${slotId}`);
  const file = fileInput?.files?.[0];
  if (!file) return;

  const ext = file.name.split('.').pop();
  const fileName = `serment-pulls/${slotId}_${Date.now()}.${ext}`;

  uploadStates[slotId] = { uploading: true, progress: 0 };
  render();

  try {
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const ref = doc(db, 'config', 'serment');
    const snap = await getDoc(ref);
    const pulls = snap.exists()
      ? (snap.data().pulls || [])
      : PULL_SLOTS.map(s => ({ id: s.id, label: s.label, url: '' }));

    const updatedPulls = pulls.map(p => p.id === slotId ? { ...p, url: publicUrl } : p);

    if (snap.exists()) {
      await updateDoc(ref, { pulls: updatedPulls });
    } else {
      await setDoc(ref, {
        phone1: '',
        phone2: '',
        pulls: updatedPulls,
      });
    }

    currentData.pulls = updatedPulls;
    delete uploadStates[slotId];
    showNotification(`Image "${slotId}" téléversée avec succès !`, 'success');
    render();
  } catch (err) {
    console.error('Erreur upload pull :', err);
    uploadStates[slotId] = { uploading: false };
    showNotification('Erreur lors du téléversement.', 'error');
    render();
  }
}

async function handleRemove(slotId) {
  if (!confirm(`Supprimer l'image "${slotId}" ?`)) return;

  try {
    const ref = doc(db, 'config', 'serment');
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const pulls = snap.data().pulls || [];
    const updatedPulls = pulls.map(p => p.id === slotId ? { ...p, url: '' } : p);
    await updateDoc(ref, { pulls: updatedPulls });

    currentData.pulls = updatedPulls;
    showNotification('Image supprimée.', 'success');
    render();
  } catch (err) {
    console.error('Erreur suppression image :', err);
    showNotification('Erreur lors de la suppression.', 'error');
  }
}

function showNotification(message, type) {
  const el = document.createElement('div');
  el.className = `doc-notification doc-notification-${type}`;
  el.textContent = message;
  const panel = document.getElementById('admin-serment');
  if (panel) {
    panel.appendChild(el);
    el.style.display = 'block';
    setTimeout(() => el.remove(), 4000);
  }
}

function posteMatches(poste, required) {
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const a = norm(poste || '');
  const b = norm(required || '');
  return a === b || a.startsWith(b);
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
