import { getState, subscribe } from '../auth.js';
import { setupAdminActivities } from './AdminActivities.js';
import { setupAdminConcours } from './AdminConcours.js';
import { setupAdminMembers } from './AdminMembers.js';
import { setupSuggestionList } from './SuggestionList.js';
import { setupAdminSerment } from './AdminSerment.js';
import { db } from '../firebase.js';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

let overlay = null;
let currentPoste = null;
let currentTab = null;
let devNote = '';

const tabs = [
  { id: 'overview', label: 'Vue d\'Ensemble' },
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
      <button class="devnote-close" id="devnote-close" aria-label="Fermer">&times;</button>
      ${devNote ? `<div class="devnote-message">${esc(devNote)}</div>` : ''}
      ${isDev ? `
        <div class="devnote-edit">
          <textarea id="devnote-textarea" class="devnote-textarea" rows="3" placeholder="Écris ton message aux membres du bureau...">${esc(devNote)}</textarea>
          <button class="btn btn-gold" id="devnote-save" style="font-size:0.75rem;padding:6px 16px">${devNote ? 'Modifier' : 'Ajouter un message'}</button>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('devnote-close')?.addEventListener('click', () => {
    container.innerHTML = '';
  });

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
    <div class="admin-dashboard" style="background:rgba(3,3,3,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.14);border-radius:24px;max-width:1300px;width:95%;max-height:92vh;overflow:hidden;margin:auto;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:0">
      <button class="admin-close" style="position:absolute;top:16px;right:20px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.75rem;cursor:pointer;padding:4px 10px;line-height:1;z-index:10">&times;</button>
      <div class="glass rounded-[1.75rem] p-8 md:p-10 m-8" style="flex-shrink:0">
        <p class="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#d8b56d]">Interface connectée</p>
        <h1 class="mt-6 font-heading text-4xl font-bold text-[#f7f2e8] md:text-5xl">Dashboard Admin</h1>
      </div>
      <div id="devnote-container" class="px-8 md:px-10"></div>
      <div class="flex gap-2 px-8 md:px-10 pt-4 border-b border-white/5 overflow-x-auto" id="admin-tabs" style="flex-shrink:0"></div>
      <div class="flex-1 overflow-y-auto p-8 md:p-10" id="admin-content"></div>
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
    btn.className = 'px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#a9a9a9] bg-transparent border-b-2 border-transparent cursor-pointer transition-all duration-300 hover:text-[#d8b56d] whitespace-nowrap';
    btn.dataset.tab = t.id;
    btn.textContent = t.label;
    btn.addEventListener('click', () => selectTab(t.id));
    container.appendChild(btn);
  });
}

function selectTab(tabId) {
  const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (!tabBtn) {
    const first = firstVisibleTab();
    if (first) return selectTab(first.id);
    return;
  }

  currentTab = tabId;
  document.querySelectorAll('#admin-tabs [data-tab]').forEach(b => {
    b.classList.remove('text-[#d8b56d]', 'border-[#d8b56d]');
    b.classList.add('text-[#a9a9a9]', 'border-transparent');
  });
  tabBtn.classList.remove('text-[#a9a9a9]', 'border-transparent');
  tabBtn.classList.add('text-[#d8b56d]', 'border-[#d8b56d]');

  const content = document.getElementById('admin-content');

  content.innerHTML = `
    <div id="admin-${tabId}" class="admin-panel"></div>
  `;

  const panel = document.getElementById(`admin-${tabId}`);
  if (tabId === 'overview') {
    renderOverview(panel);
  } else if (tabId === 'activities') {
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

function renderOverview(panel) {
  panel.innerHTML = `
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
      <article class="glass rounded-3xl p-8 text-center">
        <p class="font-display text-4xl font-bold text-[#f7f2e8]" id="stat-activities">-</p>
        <p class="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Activités</p>
      </article>
      <article class="glass rounded-3xl p-8 text-center">
        <p class="font-display text-4xl font-bold text-[#f7f2e8]" id="stat-concours">-</p>
        <p class="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Concours</p>
      </article>
      <article class="glass rounded-3xl p-8 text-center">
        <p class="font-display text-4xl font-bold text-[#f7f2e8]" id="stat-membres">-</p>
        <p class="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Membres</p>
      </article>
      <article class="glass rounded-3xl p-8 text-center">
        <p class="font-display text-4xl font-bold text-[#f7f2e8]" id="stat-suggestions">-</p>
        <p class="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-[#a9a9a9]">Suggestions</p>
      </article>
    </div>
    <p class="text-sm text-[#a9a9a9] italic">Les statistiques se mettent à jour en temps réel.</p>
  `;

  loadStats();
}

async function loadStats() {
  try {
    const [actSnap, concSnap, memSnap, sugSnap] = await Promise.all([
      getDocs(collection(db, 'activites')),
      getDocs(collection(db, 'concours')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'suggestions')),
    ]);

    const el = id => document.getElementById(id);
    if (el('stat-activities')) el('stat-activities').textContent = actSnap.size;
    if (el('stat-concours')) el('stat-concours').textContent = concSnap.size;
    if (el('stat-membres')) el('stat-membres').textContent = memSnap.size;
    if (el('stat-suggestions')) el('stat-suggestions').textContent = sugSnap.size;
  } catch (e) {
    console.warn('Impossible de charger les stats :', e.message);
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
  const tabBtn = document.querySelector(`[data-tab="${currentTab}"]`);
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
    const tabBtn = document.querySelector(`[data-tab="${currentTab}"]`);
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
