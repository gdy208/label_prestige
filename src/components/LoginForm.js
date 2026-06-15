import { auth, db } from '../firebase.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setState } from '../auth.js';

function buildHTML() {
  return `
    <div class="login-modal-overlay">
      <div class="login-modal">
        <button class="login-modal-close" aria-label="Fermer">&times;</button>
        <h2 class="login-modal-title">Accès Membres du Bureau</h2>
        <form id="login-form">
          <div class="login-field">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" placeholder="Entrez votre email" required />
          </div>
          <div class="login-field">
            <label for="login-password">Mot de passe</label>
            <input type="password" id="login-password" placeholder="Entrez votre mot de passe" required />
          </div>
          <p id="login-error" class="login-error"></p>
          <button type="submit" class="btn btn-gold login-submit">Se connecter</button>
        </form>
      </div>
    </div>
  `;
}

async function handleSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('login-email')?.value || '';
  const password = document.getElementById('login-password')?.value || '';
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.querySelector('.login-submit');

  if (!email || !password) {
    errorEl.textContent = 'Veuillez remplir tous les champs.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Connexion en cours...';
  errorEl.textContent = '';

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));

    if (!userDoc.exists() || userDoc.data().active === false) {
      await signOut(auth);
      errorEl.textContent = 'Identifiants incorrects. Accès réservé aux membres du bureau.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
      return;
    }

    const userData = userDoc.data();
    const role = userData.role || 'bureau';
    const poste = userData.poste || null;
    setState({ user: cred.user, role, poste, isAdmin: true });
    close();
  } catch (err) {
    const code = err.code || '';
    const messages = {
      'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/invalid-credential': 'Email ou mot de passe incorrect.',
      'auth/invalid-email': "Format d'email invalide.",
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      'auth/api-key-not-valid': 'Clé API Firebase invalide.',
      'auth/operation-not-allowed': 'Connexion email/mot de passe désactivée dans Firebase.',
      'auth/network-request-failed': 'Erreur réseau.',
    };
    errorEl.textContent = messages[code] || 'Identifiants incorrects. Accès réservé aux membres du bureau.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Se connecter';
  }
}

function close() {
  const el = document.querySelector('.login-modal-overlay');
  if (el) el.remove();
}

function open() {
  close();
  const root = document.getElementById('modal-root');
  if (!root) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildHTML();
  const overlay = wrapper.firstElementChild;
  root.appendChild(overlay);

  overlay.querySelector('.login-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.getElementById('login-form').addEventListener('submit', handleSubmit);

  requestAnimationFrame(() => overlay.classList.add('active'));
  document.getElementById('login-email')?.focus();
}

export { open as openLoginModal, close as closeLoginModal };
