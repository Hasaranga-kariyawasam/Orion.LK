import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBQ5y801oqhnR21RcKuBJv3_WtpqDPo5DU',
  authDomain: 'drivelink-58aa1.firebaseapp.com',
  projectId: 'drivelink-58aa1',
  storageBucket: 'drivelink-58aa1.firebasestorage.app',
  messagingSenderId: '1063810547437',
  appId: '1:1063810547437:web:e06af33d5815b4a1b416e4',
  measurementId: 'G-EY2JDTEVT9',
};

// Prevent re-initialization in HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// --- Auth helpers ---

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential;
};

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);

export { onAuthStateChanged, updatePassword, updateProfile };
export type { User };
