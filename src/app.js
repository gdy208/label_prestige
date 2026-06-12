import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { setupHeader } from './components/Header.js';

console.log("Label Prestige promotional website loaded.");

function initApp() {
  console.log("Initializing Application...");
  
  // Initialize Header logic
  setupHeader();

  // Set up Firebase Auth listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is logged in:", user.email);
    } else {
      console.log("No user is logged in.");
    }
  });

  // Mobile Hamburger Navigation toggles
  setupMobileNav();
}

function setupMobileNav() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
