/* Paperloop's Firebase project (paperloop-50c10): the database (Firestore) and Google sign-in.
   Used by Paperloop Admin (admin/), the landing pages (p/) and, later, the smart diary.
   These values only name the project; they are not secret. What anyone may read or write is decided by the
   rules in firestore.rules (see README.md → Firebase).
   On this computer (localhost) ?emulators=1 uses the local Firebase emulators instead of the real project. */
export const firebaseConfig = {
  apiKey: 'AIzaSyDVnUeMugsJuDuqbJM--vxG_QWUo4O-778',
  authDomain: 'paperloop-50c10.firebaseapp.com',
  projectId: 'paperloop-50c10',
  storageBucket: 'paperloop-50c10.firebasestorage.app',
  messagingSenderId: '39372603853',
  appId: '1:39372603853:web:75d8096bc16217f3110484'
};

const V = '11.10.0';
const CDN = `https://www.gstatic.com/firebasejs/${V}/`;
const local = ['localhost', '127.0.0.1'].includes(location.hostname);
if (local && new URLSearchParams(location.search).has('emulators')) sessionStorage.setItem('pl_emulators', '1');
export const usingEmulators = local && sessionStorage.getItem('pl_emulators') === '1';

let ready = null;
/* Loads Firebase once. { auth: true } also loads Google sign-in; { cache: true } keeps a copy of the data in
   this browser so the admin opens fast and works through short network drops. */
export function firebase({ auth = false, cache = false } = {}) {
  if (ready) return ready;
  ready = (async () => {
    const [A, F, U] = await Promise.all([
      import(CDN + 'firebase-app.js'),
      import(CDN + 'firebase-firestore.js'),
      auth ? import(CDN + 'firebase-auth.js') : null
    ]);
    const app = A.initializeApp(firebaseConfig);
    const settings = { ignoreUndefinedProperties: true };
    if (cache) settings.localCache = F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() });
    const db = F.initializeFirestore(app, settings);
    let authApi = null;
    if (U) {
      authApi = U.getAuth(app);
      if (usingEmulators) U.connectAuthEmulator(authApi, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    if (usingEmulators) F.connectFirestoreEmulator(db, '127.0.0.1', 8080);
    return { app, db, F, auth: authApi, U };
  })();
  return ready;
}

// The signed-in Google account, once Firebase knows it (null when signed out)
export async function currentUser() {
  const { auth, U } = await firebase({ auth: true });
  return new Promise((resolve) => { const stop = U.onAuthStateChanged(auth, (u) => { stop(); resolve(u); }); });
}
