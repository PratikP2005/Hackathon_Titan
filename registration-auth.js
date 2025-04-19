"use strict";

import { 
  auth,
  db,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  doc,
  setDoc
} from './firebase.js';

// Step management
function showStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`step${i}`).classList.toggle('hidden', i !== n);
    const prog = document.getElementById(`p${i}`);
    if (prog) {
      prog.classList.toggle('active', i === n);
      prog.classList.toggle('completed', i < n);
    }
  });
}

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

  // Validation checks
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

// Registration handler
// ... (existing imports)

document.getElementById("form-step1").addEventListener("submit", async (e) => {
  e.preventDefault();

  const vals = validateForm();
  if (!vals) return;

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
      isEmailVerified: false, // Mark as unverified until email is confirmed
      createdAt: new Date()
    });


    // Show verification message
    showStep(2);
    document.getElementById("step2").innerHTML = `
      <div style="text-align: center;">
        <h2>Verify Your Email</h2>
        <p>We've sent a verification email to <strong>${vals.email}</strong>.</p>
        <p>Please check your inbox and click the verification link to complete registration.</p>
        <button onclick="window.location.href='admin_login.html'" class="btn">Go to Login</button>
      </div>
    `;
    window.location.href = "admin_login.html";
    
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 'auth/email-already-in-use') {
      document.getElementById("email-error").textContent = "Email already in use";
    } else {
      alert(`Registration error: ${error.message}`);
    }
  }
});
// Initialize districts dropdown
document.getElementById("state").addEventListener("change", function() {
  const map = {
    rajasthan: ['Ajmer','Alwar','Bikaner','Jaipur','Jodhpur','Udaipur'],
    bihar: ['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Sasaram'],
    up: ['Lucknow','Kanpur','Agra','Varanasi','Meerut','Allahabad','Bareilly'],
    mp: ['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Dewas'],
    jharkhand: ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Hazaribagh'],
    odisha: ['Bhubaneswar','Cuttack','Rourkela','Puri','Sambalpur'],
    wb: ['Kolkata','Howrah','Darjeeling','Siliguri','Asansol','Durgapur'],
    mh: ['Nagpur','Aurangabad','Satara','Kolhapur','Thane','Palghar','Raigad']
  };

  const state = this.value;
  const sel = document.getElementById("district");
  sel.innerHTML = '<option value="">Select your district</option>';

  if (state && map[state]) {
    map[state].forEach(district => {
      const option = document.createElement('option');
      option.value = district.toLowerCase();
      option.textContent = district;
      sel.appendChild(option);
    });
  }
});

// Initialize
showStep(1);
