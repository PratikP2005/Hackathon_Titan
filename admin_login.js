import { auth } from './firebase-init.js';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'dashboard.html';
  }
});

function validateForm() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  emailError.textContent = "";
  passwordError.textContent = "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;

  let isValid = true;

  if (!emailRegex.test(email)) {
    emailError.textContent = "Please enter a valid email address.";
    isValid = false;
  }

  if (!passwordRegex.test(password)) {
    passwordError.textContent =
      "Password must be at least 6 characters, include 1 uppercase letter and 1 symbol.";
    isValid = false;
  }

  return isValid;
}

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const loginBtn = document.querySelector(".login-button");

  loginBtn.disabled = true;
  loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Login';
    
    if (error.code === 'auth/user-not-found') {
      alert("No user found with this email. Please register first.");
    } else if (error.code === 'auth/wrong-password') {
      alert("Incorrect password. Please try again.");
    } else {
      alert("Login failed: " + error.message);
    }
  }
});

document.querySelector(".forgot-password").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  
  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent. Please check your inbox.");
  } catch (error) {
    console.error("Password reset error:", error);
    alert("Error: " + error.message);
  }
});