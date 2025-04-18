import { auth, RecaptchaVerifier,db} from './firebase-init.js';
  import {
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
  } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  
  let confirmationResult = null;
  let recaptchaVerifier = null;
  
  // Initialize reCAPTCHA
// Initialize reCAPTCHA with visible widget (for testing)
const initRecaptcha = () => {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal', // Visible widget
      callback: () => console.log('reCAPTCHA solved'),
      'expired-callback': () => console.log('reCAPTCHA expired')
    });
  };
  // Handle step navigation
  const showStep = (n) => {
    [1, 2, 3].forEach(i => {
      document.getElementById(`step${i}`).classList.toggle('hidden', i !== n);
      const p = document.getElementById(`p${i}`);
      p.classList.toggle('active', i === n);
      p.classList.toggle('completed', i < n);
    });
  };
  
  // Step 1: Email/Password Registration
  document.getElementById('form-step1').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const state = document.getElementById('state').value;
    const district = document.getElementById('district').value;
    const village = document.getElementById('village').value.trim();
  
    try {
      // Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
  
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        phone,
        state,
        district,
        village,
        createdAt: new Date(),
        role: 'user'
      });
  
      // Prepare for verification step
      document.getElementById('displayPhone').textContent = phone;
      document.getElementById('displayEmail').textContent = email;
      document.getElementById('userNameFinal').textContent = `${firstName} ${lastName}`;
      document.getElementById('phone-number').value = phone;
  
      // Initialize reCAPTCHA for phone auth
      initRecaptcha();
      
      showStep(2);
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}`);
    }
  });
  
  // Handle auth method toggle
  document.querySelectorAll('input[name="authMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      ['phone', 'email', 'google'].forEach(method => {
        document.getElementById(`otp-${method}`).classList.toggle('hidden', radio.value !== method);
      });
    });
  });
  
  // Phone OTP Verification
  document.getElementById('send-otp').addEventListener('click', async () => {
    const phoneNumber = document.getElementById('phone-number').value;
    const sendOtpBtn = document.getElementById('send-otp');
    
    // Validate phone format
    if (!phoneNumber.startsWith('+')) {
      alert('Please include country code (e.g., +91XXXXXXXXXX)');
      return;
    }
  
    if (!phoneNumber || phoneNumber.length < 12) {
      alert('Please enter a valid phone number');
      return;
    }
  
    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = '<span class="spinner"></span> Sending...';
  
    try {
      // Ensure reCAPTCHA is initialized
      if (!recaptchaVerifier) {
        initRecaptcha();
      }
      
      confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      sendOtpBtn.innerHTML = 'OTP Sent!';
      document.getElementById('verifyPhoneOtp').disabled = false;
      
      // For development: Log verification ID
      console.log('Verification ID:', confirmationResult.verificationId);
    } catch (error) {
      console.error('OTP send error:', error);
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = 'Send OTP';
      
      // Handle specific errors
      let errorMessage = 'Failed to send OTP: ';
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage += 'Invalid phone number format';
          break;
        case 'auth/too-many-requests':
          errorMessage += 'Too many attempts. Please try later';
          break;
        default:
          errorMessage += error.message;
      }
      alert(errorMessage);
    }
  });
  
  document.getElementById('verifyPhoneOtp').addEventListener('click', async () => {
    const otp = document.getElementById('verify-code').value.trim();
    const verifyBtn = document.getElementById('verifyPhoneOtp');
    
    if (!otp || otp.length !== 6) {
      alert('Please enter a 6-digit OTP');
      return;
    }
  
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span class="spinner"></span> Verifying...';
  
    try {
      await confirmationResult.confirm(otp);
      showStep(3);
    } catch (error) {
      console.error('OTP verification error:', error);
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = 'Verify OTP';
      document.getElementById('otp-error').textContent = 'Invalid OTP. Please try again.';
    }
  });
  
  // Google Sign-In
  document.getElementById('googleSignIn').addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    const googleBtn = document.getElementById('googleSignIn');
    
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<span class="spinner"></span> Signing in...';
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user is new or existing
      if (result._tokenResponse.isNewUser) {
        // Store user data in Firestore for new users
        await setDoc(doc(db, 'users', user.uid), {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email,
          phone: user.phoneNumber || '',
          createdAt: new Date(),
          role: 'user'
        });
      }
      
      showStep(3);
    } catch (error) {
      console.error('Google sign-in error:', error);
      googleBtn.disabled = false;
      googleBtn.innerHTML = 'Sign in with Google';
      alert(`Google sign-in failed: ${error.message}`);
    }
  });
  
  // Email OTP (simulated - for demo only)
  document.getElementById('send-email-otp').addEventListener('click', function() {
    this.disabled = true;
    this.innerHTML = '<span class="spinner"></span> Sending...';
    
    setTimeout(() => {
      this.innerHTML = 'OTP Sent!';
      document.getElementById('verifyEmailOtp').disabled = false;
      console.log('Demo Email OTP: 654321');
    }, 1500);
  });
  
  document.getElementById('verifyEmailOtp').addEventListener('click', function() {
    const otp = document.getElementById('email-otp').value.trim();
    
    if (otp === '654321') {
      showStep(3);
    } else {
      document.getElementById('email-otp-error').textContent = 'Invalid OTP. Please try again.';
    }
  });
  
  // Initialize
  showStep(1);