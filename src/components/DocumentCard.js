export function createDocumentCard(doc, opts = {}) {
  const { showDelete = false, onDelete } = opts;
  const card = document.createElement('div');
  card.className = 'doc-card';

  const typeBadge = doc.type
    ? `<span class="doc-badge doc-badge-${doc.type.toLowerCase().replace(/[\s-]+/g, '-')}">${esc(doc.type)}</span>`
    : '';

  card.innerHTML = `
    <div class="doc-card-header">
      <h4 class="doc-card-title">${esc(doc.name || 'Sans titre')}</h4>
      ${typeBadge}
    </div>
    <div class="doc-card-meta">
      ${doc.academicYear ? `<span class="doc-meta-item">${esc(doc.academicYear)}</span>` : ''}
      ${doc.filename ? `<span class="doc-meta-item">${esc(doc.filename)}</span>` : ''}
    </div>
    <div class="doc-card-actions">
      <button class="btn btn-outline-gold doc-download" style="font-size:0.7rem;padding:6px 14px">
        Télécharger
      </button>
      ${showDelete ? '<button class="btn btn-outline doc-delete" style="font-size:0.7rem;padding:6px 14px;border-color:rgba(255,80,80,0.3);color:#ff5050">Supprimer</button>' : ''}
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
