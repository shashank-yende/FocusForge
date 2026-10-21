// Your web app's Firebase configuration
// Use a placeholder or load from a secure config
const firebaseConfig = {
  apiKey: window.env?.FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: "focusforge-ce3c2.firebaseapp.com",
  projectId: "focusforge-ce3c2",
  storageBucket: "focusforge-ce3c2.firebasestorage.app",
  messagingSenderId: "188880478250",
  appId: "1:188880478250:web:318ba89d0148db879de353",
  measurementId: "G-HEGLW7Y2CC"
};

// Initialize Firebase using the compat method
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Enable Offline Persistence
db.enablePersistence().catch(err => console.log("Offline persistence error:", err.code));

googleProvider.setCustomParameters({ prompt: 'select_account' });

// XSS Sanitization helper
function escapeHTML(str) {
    if (typeof str !== 'string')
