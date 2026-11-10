import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  setPersistence,
  inMemoryPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Firestore
} from 'firebase/firestore';

// MealMate Firebase configuration for DBS Global University (mealmate-d6e7e)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDz-O0dMJ2AsU9hu4MyzTlW3OWbCunLR74',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mealmate-d6e7e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mealmate-d6e7e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mealmate-d6e7e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '126428995863',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:126428995863:web:113c10ca2baf98c9229752',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-LTFLJ990HW'
};

// Check if user previously chose to remember credentials on this device
const isRememberedSession = typeof window !== 'undefined' && localStorage.getItem('mm_remember_credentials') === 'true';

// Purge previously stored sessions ONLY if user chose NOT to remember
if (!isRememberedSession) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('firebase:authUser') || key.startsWith('mm_user_auth'))) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    // Ignore in restricted environments
  }
}

let app: any = null;
let auth: any = null;
let db: any = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  const initialPersistence = isRememberedSession ? browserLocalPersistence : inMemoryPersistence;

  try {
    auth = initializeAuth(app, {
      persistence: initialPersistence
    });
  } catch (authErr) {
    auth = getAuth(app);
    setPersistence(auth, initialPersistence).catch((err) => {
      console.warn('Configuring persistence mode:', err);
    });
  }

  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

/**
 * Configure persistence mode based on remember credentials choice
 * If rememberMe is true: uses browserLocalPersistence
 * If rememberMe is false: strictly uses inMemoryPersistence (session dies on page reload)
 */
export async function configurePersistence(rememberMe = false) {
  if (auth) {
    try {
      const mode = rememberMe ? browserLocalPersistence : inMemoryPersistence;
      await setPersistence(auth, mode);
    } catch (e) {
      console.warn('Could not set persistence mode:', e);
    }
  }
}

/**
 * Configure in-memory persistence before authentication action (legacy helper)
 */
export async function ensureInMemoryPersistence() {
  await configurePersistence(false);
}

/**
 * Firebase Auth sign-in with persistence mode
 */
export async function firebaseSignIn(email: string, pass: string, rememberMe = false) {
  await configurePersistence(rememberMe);
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
}

/**
 * Firebase Auth sign-up with persistence mode
 */
export async function firebaseSignUp(email: string, pass: string, displayName?: string, rememberMe = false) {
  await configurePersistence(rememberMe);
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (e) {
      // Non-critical profile update
    }
  }
  return cred;
}

/**
 * Firebase Auth password reset
 */
export async function firebaseResetPassword(email: string) {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

/**
 * Firebase Auth sign-out
 */
export async function firebaseSignOut() {
  if (!auth) return;
  return signOut(auth);
}

/**
 * Firebase Auth Google popup sign-in with persistence mode
 */
export async function firebaseGoogleSignIn(rememberMe = false) {
  await configurePersistence(rememberMe);
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

/**
 * Create reCAPTCHA verifier for real phone SMS OTP
 */
export function createRecaptchaVerifier(containerId: string, isVisible = false) {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
  return new RecaptchaVerifier(auth, containerId, {
    size: isVisible ? 'normal' : 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired');
    }
  });
}

/**
 * Send real SMS OTP to phone number via Firebase Phone Authentication
 */
export async function firebaseSendPhoneOtp(phoneNumber: string, appVerifier: any, rememberMe = false): Promise<ConfirmationResult> {
  await configurePersistence(rememberMe);
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

export {
  app,
  auth,
  db,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  inMemoryPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
};
export type { FirebaseUser, ConfirmationResult };
