import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeAx6GdfQ2-qyXjQPZDvS5CAWEayLqKf8",
  authDomain: "prabal-b767d.firebaseapp.com",
  projectId: "prabal-b767d",
  storageBucket: "prabal-b767d.firebasestorage.app",
  messagingSenderId: "149059599078",
  appId: "1:149059599078:web:975248df5bd91931ddd927",
  measurementId: "G-0JWY9YJ9LQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };