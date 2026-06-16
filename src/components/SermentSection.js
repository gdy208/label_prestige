import { db } from '../firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';

export function setupSermentSection() {
  try {
    onSnapshot(doc(db, 'config', 'serment'), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      const phone1 = document.getElementById('serment-phone1');
      const phone2 = document.getElementById('serment-phone2');
      if (phone1) phone1.textContent = data.phone1 || '';
      if (phone2) phone2.textContent = data.phone2 || '';

      if (data.pulls && Array.isArray(data.pulls)) {
        data.pulls.forEach(p => {
          if (!p.url) return;
          const placeholder = document.querySelector(`.serment-pull-placeholder[data-slot="${p.id}"]`);
          if (!placeholder) return;
          const existing = placeholder.querySelector('img');
          if (existing) {
            existing.src = p.url;
          } else {
            const img = document.createElement('img');
            img.src = p.url;
            img.alt = p.label || `Pull Label Prestige — ${p.id}`;
            img.loading = 'lazy';
            placeholder.innerHTML = '';
            placeholder.appendChild(img);
          }
        });
      }
    });
  } catch (err) {
    console.warn('SermentSection — Firestore indisponible :', err.message);
  }
}
