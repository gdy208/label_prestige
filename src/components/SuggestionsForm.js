import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORIES = [
  'Événements & Activités',
  'Pédagogie & Cours',
  'Infrastructure & Équipements',
  'Communication & Réseaux sociaux',
  'Vie Associative',
  'Autres',
];

export function setupSuggestionsForm() {
  const container = document.getElementById('suggestions-container');
  if (!container) return;

  container.innerHTML = `
    <div class="suggestions-layout">
      <div class="suggestion-form-card">
        <h3 class="suggestion-form-title">💡 Soumettre une Suggestion</h3>
        <form id="suggestion-form">
          <div class="login-field">
            <label for="sug-category">Catégorie</label>
            <select id="sug-category" class="suggestion-select" required>
              <option value="">Choisir une catégorie</option>
              ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="login-field">
            <label for="sug-title">Titre de la suggestion</label>
            <input type="text" id="sug-title" placeholder="Titre concis de votre suggestion" required />
          </div>
          <div class="login-field">
            <label for="sug-desc">Description détaillée</label>
            <textarea id="sug-desc" class="suggestion-textarea" rows="4" placeholder="Décrivez votre suggestion en détail..." required></textarea>
          </div>
          <p class="login-error" id="sug-error"></p>
          <div class="suggestion-form-actions">
            <button type="button" class="btn btn-outline-gold" id="sug-preview-btn">Aperçu</button>
            <button type="submit" class="btn btn-gold login-submit">Soumettre la Suggestion</button>
          </div>
        </form>
      </div>

      <div class="suggestion-preview-card">
        <h3 class="suggestion-form-title">👁️ Aperçu de votre Suggestion</h3>
        <div id="sug-preview" class="suggestion-preview-content">
          <p class="suggestion-preview-empty">Votre suggestion apparaîtra ici en temps réel</p>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('suggestion-form');
  const categoryEl = document.getElementById('sug-category');
  const titleEl = document.getElementById('sug-title');
  const descEl = document.getElementById('sug-desc');
  const previewEl = document.getElementById('sug-preview');
  const errorEl = document.getElementById('sug-error');

  function updatePreview() {
    const cat = categoryEl.value;
    const title = titleEl.value.trim();
    const desc = descEl.value.trim();

    if (!cat && !title && !desc) {
      previewEl.innerHTML = '<p class="suggestion-preview-empty">Votre suggestion apparaîtra ici en temps réel</p>';
      return;
    }

    previewEl.innerHTML = `
      ${cat ? `<span class="suggestion-preview-badge">${esc(cat)}</span>` : ''}
      ${title ? `<h4 class="suggestion-preview-title">${esc(title)}</h4>` : ''}
      ${desc ? `<p class="suggestion-preview-desc">${esc(desc)}</p>` : ''}
    `;
  }

  [categoryEl, titleEl, descEl].forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  document.getElementById('sug-preview-btn').addEventListener('click', updatePreview);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cat = categoryEl.value;
    const title = titleEl.value.trim();
    const desc = descEl.value.trim();

    if (!cat || !title || !desc) {
      errorEl.textContent = 'Veuillez remplir tous les champs du formulaire.';
      return;
    }

    const submitBtn = form.querySelector('.login-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    errorEl.textContent = '';

    try {
      await addDoc(collection(db, 'suggestions'), {
        category: cat,
        title,
        description: desc,
        status: 'unread',
        createdAt: new Date(),
      });

      form.reset();
      updatePreview();

      showNotification('Votre suggestion a été soumise avec succès ! Merci pour votre contribution.', 'success');
    } catch (err) {
      console.error('Erreur soumission suggestion :', err);
      errorEl.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer.';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Soumettre la Suggestion';
  });
}

function showNotification(message, type) {
  const existing = document.querySelector('.suggestion-notification');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `suggestion-notification suggestion-notification-${type}`;
  el.textContent = message;
  document.getElementById('suggestions-container').appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
