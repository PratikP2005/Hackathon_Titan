"use strict";

import {
  auth,
  db,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  doc,
  setDoc,
  onAuthStateChanged
} from './firebase.js';

// In registration-auth.js
export function showStep(n) {
  [1, 2, 3].forEach(i => {
    const stepElement = document.getElementById(`step${i}`);
    if (stepElement) {
      stepElement.classList.toggle('hidden', i !== n);
    }
    const prog = document.getElementById(`p${i}`);
    if (prog) {
      prog.classList.toggle('active', i === n);
      prog.classList.toggle('completed', i < n);
    }
  });
}

// Make showStep globally available
window.showStep = showStep;
// Form validation
function validateForm() {
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  const vals = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value,
    state: document.getElementById("state").value,
    district: document.getElementById("district").value,
    village: document.getElementById("village").value.trim(),
    terms: document.getElementById("terms").checked,
    role: document.getElementById("role").value
  };

  let valid = true;

  if (!vals.firstName) {
    document.getElementById('firstName-error').textContent = 'Required';
    valid = false;
  }
  if (!vals.lastName) {
    document.getElementById('lastName-error').textContent = 'Required';
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email)) {
    document.getElementById('email-error').textContent = 'Invalid email';
    valid = false;
  }
  if (!/^[0-9]{10,15}$/.test(vals.phone)) {
    document.getElementById('phone-error').textContent = 'Invalid phone';
    valid = false;
  }
  if (vals.password.length < 8) {
    document.getElementById('password-error').textContent = 'Min 8 chars';
    valid = false;
  }
  if (vals.password !== vals.confirmPassword) {
    document.getElementById('confirmPassword-error').textContent = 'Passwords must match';
    valid = false;
  }
  if (!vals.state) {
    document.getElementById('state-error').textContent = 'Select state';
    valid = false;
  }
  if (!vals.district) {
    document.getElementById('district-error').textContent = 'Select district';
    valid = false;
  }
  if (!vals.village) {
    document.getElementById('village-error').textContent = 'Required';
    valid = false;
  }
  if (!vals.terms) {
    document.getElementById('terms-error').textContent = 'Accept terms';
    valid = false;
  }
  if (!vals.role) {
    document.getElementById('role-error').textContent = 'Select role';
    valid = false;
  }

  return valid ? vals : false;
}

// Resend verification email with cooldown
let lastResendTime = 0;
const COOLDOWN_SECONDS = 60;

async function resendVerificationEmail(user, email) {
  const now = Date.now();
  const resendButton = document.getElementById('resend-email-btn');
  const feedbackElement = document.getElementById('resend-feedback');

  if (now - lastResendTime < COOLDOWN_SECONDS * 1000) {
    feedbackElement.textContent = `Please wait ${COOLDOWN_SECONDS - Math.floor((now - lastResendTime) / 1000)} seconds before resending.`;
    feedbackElement.className = 'error-message';
    return;
  }

  try {
    resendButton.disabled = true;
    resendButton.innerHTML = 'Sending... <span class="spinner"></span>';
    await sendEmailVerification(user);
    lastResendTime = now;
    feedbackElement.textContent = 'Verification email resent successfully!';
    feedbackElement.className = 'success-message';
  } catch (error) {
    console.error("Resend email error:", error);
    feedbackElement.textContent = `Error: ${error.message}`;
    feedbackElement.className = 'error-message';
  } finally {
    resendButton.disabled = false;
    resendButton.innerHTML = 'Resend Email';
  }
}

// Check email verification status
async function checkEmailVerification(user, vals) {
  const checkButton = document.getElementById('check-verification-btn');
  checkButton.disabled = true;
  checkButton.innerHTML = 'Checking... <span class="spinner"></span>';

  try {
    await user.reload(); // Refresh user data
    if (user.emailVerified) {
      // Update Firestore to mark email as verified
      await setDoc(doc(db, "users", user.uid), { isEmailVerified: true }, { merge: true });
      // Set user name for Step 3
      document.getElementById("userNameFinal").textContent = `${vals.firstName} ${vals.lastName}`;
      showStep(3);
    } else {
      document.getElementById('resend-feedback').textContent = 'Email not yet verified. Please check your inbox or resend the verification email.';
      document.getElementById('resend-feedback').className = 'error-message';
    }
  } catch (error) {
    console.error("Verification check error:", error);
    document.getElementById('resend-feedback').textContent = `Error: ${error.message}`;
    document.getElementById('resend-feedback').className = 'error-message';
  } finally {
    checkButton.disabled = false;
    checkButton.innerHTML = 'Check Verification';
  }
}

// Registration handler
const form = document.getElementById("form-step1");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const vals = validateForm();
    if (!vals) return;

    const continueButton = form.querySelector('.btn');
    continueButton.disabled = true;
    continueButton.innerHTML = 'Processing... <span class="spinner"></span>';

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, vals.email, vals.password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, {
        displayName: `${vals.firstName} ${vals.lastName}`
      });

      // Send verification email
      await sendEmailVerification(user);

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: vals.firstName,
        lastName: vals.lastName,
        email: vals.email,
        phone: vals.phone,
        state: vals.state,
        district: vals.district,
        village: vals.village,
        role: vals.role,
        isEmailVerified: false,
        createdAt: new Date()
      });

      // Show verification message
      showStep(2);
      document.getElementById("step2").innerHTML = `
        <div style="text-align: center;">
          <h2>Verify Your Email</h2>
          <p>We've sent a verification email to <strong>${vals.email}</strong>.</p>
          <p>Please check your inbox and click the verification link to complete registration.</p>
          <button id="check-verification-btn" class="btn">Check Verification</button>
          <button id="resend-email-btn" class="btn" style="background-color: var(--secondary);">Resend Email</button>
          <div id="resend-feedback" class=""></div>
          <button onclick="window.location.href='admin_login.html'" class="btn" style="background-color: #6c757d;">Go to Login</button>
        </div>
      `;

      // Add event listeners for resend and check buttons
      document.getElementById('resend-email-btn').addEventListener('click', () => resendVerificationEmail(user, vals.email));
      document.getElementById('check-verification-btn').addEventListener('click', () => checkEmailVerification(user, vals));

    } catch (error) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        document.getElementById("email-error").textContent = "Email already in use";
      } else {
        alert(`Registration error: ${error.message}`);
      }
    } finally {
      continueButton.disabled = false;
      continueButton.innerHTML = 'Continue';
    }
  });
}

// Initialize
showStep(1);