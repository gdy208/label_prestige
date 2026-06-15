import { db, storage, auth } from '../firebase.js';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { createDocumentCard } from './DocumentCard.js';
import { getState } from '../auth.js';

const subcategories = [
  { id: 'matieres-maths', label: 'Mathématiques' },
  { id: 'matieres-physique', label: 'Physique' },
  { id: 'matieres-chimie', label: 'Chimie' },
  { id: 'matieres-si', label: 'Sciences Industrielles' },
  { id: 'matieres-info', label: 'Informatique' },
];

const tree = [
  {
    id: '1ere',
    label: '1ère Année',
    children: subcategories.map(s => ({ ...s, category: `1ère Année/${s.label}` })),
  },
  {
    id: '2eme',
    label: '2ème Année',
    children: subcategories.map(s => ({ ...s, category: `2ème Année/${s.label}` })),
  },
  { id: 'concours', label: 'Sujets Concours', children: [], category: 'Sujets Concours' },
];

const DOC_TYPES = ['Cours', 'TD', 'Devoir', 'Correction', 'Autre'];

let overlay = null;
let currentCategory = null;
let activeCategoryName = '';
let uploadForm = null;
let notificationEl = null;

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

function showNotification(message, type = 'success') {
  if (!notificationEl) {
    notificationEl = document.createElement('div');
    notificationEl.className = 'doc-notification';
    overlay.querySelector('.doc-library').appendChild(notificationEl);
  }
  notificationEl.textContent = message;
  notificationEl.className = `doc-notification doc-notification-${type}`;
  notificationEl.style.display = 'block';
  setTimeout(() => { notificationEl.style.display = 'none'; }, 4000);
}

