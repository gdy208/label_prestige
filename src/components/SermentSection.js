import { db } from '../firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';

const base = import.meta.env.BASE_URL || '/';
const LOCAL_IMAGES = [
  { slot: 'face', src: `${base}assets/images/serment/pull1.jpeg`, alt: 'Pull Label Prestige — face' },
  { slot: 'dos', src: `${base}assets/images/serment/pull2.jpeg`, alt: 'Pull Label Prestige — dos' },
  { slot: 'detail', src: `${base}assets/images/serment/blouse1.jpeg`, alt: 'Blouse Label Prestige — détail' },
  { slot: 'porte', src: `${base}assets/images/serment/blouse2.jpeg`, alt: 'Blouse Label Prestige — porté' },
];

function loadLocalImages() {
  LOCAL_IMAGES.forEach(img => {
    const placeholder = document.querySelector(`.serment-pull-placeholder[data-slot="${img.slot}"]`);
    if (!placeholder) return;
    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt;
    imgEl.loading = 'lazy';
    placeholder.innerHTML = '';
    placeholder.appendChild(imgEl);
  });
}

export function setupSermentSection() {
  loadLocalImages();

  try {
    onSnapshot(doc(db, 'config', 'serment'), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      const phone1 = document.getElementById('serment-phone1');
      const phone2 = document.getElementById('serment-phone2');
      if (phone1) phone1.textContent = data.phone1 || '';
      if (phone2) phone2.textContent = data.phone2 || '';
    });
  } catch (err) {
    console.warn('SermentSection — Firestore indisponible :', err.message);
  }
}
