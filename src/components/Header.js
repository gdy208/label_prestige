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
        closeMobileNav();
      }
    });
  });

  const loginBtns = [document.getElementById('login-btn'), document.getElementById('mobile-login-btn')];
  const adminBtns = [document.getElementById('admin-btn'), document.getElementById('mobile-admin-btn')];
  const logoutBtns = [document.getElementById('logout-btn'), document.getElementById('mobile-logout-btn')];

  loginBtns.forEach(btn => { if (btn) btn.addEventListener('click', () => { closeMobileNav(); openLoginModal(); }); });
  logoutBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        setState({ user: null, role: null, poste: null, isAdmin: false });
      } catch (err) {
        console.error('Erreur déconnexion :', err);
      }
      closeMobileNav();
    });
  });
  adminBtns.forEach(btn => { if (btn) btn.addEventListener('click', () => { closeMobileNav(); openAdminDashboard(); }); });

  const hamburger = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('mobile-nav-overlay');
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const open = overlay.style.display !== 'block';
      overlay.style.display = open ? 'block' : 'none';
      hamburger.querySelectorAll('.bar').forEach((bar, i) => {
        if (open) {
          bar.style.transform = i === 0 ? 'translateY(6px) rotate(45deg)' : i === 2 ? 'translateY(-6px) rotate(-45deg)' : 'opacity:0';
          if (i === 1) bar.style.opacity = '0';
        } else {
          bar.style.transform = '';
          bar.style.opacity = '1';
        }
      });
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMobileNav();
    });
  }

  function closeMobileNav() {
    if (overlay) overlay.style.display = 'none';
    if (hamburger) hamburger.querySelectorAll('.bar').forEach(bar => { bar.style.transform = ''; bar.style.opacity = '1'; });
  }

  subscribe(authState => {
    [loginBtns, adminBtns, logoutBtns].forEach(group => group.forEach(btn => {
      if (!btn) return;
      if (btn.id.includes('login')) btn.style.display = authState.isAdmin ? 'none' : '';
      if (btn.id.includes('admin')) btn.style.display = authState.isAdmin ? '' : 'none';
      if (btn.id.includes('logout')) btn.style.display = authState.isAdmin ? '' : 'none';
    }));
  });
}
