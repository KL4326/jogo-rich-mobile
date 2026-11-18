// ===== Nuvem: contas, save online, amigos e ranking ao vivo (Firebase) =====
import { FIREBASE_CONFIG } from './config.js';

export const enabled = !!FIREBASE_CONFIG.apiKey;
let F, auth, db;

export async function init() {
  F = await import('../vendor/firebase.js');
  const app = F.initializeApp(FIREBASE_CONFIG);
  auth = F.getAuth(app);
  await F.setPersistence(auth, F.browserLocalPersistence).catch(() => {});
  db = F.initializeFirestore(app, { ignoreUndefinedProperties: true });
}

// Resolve com o usuário atual (ou null) assim que o Firebase souber
export function currentUser() {
  return new Promise((res) => { const off = F.onAuthStateChanged(auth, (u) => { off(); res(u); }); });
}

const ERR = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-password': 'Digite a senha.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Tente entrar.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'Não existe conta com esse e-mail.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem internet. Verifique sua conexão.',
  'permission-denied': 'O servidor recusou o acesso (regras do Firestore).',
  unavailable: 'Servidor indisponível. Verifique sua internet.',
};
export const errMsg = (e) => ERR[e && e.code] || (e && e.message) || 'Erro desconhecido.';

export async function signIn(email, pw) {
  const c = await F.signInWithEmailAndPassword(auth, email.trim(), pw);
  return c.user;
}
export async function signUp(email, pw, name) {
  const c = await F.createUserWithEmailAndPassword(auth, email.trim(), pw);
  await F.updateProfile(c.user, { displayName: name }).catch(() => {});
  return c.user;
}
export const resetPassword = (email) => F.sendPasswordResetEmail(auth, email.trim());
export const logout = () => F.signOut(auth);

// Tag única tipo KEVEN#4821, usada para adicionar amigos
function tagBase(name) {
  const b = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  return b || 'JOGADOR';
}
export async function reserveTag(uid, name) {
  const base = tagBase(name);
  for (let i = 0; i < 10; i++) {
    const tag = `${base}#${String(Math.floor(1000 + Math.random() * 9000))}`;
    const ref = F.doc(db, 'tags', tag);
    try {
      await F.runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists()) throw new Error('taken');
        tx.set(ref, { uid, created: Date.now() });
      });
      return tag;
    } catch (e) { if (e.message !== 'taken') throw e; }
  }
  throw new Error('Não foi possível gerar sua tag.');
}
export function normalizeTag(t) {
  const m = String(t).toUpperCase().replace(/\s/g, '').match(/^([A-Z0-9]+)#?(\d{4})$/);
  return m ? `${m[1]}#${m[2]}` : null;
}
export async function findTag(tag) {
  const snap = await F.getDoc(F.doc(db, 'tags', tag));
  return snap.exists() ? snap.data().uid : null;
}

// Save
export async function loadSave(uid) {
  const snap = await F.getDoc(F.doc(db, 'saves', uid));
  if (!snap.exists()) return null;
  try { return JSON.parse(snap.data().json); } catch (e) { return null; }
}
export async function pushSave(uid, s, profile) {
  await Promise.all([
    F.setDoc(F.doc(db, 'saves', uid), { json: JSON.stringify(s), last: s.last }),
    F.setDoc(F.doc(db, 'profiles', uid), profile),
  ]);
}
export async function getProfile(uid) {
  const snap = await F.getDoc(F.doc(db, 'profiles', uid));
  return snap.exists() ? snap.data() : null;
}

// Acompanha ao vivo os perfis dos amigos
const watchers = new Map();
export function watchFriends(uids, cb) {
  for (const [uid, off] of watchers) if (!uids.includes(uid)) { off(); watchers.delete(uid); }
  for (const uid of uids) {
    if (watchers.has(uid)) continue;
    watchers.set(uid, F.onSnapshot(F.doc(db, 'profiles', uid), (snap) => cb(uid, snap.exists() ? snap.data() : null), () => cb(uid, null)));
  }
}

export const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'unavailable' })), ms))]);

// ---------- Pix entre amigos ----------
export async function sendPix(from, fromName, to, amount, desc = '') {
  await F.addDoc(F.collection(db, 'transfers'), { from, fromName, to, amount, desc: String(desc || '').slice(0, 50), created: Date.now(), claimed: false });
}
// Escuta Pix recebidos ainda não resgatados
export function watchIncoming(uid, cb) {
  const q = F.query(F.collection(db, 'transfers'), F.where('to', '==', uid), F.where('claimed', '==', false));
  return F.onSnapshot(q, (snap) => snap.docs.forEach((d) => cb(d.id, d.data())), () => {});
}
// Resgata um Pix (transação: impede receber duas vezes)
export async function claimPix(id) {
  const ref = F.doc(db, 'transfers', id);
  return F.runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists() || snap.data().claimed) throw new Error('já resgatado');
    tx.update(ref, { claimed: true, claimedAt: Date.now() });
    return snap.data();
  });
}
