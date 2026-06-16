import { db } from '../firebase.js';
import { collection, addDoc, updateDoc, doc as fDoc } from 'firebase/firestore';

let overlay = null;
let editingId = null;
let onSubmit = null;

function createModal() {
  overlay = document.createElement('div');
  overlay.className = 'login-modal-overlay';
  overlay.innerHTML = `
    <div class="login-modal" style="max-width:520px">
      <button class="login-modal-close" aria-label="Fermer">&times;</button>
      <h2 class="login-modal-title" id="activity-form-title">Ajouter une activité</h2>
      <form id="activity-form">
        <div class="login-field">
          <label for="act-date">Date</label>
          <input type="text" id="act-date" placeholder="ex: 15 Mars 2026" required />
        </div>
        <div class="login-field">
          <label for="act-title">Titre</label>
          <input type="text" id="act-title" placeholder="Titre de l'activité" required />
        </div>
        <div class="login-field">
          <label for="act-description">Description</label>
          <textarea id="act-description" rows="3" placeholder="Description de l'activité" required style="width:100%;padding:10px 14px;font-family:var(--font-body);font-size:0.95rem;color:var(--color-text-primary);background:rgba(255,255,255,0.05);border:1px solid var(--color-glass-border);border-radius:var(--radius-button);outline:none;resize:vertical"></textarea>
        </div>
        <div class="login-field">
          <label for="act-order">Ordre d'affichage</label>
          <input type="number" id="act-order" value="0" min="0" />
        </div>
        <p class="login-error" id="act-error"></p>
        <button type="submit" class="btn btn-gold login-submit">Enregistrer</button>
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
