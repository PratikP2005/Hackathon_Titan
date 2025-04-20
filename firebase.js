  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
  import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    browserLocalPersistence
  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
  import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAeAx6GdfQ2-qyXjQPZDvS5CAWEayLqKf8",
    authDomain: "prabal-b767d.firebaseapp.com",
    databaseURL: "https://prabal-b767d-default-rtdb.firebaseio.com",
    projectId: "prabal-b767d",
    storageBucket: "prabal-b767d.firebasestorage.app",
    messagingSenderId: "149059599078",
    appId: "1:149059599078:web:98af4966ee709274ddd927",
    measurementId: "G-88RKSBNSCX"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);


  export { 
    app, 
    auth, 
    db,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    doc, 
    setDoc
  };