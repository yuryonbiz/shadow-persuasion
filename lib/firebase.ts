import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCHnepxzbMr2npDyHNTWEc0ovS2twMo1no",
  authDomain: "shadow-persuasion.firebaseapp.com",
  projectId: "shadow-persuasion",
  storageBucket: "shadow-persuasion.firebasestorage.app",
  messagingSenderId: "894253350418",
  appId: "1:894253350418:web:a11249fb966723f3bca2cb",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
