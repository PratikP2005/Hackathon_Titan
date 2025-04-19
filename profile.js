import { auth, db, onAuthStateChanged } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Auth guard
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "admin_login.html";
        return;
    }

    // Load profile data
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Display profile
    document.getElementById('profile-data').innerHTML = `
        <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>Role:</strong> ${userData.role}</p>
        <p><strong>Location:</strong> ${userData.village}, ${userData.district}, ${userData.state}</p>
        <button onclick="auth.signOut()" class="btn-logout">Logout</button>
    `;
});