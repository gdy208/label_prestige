import { getState, subscribe } from '../auth.js';
import { setupAdminActivities } from './AdminActivities.js';
import { setupAdminConcours } from './AdminConcours.js';

let overlay = null;
let currentPoste = null;
let currentTab = null;

const tabs = [
  { id: 'activities', label: 'Activités', requires: ['developpeur', 'président'] },
  { id: 'concours', label: 'Concours', requires: ['developpeur', 'président'] },
  { id: 'members', label: 'Membres', requires: ['developpeur'] },
  { id: 'suggestions', label: 'Suggestions' },
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

function createDashboard() {
  overlay = document.createElement('div');
  overlay.className = 'admin-overlay';
  overlay.innerHTML = `
    <div class="admin-dashboard">
      <button class="admin-close" aria-label="Fermer">&times;</button>
      <h2 class="admin-title">Panneau d'Administration</h2>
      <div class="admin-tabs" id="admin-tabs"></div>
      <div class="admin-content" id="admin-content"></div>
    </div>
  `;

  document.getElementById('modal-root').appendChild(overlay);

  overlay.querySelector('.admin-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  renderTabs();
  const first = firstVisibleTab();
  selectTab(first ? first.id : 'suggestions');
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
  }
}

function close() {
  if (overlay) overlay.classList.remove('active');
}

function open() {
  currentPoste = getState().poste;
  if (!overlay) createDashboard();
  overlay.classList.add('active');
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

export { open as openAdminDashboard, close as closeAdminDashboard };
