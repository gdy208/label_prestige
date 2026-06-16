import { getState, subscribe } from '../auth.js';
import { setupAdminActivities } from './AdminActivities.js';
import { setupAdminConcours } from './AdminConcours.js';
import { setupAdminMembers } from './AdminMembers.js';
import { setupSuggestionList } from './SuggestionList.js';
import { setupAdminSerment } from './AdminSerment.js';
import { db } from '../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let overlay = null;
let currentPoste = null;
let currentTab = null;
let devNote = '';

const tabs = [
  { id: 'activities', label: 'Activités', requires: ['developpeur', 'président'] },
  { id: 'concours', label: 'Concours', requires: ['developpeur', 'président'] },
  { id: 'members', label: 'Membres', requires: ['developpeur'] },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'serment', label: 'Serment Techno' },
];

function posteMatches(poste, required) {
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const a = norm(poste || '');
  const b = norm(required || '');
  return a === b || a.startsWith(b);
}

function hasAccess(poste, requires) {
  if (!requires) return true;
  return requires.some(r => posteMatches(poste, r));
}

function firstVisibleTab() {
  return tabs.find(t => hasAccess(currentPoste, t.requires));
}

async function loadDevNote() {
  try {
    const snap = await getDoc(doc(db, 'config', 'devNote'));
    devNote = snap.exists() ? (snap.data().message || '') : '';
  } catch (e) {
    devNote = '';
  }
}

function renderDevNote() {
  const container = document.getElementById('devnote-container');
  if (!container) return;
  const isDev = currentPoste === 'developpeur';

  if (!devNote && !isDev) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="devnote-banner">
      ${devNote ? `<div class="devnote-message">${esc(devNote)}</div>` : ''}
      ${isDev ? `
        <div class="devnote-edit">
          <textarea id="devnote-textarea" class="devnote-textarea" rows="3" placeholder="Écris ton message aux membres du bureau...">${esc(devNote)}</textarea>
          <button class="btn btn-gold" id="devnote-save" style="font-size:0.75rem;padding:6px 16px">${devNote ? 'Modifier' : 'Ajouter un message'}</button>
        </div>
      ` : ''}
    </div>
  `;

  if (isDev) {
    document.getElementById('devnote-save')?.addEventListener('click', saveDevNote);
  }
}

async function saveDevNote() {
  const textarea = document.getElementById('devnote-textarea');
  const msg = textarea?.value?.trim() || '';
  const btn = document.getElementById('devnote-save');
  btn.disabled = true;
  btn.textContent = 'Sauvegarde...';

  try {
    await setDoc(doc(db, 'config', 'devNote'), {
      message: msg,
      updatedAt: new Date(),
      updatedBy: getState().user?.email || 'inconnu',
    });
    devNote = msg;
    renderDevNote();
  } catch (e) {
    console.error('Erreur sauvegarde mot du développeur :', e);
  }

  btn.disabled = false;
  btn.textContent = msg ? 'Modifier' : 'Ajouter un message';
}

function createDashboard() {
  overlay = document.createElement('div');
  overlay.className = 'admin-overlay';
  overlay.innerHTML = `
    <div class="admin-dashboard">
      <button class="admin-close" aria-label="Fermer">&times;</button>
      <h2 class="admin-title">Panneau d'Administration</h2>
      <div id="devnote-container"></div>
      <div class="admin-tabs" id="admin-tabs"></div>
      <div class="admin-content" id="admin-content"></div>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);

  overlay.querySelector('.admin-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  loadDevNote().then(() => {
    renderDevNote();
    renderTabs();
    const first = firstVisibleTab();
    selectTab(first ? first.id : 'suggestions');
  });
}

function renderTabs() {
  const container = document.getElementById('admin-tabs');
  if (!container) return;

  const poste = currentPoste;
  container.innerHTML = '';

  tabs.forEach(t => {
    if (!hasAccess(poste, t.requires)) return;
    const btn = document.createElement('button');
    btn.className = 'admin-tab';
    btn.dataset.tab = t.id;
    btn.textContent = t.label;
    btn.addEventListener('click', () => selectTab(t.id));
    container.appendChild(btn);
  });
}

function selectTab(tabId) {
  const tabBtn = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
  if (!tabBtn) {
    const first = firstVisibleTab();
    if (first) return selectTab(first.id);
    return;
  }

  currentTab = tabId;
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  tabBtn.classList.add('active');

  const content = document.getElementById('admin-content');

  const labels = {
    activities: 'Gestion des Activités',
    concours: 'Gestion des Concours',
    members: 'Gestion des Membres',
    suggestions: 'Gestion des Suggestions',
    serment: 'Gestion du Serment Techno',
  };

  content.innerHTML = `
    <h3 class="admin-section-title">${labels[tabId] || ''}</h3>
    <div id="admin-${tabId}" class="admin-panel"></div>
  `;

  const panel = document.getElementById(`admin-${tabId}`);
  if (tabId === 'activities') {
    setupAdminActivities(panel);
  } else if (tabId === 'concours') {
    setupAdminConcours(panel);
  } else if (tabId === 'members') {
    setupAdminMembers(panel);
  } else if (tabId === 'suggestions') {
    setupSuggestionList(panel);
  } else if (tabId === 'serment') {
    setupAdminSerment(panel);
  }
}

function close() {
  if (overlay) overlay.classList.remove('active');
}

function open() {
  currentPoste = getState().poste;
  if (!overlay) createDashboard();
  overlay.classList.add('active');
  renderTabs();
  const tabBtn = document.querySelector(`.admin-tab[data-tab="${currentTab}"]`);
  if (!tabBtn) {
    const first = firstVisibleTab();
    if (first) selectTab(first.id);
  }
}

subscribe(state => {
  const prevPoste = currentPoste;
  currentPoste = state.poste;
  if (!state.isAdmin && overlay?.classList.contains('active')) {
    close();
  } else if (state.isAdmin && prevPoste !== state.poste && overlay?.classList.contains('active')) {
    renderTabs();
    const tabBtn = document.querySelector(`.admin-tab[data-tab="${currentTab}"]`);
    if (!tabBtn) {
      const first = firstVisibleTab();
      if (first) selectTab(first.id);
    }
  }
});

function esc(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

export { open as openAdminDashboard, close as closeAdminDashboard };
