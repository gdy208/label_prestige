import { auth, db } from '../firebase.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setState } from '../auth.js';

function buildHTML() {
  return `
    <div class="login-modal-overlay">
      <div class="login-modal" style="background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(201,163,77,0.2);border-radius:16px;padding:40px;max-width:420px;width:90%;position:relative">
        <button class="login-modal-close" style="position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.5rem;cursor:pointer;padding:4px 8px;line-height:1">&times;</button>
        <h2 class="login-modal-title" style="font-family:Playfair Display,serif;font-size:1.5rem;color:#C9A34D;margin-bottom:24px;text-align:center">Accès Membres du Bureau</h2>
        <form id="login-form">
          <div class="login-field" style="margin-bottom:16px">
            <label for="login-email" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Email</label>
            <input type="email" id="login-email" placeholder="Entrez votre email" required style="width:100%;padding:12px 16px;font-size:0.95rem;color:#FFFAF0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;outline:none;transition:border-color 0.2s" />
          </div>
          <div class="login-field" style="margin-bottom:20px">
            <label for="login-password" style="display:block;font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Mot de passe</label>
            <input type="password" id="login-password" placeholder="Entrez votre mot de passe" required style="width:100%;padding:12px 16px;font-size:0.95rem;color:#FFFAF0;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;outline:none;transition:border-color 0.2s" />
          </div>
          <p id="login-error" class="login-error" style="color:#ef4444;font-size:0.85rem;margin-bottom:12px;text-align:center"></p>
          <button type="submit" class="login-submit" style="width:100%;padding:12px 24px;font-size:0.95rem;font-weight:600;color:#000;background:linear-gradient(135deg,#C9A34D,#A8882D);border:none;border-radius:8px;cursor:pointer;transition:opacity 0.2s">Se connecter</button>
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
