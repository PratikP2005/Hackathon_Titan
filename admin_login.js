function validateForm() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
  
    // Reset error messages
    emailError.textContent = "";
    passwordError.textContent = "";
  
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
  
    let isValid = true;
  
    if (!gmailRegex.test(email)) {
      emailError.textContent = "Please enter a valid Gmail address (must end with @gmail.com).";
      isValid = false;
    }
  
    if (!passwordRegex.test(password)) {
      passwordError.textContent =
        "Password must be at least 6 characters, include 1 uppercase letter and 1 symbol.";
      isValid = false;
    }
  
    return isValid;
  }
  