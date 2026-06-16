import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { setState } from './auth.js';
import { seedIfNeeded } from './seed.js';
import { setupHeader } from './components/Header.js';
import { setupHero } from './components/Hero.js';
import { setupTimeline } from './components/Timeline.js';
import { setupConcoursSection } from './components/ConcoursSection.js';
import { setupScrollAnimations } from './components/ScrollAnimations.js';
import { setupCanvas3D } from './components/Canvas3D.js';
import { setupParticles } from './components/Particles.js';
import { setupSuggestionsForm } from './components/SuggestionsForm.js';
import { setupSermentSection } from './components/SermentSection.js';

function isLowPowerDevice() {
  const mobile = window.innerWidth < 768 || 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return mobile || reducedMotion;
}

function setupBackground() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  if (isLowPowerDevice()) {
    container.classList.add('css-bg-fallback');
    return;
  }

  const scene = setupCanvas3D();
  if (scene) {
    setupParticles(scene);
  }
}

function initApp() {
  setupHeader();
  setupHero();
  setupTimeline(false);
  setupConcoursSection();
  setupSermentSection();
  setupSuggestionsForm();
  setupScrollAnimations();
  setupBackground();
  setupMobileNav();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.admin-overlay.active, .login-modal-overlay.active').forEach(el => {
        el.classList.remove('active');
      });
    }
  });

  seedIfNeeded().catch(e => console.warn('Seed non effectué :', e.message));

  let unsubUserDoc = null;

  onAuthStateChanged(auth, (user) => {
    if (unsubUserDoc) { unsubUserDoc(); unsubUserDoc = null; }

    if (user) {
      unsubUserDoc = onSnapshot(
        doc(db, 'users', user.uid),
        (snapshot) => {
          if (snapshot.exists() && snapshot.data().active !== false) {
            const data = snapshot.data();
            setState({ user, role: data.role || 'bureau', poste: data.poste || null, isAdmin: true });
          } else {
            signOut(auth);
          }
        },
        (err) => {
          console.error("Erreur monitoring user :", err);
          signOut(auth);
        }
      );
    } else {
      setState({ user: null, role: null, poste: null, isAdmin: false });
    }
  });
}

function setupMobileNav() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
