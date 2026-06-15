import { auth } from '../firebase.js';
import { signOut } from 'firebase/auth';
import { openLoginModal } from './LoginForm.js';
import { openAdminDashboard } from './AdminDashboard.js';
import { openDocumentLibrary } from './DocumentLibrary.js';
import { subscribe, setState } from '../auth.js';

export function setupHeader() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#documents') {
        e.preventDefault();
        openDocumentLibrary();
        return;
      }
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  const heroDocsBtn = document.querySelector('.hero-actions .btn-outline[href="#documents"]');
  if (heroDocsBtn) {
    heroDocsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openDocumentLibrary();
    });
  }

  const loginBtn = document.getElementById('login-btn');
  const adminBtn = document.getElementById('admin-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        setState({ user: null, role: null, poste: null, isAdmin: false });
      } catch (err) {
        console.error('Erreur déconnexion :', err);
      }
    });
  }

  if (adminBtn) {
    adminBtn.addEventListener('click', openAdminDashboard);
  }

  subscribe(authState => {
    if (loginBtn) loginBtn.style.display = authState.isAdmin ? 'none' : '';
    if (adminBtn) adminBtn.style.display = authState.isAdmin ? '' : 'none';
    if (logoutBtn) logoutBtn.style.display = authState.isAdmin ? '' : 'none';
  });
}
