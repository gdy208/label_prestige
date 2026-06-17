import { db } from '../firebase.js';
import { collection, addDoc, updateDoc, doc as fDoc } from 'firebase/firestore';

let overlay = null;
let editingId = null;
let onSubmit = null;

function createModal() {
  overlay = document.createElement('div');
  overlay.className = 'login-modal-overlay';
  overlay.innerHTML = `
    <div class="login-modal" style="background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(201,163,77,0.2);border-radius:16px;padding:40px;max-width:520px;width:90%;position:relative">
      <button class="login-modal-close" style="position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.5rem;cursor:pointer;padding:4px 8px;line-height:1">&times;</button>
      <h2 class="login-modal-title" id="activity-form-title" style="font-family:Playfair Display,serif;font-size:1.5rem;color:#C9A34D;margin-bottom:24px;text-align:center">Ajouter une activité</h2>
      <form id="activity-form">
        <div class="login-field" style="margin-bottom:16px">
          <label for="act-date" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Date</label>
          <input type="text" id="act-date" placeholder="ex: 15 Mars 2026" required style="width:100%;padding:12px 16px;font-size:0.95rem;color:#FFFAF0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;outline:none;transition:border-color 0.2s" />
        </div>
        <div class="login-field" style="margin-bottom:16px">
          <label for="act-title" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Titre</label>
          <input type="text" id="act-title" placeholder="Titre de l'activité" required style="width:100%;padding:12px 16px;font-size:0.95rem;color:#FFFAF0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;outline:none;transition:border-color 0.2s" />
        </div>
        <div class="login-field" style="margin-bottom:16px">
          <label for="act-description" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Description</label>
          <textarea id="act-description" rows="3" placeholder="Description de l'activité" required style="width:100%;padding:12px 16px;font-family:Inter,sans-serif;font-size:0.95rem;color:#FFFAF0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;outline:none;resize:vertical;transition:border-color 0.2s"></textarea>
        </div>
        <div class="login-field" style="margin-bottom:20px">
          <label for="act-order" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Ordre d'affichage</label>
          <input type="number" id="act-order" value="0" min="0" style="width:100%;padding:12px 16px;font-size:0.95rem;color:#FFFAF0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;outline:none;transition:border-color 0.2s" />
        </div>
        <p class="login-error" id="act-error" style="color:#ef4444;font-size:0.85rem;margin-bottom:12px;text-align:center"></p>
        <button type="submit" class="login-submit" style="width:100%;padding:12px 24px;font-size:0.95rem;font-weight:600;color:#000;background:linear-gradient(135deg,#C9A34D,#A8882D);border:none;border-radius:8px;cursor:pointer;transition:opacity 0.2s">Enregistrer</button>
      </form>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);

  overlay.querySelector('.login-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('activity-form').addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();

  const date = document.getElementById('act-date').value;
  const title = document.getElementById('act-title').value;
  const description = document.getElementById('act-description').value;
  const order = parseInt(document.getElementById('act-order').value) || 0;
  const errorEl = document.getElementById('act-error');
  const submitBtn = document.querySelector('#activity-form .login-submit');

  if (!date || !title || !description) {
    errorEl.textContent = 'Veuillez remplir tous les champs.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enregistrement en cours...';
  errorEl.textContent = '';

  try {
    if (editingId) {
      await updateDoc(fDoc(db, 'activites', editingId), { date, title, description, order });
    } else {
      await addDoc(collection(db, 'activites'), {
        date,
        title,
        description,
        order,
        createdAt: new Date(),
      });
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

function open(activity, cb) {
  editingId = activity?.id || null;
  onSubmit = cb || null;

  if (!overlay) createModal();

  const titleEl = document.getElementById('activity-form-title');
  const dateInput = document.getElementById('act-date');
  const titleInput = document.getElementById('act-title');
  const descInput = document.getElementById('act-description');
  const orderInput = document.getElementById('act-order');
  const errorEl = document.getElementById('act-error');
  const submitBtn = document.querySelector('#activity-form .login-submit');

  if (titleEl) titleEl.textContent = editingId ? 'Modifier l\'activité' : 'Ajouter une activité';
  if (dateInput) dateInput.value = activity?.date || '';
  if (titleInput) titleInput.value = activity?.title || '';
  if (descInput) descInput.value = activity?.description || '';
  if (orderInput) orderInput.value = activity?.order ?? 0;
  if (errorEl) errorEl.textContent = '';
  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Enregistrer'; }

  overlay.classList.add('active');
}

export function openActivityForm(activity, cb) { open(activity, cb); }
export function closeActivityForm() { close(); }
