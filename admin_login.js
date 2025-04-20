import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { auth } from "./firebase.js";

onAuthStateChanged(auth, async (user) => {
  if (user && user.emailVerified) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      // Role-based redirection
      switch(userData.role) {
          case 'admin':
              window.location.href = "admin-dashboard.html";
              break;
          case 'mentor':
              window.location.href = "mentordashbord.html";
              break;
          default:
              window.location.href = "userdashboard.html";
      }
  }
});
// Form validation and login
window.validateForm = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const roleError = document.getElementById("role-error");

  // Reset errors
  emailError.textContent = "";
  passwordError.textContent = "";
  roleError.textContent = "";

  let isValid = true;

  // Basic validation
  if (!email) {
    emailError.textContent = "Email is required";
    isValid = false;
  }

  if (!password) {
    passwordError.textContent = "Password is required";
    isValid = false;
  }

  if (!role) {
    roleError.textContent = "Please select a role";
    isValid = false;
  }

  if (!isValid) return false;

  // Firebase login
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        window.location.href = "index.html";
      } else {
        alert("Please verify your email first. Check your inbox for the verification link.");
        auth.signOut(); // Optional: Sign out unverified users
      }
    })
    .catch((error) => {
      if (error.code === 'auth/invalid-credential') {
        alert("Invalid email or password");
      } else {
        alert("Login error: " + error.message);
      }
    });

  return false; // Prevent form submission
};