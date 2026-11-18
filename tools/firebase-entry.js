// Gera www/vendor/firebase.js (rode: npm run build:firebase)
export { initializeApp } from 'firebase/app';
export {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut, updateProfile, setPersistence, browserLocalPersistence,
} from 'firebase/auth';
export {
  initializeFirestore, doc, getDoc, setDoc, onSnapshot, runTransaction, collection, addDoc, query, where,
  updateDoc, deleteDoc, deleteField, arrayUnion, orderBy, limit,
} from 'firebase/firestore';
