import { auth, db, onAuthStateChanged } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "admin_login.html";
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            console.log("No such user document!");
            return;
        }

        const userData = userDoc.data();
        document.getElementById('profile-data').innerHTML = `
            <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Role:</strong> ${userData.role}</p>
            <p><strong>Location:</strong> ${userData.village}, ${userData.district}, ${userData.state}</p>
            <button onclick="auth.signOut()" class="btn-logout">Logout</button>
        `;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});
