import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Modify the auth state listener
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
                window.location.href = "mentor-dashboard.html";
                break;
            default:
                window.location.href = "user-dashboard.html";
        }
    }
});

// Update validateForm function
window.validateForm = function() {
    // ... existing validation code ...
    
    if (isValid) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Redirection handled by auth state listener
            })
            .catch((error) => {
                // ... existing error handling ...
            });
    }
    return false;
};