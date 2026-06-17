export function createDocumentCard(doc, opts = {}) {
  const { showDelete = false, onDelete } = opts;
  const card = document.createElement('div');
  card.className = 'glassmorphic-card';
  card.style.cssText = 'padding:20px';

  const typeBadge = doc.type
    ? `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;background:rgba(201,163,77,0.15);color:#C9A34D">${esc(doc.type)}</span>`
    : '';

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px">
      <h4 style="font-family:Playfair Display,serif;font-size:1rem;color:#FFFAF0;margin:0">${esc(doc.name || 'Sans titre')}</h4>
      ${typeBadge}
    </div>
    <div style="display:flex;gap:16px;margin-bottom:16px;font-size:0.8rem;color:rgba(255,255,255,0.5)">
      ${doc.academicYear ? `<span>${esc(doc.academicYear)}</span>` : ''}
      ${doc.filename ? `<span>${esc(doc.filename)}</span>` : ''}
    </div>
    <div style="display:flex;gap:8px">
      <button class="doc-download" style="padding:8px 18px;font-size:0.75rem;font-weight:600;color:#C9A34D;background:rgba(201,163,77,0.1);border:1px solid rgba(201,163,77,0.3);border-radius:6px;cursor:pointer;transition:all 0.2s">
        Télécharger
      </button>
      ${showDelete ? '<button class="doc-delete" style="padding:8px 18px;font-size:0.75rem;font-weight:600;color:#ef4444;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;transition:all 0.2s">Supprimer</button>' : ''}
    </div>
  `;

  card.querySelector('.doc-download').addEventListener('click', () => {
    if (doc.storagePath) {
      const link = document.createElement('a');
      link.href = doc.storagePath;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
    }
  });

  const delBtn = card.querySelector('.doc-delete');
  if (delBtn && onDelete) {
    delBtn.addEventListener('click', () => onDelete(doc));
  }

  return card;
}

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}
