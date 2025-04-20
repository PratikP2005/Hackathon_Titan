import { auth, db, onAuthStateChanged } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user || !user.emailVerified) {
        window.location.href = "admin_login.html";
        return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    const currentPage = window.location.pathname.split("/").pop();

    // Role-based access control
    const requiredRole = currentPage.split('-')[0]; // admin-dashboard.html -> admin
    if (userData.role !== requiredRole) {
        window.location.href = `${userData.role}-dashboard.html`;
    }
});