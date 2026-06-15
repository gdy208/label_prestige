import { db } from '../firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { createDocumentCard } from './DocumentCard.js';

const tree = [
  {
    id: '1ere',
    label: '1ère Année',
    children: [
      { id: '1ere-maths', label: 'Mathématiques', category: '1ère Année/Mathématiques' },
      { id: '1ere-physique', label: 'Physique', category: '1ère Année/Physique' },
      { id: '1ere-chimie', label: 'Chimie', category: '1ère Année/Chimie' },
      { id: '1ere-si', label: 'Sciences Industrielles', category: '1ère Année/Sciences Industrielles' },
      { id: '1ere-info', label: 'Informatique', category: '1ère Année/Informatique' },
    ],
  },
  { id: '2eme', label: '2ème Année', children: [], category: '2ème Année' },
  { id: 'concours', label: 'Concours Spéciaux', children: [], category: 'Concours Spéciaux' },
];

let overlay = null;
let currentCategory = null;

function createModal() {
  overlay = document.createElement('div');
  overlay.className = 'login-modal-overlay';
  overlay.innerHTML = `
    <div class="doc-library">
      <button class="login-modal-close" aria-label="Fermer">&times;</button>
      <h2 class="admin-title" style="padding:24px 24px 0">Bibliothèque Technique</h2>
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

  renderTree();
  loadDocuments(tree[0].children[0]);
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
    } else {
      li.appendChild(header);
      header.addEventListener('click', () => {
        document.querySelectorAll('.doc-tree-leaf').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.doc-tree-header').forEach(h => h.classList.remove('active'));
        header.classList.add('active');
        loadDocuments(node);
      });
      header.classList.add('active');
      currentCategory = node;
    }

    ul.appendChild(li);
  });

  container.appendChild(ul);
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

    docs.forEach(d => {
      grid.appendChild(createDocumentCard(d));
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
}

function open() {
  if (!overlay) createModal();
  overlay.classList.add('active');
}

export function openDocumentLibrary() { open(); }
export function closeDocumentLibrary() { close(); }
