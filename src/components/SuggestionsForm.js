import { db } from '../firebase.js';
import { collection, addDoc } from 'firebase/firestore';

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
    <div class="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <form id="suggestion-form" class="glass rounded-[1.75rem] p-6 md:p-7">
        <label class="block">
          <span class="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Nom</span>
          <input id="sug-name" class="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-white/[0.07] px-4 font-sans text-sm text-[#f7f2e8] outline-none transition placeholder:text-[#a9a9a9]/70 focus:border-[#d8b56d]/50" placeholder="Votre nom" />
        </label>
        <label class="mt-5 block">
          <span class="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Catégorie</span>
          <select id="sug-category" class="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-[#111] px-4 font-sans text-sm text-[#f7f2e8] outline-none transition focus:border-[#d8b56d]/50">
            <option value="" style="background:#111;color:#f7f2e8">Choisir une catégorie</option>
            ${CATEGORIES.map(c => `<option value="${c}" style="background:#111;color:#f7f2e8">${c}</option>`).join('')}
          </select>
        </label>
        <label class="mt-5 block">
          <span class="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Titre</span>
          <input id="sug-title" class="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-white/[0.07] px-4 font-sans text-sm text-[#f7f2e8] outline-none transition placeholder:text-[#a9a9a9]/70 focus:border-[#d8b56d]/50" placeholder="Titre concis" />
        </label>
        <label class="mt-5 block">
          <span class="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Suggestion</span>
          <textarea id="sug-desc" rows="4" class="mt-2 h-36 w-full resize-none rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 font-sans text-sm text-[#f7f2e8] outline-none transition placeholder:text-[#a9a9a9]/70 focus:border-[#d8b56d]/50" placeholder="Décrivez votre idée…"></textarea>
        </label>
        <p class="text-sm text-red-400 mt-3 mb-3 min-h-[1em]" id="sug-error"></p>
        <button type="submit" class="gold-gradient mt-5 h-11 w-full rounded-full font-sans text-sm font-bold text-black transition hover:scale-[1.01]">Envoyer la suggestion</button>
      </form>
      <aside class="glass flex min-h-[420px] flex-col justify-between rounded-[1.75rem] border-[#d8b56d]/25 bg-gradient-to-br from-[#d8b56d]/15 to-white/[0.04] p-7">
        <div>
          <p class="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b56d]">Aperçu en direct</p>
          <div id="sug-preview" class="mt-5"></div>
        </div>
        <span class="mt-8 inline-flex w-fit rounded-full border border-[#d8b56d]/30 bg-[#d8b56d]/10 px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8b56d]">Statut : à connecter</span>
      </aside>
    </div>
  `;

  const form = document.getElementById('suggestion-form');
  const nameEl = document.getElementById('sug-name');
  const categoryEl = document.getElementById('sug-category');
  const titleEl = document.getElementById('sug-title');
  const descEl = document.getElementById('sug-desc');
  const previewEl = document.getElementById('sug-preview');
  const errorEl = document.getElementById('sug-error');

  function updatePreview() {
    const name = nameEl.value.trim();
    const cat = categoryEl.value;
    const title = titleEl.value.trim();
    const desc = descEl.value.trim();

    if (!name && !cat && !title && !desc) {
      previewEl.innerHTML = '<p class="font-sans text-sm leading-7 text-[#a9a9a9] italic">Remplissez le formulaire pour voir un aperçu…</p>';
      return;
    }

    let html = '';
    if (cat) html += `<span class="inline-block text-[0.65rem] font-semibold uppercase tracking-wider text-[#d8b56d] bg-[#d8b56d]/10 px-2.5 py-1 rounded-full mb-3">${esc(cat)}</span>`;
    if (title) html += `<h3 class="font-heading text-2xl font-bold leading-tight text-[#f7f2e8]">“${esc(title)}”</h3>`;
    if (desc) html += `<p class="mt-4 font-sans text-sm leading-7 text-[#a9a9a9]">${esc(desc)}</p>`;
    if (name) html += `<p class="mt-4 font-sans text-xs text-[#a9a9a9]/60">— ${esc(name)}</p>`;
    previewEl.innerHTML = html || '<p class="font-sans text-sm leading-7 text-[#a9a9a9] italic">Remplissez le formulaire pour voir un aperçu…</p>';
  }

  [nameEl, categoryEl, titleEl, descEl].forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameEl.value.trim();
    const cat = categoryEl.value;
    const title = titleEl.value.trim();
    const desc = descEl.value.trim();

    if (!cat || !title || !desc) {
      errorEl.textContent = 'Veuillez remplir la catégorie, le titre et la description.';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    errorEl.textContent = '';

    try {
      await addDoc(collection(db, 'suggestions'), {
        name: name || '',
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
    submitBtn.textContent = 'Envoyer la suggestion';
  });
}

function showNotification(message, type) {
  const existing = document.querySelector('.suggestion-notification');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `mt-4 px-4 py-3 rounded-lg text-sm text-center animate-[fadeIn_0.3s_ease] ${
    type === 'success'
      ? 'bg-green-500/15 text-green-400 border border-green-500/30'
      : 'bg-red-500/15 text-red-400 border border-red-500/30'
  }`;
  el.textContent = message;
  document.getElementById('suggestions-container').appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