function createModal() {
  const { isAdmin } = getState();
  overlay = document.createElement('div');
  overlay.className = 'login-modal-overlay';
  overlay.innerHTML = `
    <div class="doc-library">
      <div class="doc-library-header">
        <h2 class="doc-library-title">Bibliothèque Technique</h2>
        <div class="doc-library-header-actions">
          ${isAdmin ? '<button class="btn btn-gold btn-upload-toggle" style="font-size:0.75rem;padding:6px 16px">Téléverser</button>' : ''}
          <button class="login-modal-close" aria-label="Fermer">&times;</button>
        </div>
      </div>
      <div class="doc-library-body">
        <div class="doc-library-tree" id="doc-tree"></div>
        <div class="doc-library-content" id="doc-content">
          <p class="admin-placeholder">Sélectionnez une catégorie</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);

  overlay.querySelector('.login-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  const uploadToggle = overlay.querySelector('.btn-upload-toggle');
  if (uploadToggle) {
    uploadToggle.addEventListener('click', () => toggleUploadForm());
  }

  renderTree();
  loadDocuments(tree[0].children[0]);
}

function toggleUploadForm() {
  if (uploadForm) {
    uploadForm.remove();
    uploadForm = null;
    return;
  }
  createUploadForm();
}

function createUploadForm() {
  uploadForm = document.createElement('div');
  uploadForm.className = 'doc-upload-form';
  uploadForm.innerHTML = `
    <h3 class="doc-upload-title">Téléverser un document</h3>
    <div class="doc-upload-field">
      <label class="doc-upload-label">Nom du document</label>
      <input type="text" class="doc-upload-input" id="upload-name" placeholder="Ex: Cours Maths Chapitre 1" />
    </div>
    <div class="doc-upload-field">
      <label class="doc-upload-label">Type</label>
      <select class="doc-upload-input" id="upload-type">
        ${DOC_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
    </div>
    <div class="doc-upload-field">
      <label class="doc-upload-label">Année académique</label>
      <input type="text" class="doc-upload-input" id="upload-year" placeholder="Ex: 2025-2026" />
    </div>
    <div class="doc-upload-field">
      <label class="doc-upload-label">Catégorie</label>
      <input type="text" class="doc-upload-input" id="upload-category" readonly value="${esc(activeCategoryName)}" />
    </div>
    <div class="doc-upload-field">
      <label class="doc-upload-label">Fichier (PDF)</label>
      <input type="file" class="doc-upload-input doc-upload-file" id="upload-file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip" />
    </div>
    <div class="doc-upload-progress" id="upload-progress" style="display:none">
      <div class="doc-progress-bar" id="progress-bar"><span id="progress-text">0%</span></div>
    </div>
    <div class="doc-upload-actions">
      <button class="btn btn-gold" id="upload-submit" style="font-size:0.8rem">Téléverser</button>
      <button class="btn btn-outline" id="upload-cancel" style="font-size:0.8rem">Annuler</button>
    </div>
  `;

  const body = overlay.querySelector('.doc-library-body');
  body.parentNode.insertBefore(uploadForm, body);

  uploadForm.querySelector('#upload-submit').addEventListener('click', handleUpload);
  uploadForm.querySelector('#upload-cancel').addEventListener('click', () => {
    uploadForm.remove();
    uploadForm = null;
  });
}

async function handleUpload() {
  const name = document.getElementById('upload-name').value.trim();
  const type = document.getElementById('upload-type').value;
  const year = document.getElementById('upload-year').value.trim();
  const category = document.getElementById('upload-category').value.trim();
  const fileInput = document.getElementById('upload-file');
  const file = fileInput?.files?.[0];

  if (!name || !year || !category || !file) {
    showNotification('Veuillez remplir tous les champs et sélectionner un fichier.', 'error');
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showNotification('Vous devez être connecté.', 'error');
    return;
  }

  const submitBtn = document.getElementById('upload-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Téléversement...';

  const progressContainer = document.getElementById('upload-progress');
  progressContainer.style.display = 'block';

  try {
    const ext = file.name.split('.').pop();
    const safeName = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.${ext}`;
    const storagePath = `documents/${year}/${category}/${safeName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        snapshot => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          const bar = document.getElementById('progress-bar');
          const txt = document.getElementById('progress-text');
          bar.style.width = `${pct}%`;
          txt.textContent = `${pct}%`;
        },
        error => reject(error),
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, 'documents'), {
              name,
              type,
              academicYear: year,
              category,
              storagePath: downloadURL,
              storageRef: storagePath,
              filename: file.name,
              createdBy: user.uid,
              createdAt: Timestamp.now(),
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        }
      );
    });

    showNotification('Document téléversé avec succès !', 'success');
    uploadForm.remove();
    uploadForm = null;
    loadDocuments(currentCategory);
  } catch (err) {
    console.error('Erreur upload :', err);
    showNotification("Erreur lors du téléversement. Vérifiez votre connexion et réessayez.", 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Téléverser';
    document.getElementById('upload-progress').style.display = 'none';
  }
}

async function handleDelete(docToDelete) {
  if (!confirm(`Supprimer définitivement "${docToDelete.name}" ?`)) return;

  try {
    if (docToDelete.storageRef) {
      try {
        const storageRefObj = ref(storage, docToDelete.storageRef);
        await deleteObject(storageRefObj);
      } catch (storageErr) {
        console.warn('Impossible de supprimer du Storage (fichier peut-être déjà effacé) :', storageErr);
      }
    }

    await deleteDoc(doc(db, 'documents', docToDelete.id));
    showNotification('Document supprimé.', 'success');
    loadDocuments(currentCategory);
  } catch (err) {
    console.error('Erreur suppression :', err);
    showNotification('Erreur lors de la suppression.', 'error');
  }
}

function renderTree() {
  const container = document.getElementById('doc-tree');
  if (!container) return;

  const ul = document.createElement('ul');
  ul.className = 'doc-tree-list';

  tree.forEach(node => {
    const li = document.createElement('li');
    li.className = 'doc-tree-node';

    const header = document.createElement('div');
    header.className = `doc-tree-header${node.children.length > 0 ? ' doc-tree-parent' : ''}`;
    header.textContent = node.label;

    if (node.children.length > 0) {
      const childUl = document.createElement('ul');
      childUl.className = 'doc-tree-sublist';
      childUl.style.display = 'block';

      node.children.forEach(child => {
        const childLi = document.createElement('li');
        childLi.className = 'doc-tree-leaf';
        childLi.textContent = child.label;
        childLi.dataset.category = child.category;
        childLi.addEventListener('click', () => {
          document.querySelectorAll('.doc-tree-leaf').forEach(l => l.classList.remove('active'));
          childLi.classList.add('active');
          activeCategoryName = child.category;
          updateCategoryField();
          loadDocuments(child);
        });
        childUl.appendChild(childLi);
      });

      header.addEventListener('click', () => {
        const isOpen = childUl.style.display !== 'none';
        childUl.style.display = isOpen ? 'none' : 'block';
        header.classList.toggle('collapsed', isOpen);
      });

      li.appendChild(header);
      li.appendChild(childUl);

      const firstChild = node.children[0];
      childUl.querySelector('.doc-tree-leaf')?.classList.add('active');
      currentCategory = firstChild;
      activeCategoryName = firstChild.category;
    } else {
      li.appendChild(header);
      header.addEventListener('click', () => {
        document.querySelectorAll('.doc-tree-leaf').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.doc-tree-header').forEach(h => h.classList.remove('active'));
        header.classList.add('active');
        activeCategoryName = node.category || node.label;
        updateCategoryField();
        loadDocuments(node);
      });
      header.classList.add('active');
      currentCategory = node;
      activeCategoryName = node.category || node.label;
    }

    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function updateCategoryField() {
  const field = document.getElementById('upload-category');
  if (field) field.value = activeCategoryName;
}

async function loadDocuments(categoryNode) {
  if (!categoryNode) return;
  currentCategory = categoryNode;

  const content = document.getElementById('doc-content');
  if (!content) return;

  content.innerHTML = '<p class="admin-placeholder">Chargement des documents...</p>';

  try {
    const q = query(
      collection(db, 'documents'),
      where('category', '==', categoryNode.category || categoryNode.label)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (docs.length === 0) {
      content.innerHTML = '<p class="admin-placeholder">Aucun document dans cette catégorie.</p>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'doc-grid';

    const { isAdmin } = getState();
    docs.forEach(d => {
      grid.appendChild(createDocumentCard(d, {
        showDelete: isAdmin,
        onDelete: handleDelete,
      }));
    });

    content.innerHTML = '';
    content.appendChild(grid);
  } catch (err) {
    console.error('Erreur chargement documents :', err);
    content.innerHTML = '<p class="admin-placeholder">Erreur de chargement.</p>';
  }
}

function close() {
  if (overlay) overlay.classList.remove('active');
  if (uploadForm) { uploadForm.remove(); uploadForm = null; }
  if (notificationEl) { notificationEl.remove(); notificationEl = null; }
}

function open() {
  if (!overlay) createModal();
  overlay.classList.add('active');
}

export function openDocumentLibrary() { open(); }
export function closeDocumentLibrary() { close(); }
