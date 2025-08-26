// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuLqtxta1hGWwcktOZSDlGoDWiAzAdFQk",
    authDomain: "wingo-prediction-dc698.firebaseapp.com",
    databaseURL: "https://wingo-prediction-dc698-default-rtdb.firebaseio.com",
    projectId: "wingo-prediction-dc698",
    storageBucket: "wingo-prediction-dc698.firebasestorage.app",
    messagingSenderId: "441563686660",
    appId: "1:441563686660:web:3614151b8e2f258a301251"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Export Firebase services
export { database, ref, set, onValue, update, auth, signInWithEmailAndPassword, signOut };
