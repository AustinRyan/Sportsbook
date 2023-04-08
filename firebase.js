import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "sportsbook-3e8bf.firebaseapp.com",
  projectId: "sportsbook-3e8bf",
  storageBucket: "sportsbook-3e8bf.appspot.com",
  messagingSenderId: "574739937477",
  appId: "1:574739937477:web:7f8901a969f80811cd98ac",
  measurementId: "G-E46X6Z87P8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// const uiConfig = {
//   signInSuccessUrl: "/", // The URL to redirect to after a successful sign-in
//   signInOptions: [
//     getAuth.GoogleAuthProvider.PROVIDER_ID,
//     getAuth.EmailAuthProvider.PROVIDER_ID,
//     getAuth.PhoneAuthProvider.PROVIDER_ID,
//   ],
//   // Enable email link sign in (optional)
//   signInFlow: "emailLink",
//   signInWithEmailLink: true,
//   callbacks: {
//     signInSuccessWithAuthResult: () => {
//       return false; // Avoid redirects after sign-in
//     },
//   },
// };

// const ui = new firebaseui.auth.AuthUI(getAuth());

// Export app, db, and auth individually
export { app, db, auth };
