import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "sportsbook-3e8bf.firebaseapp.com",
  projectId: "sportsbook-3e8bf",
  storageBucket: "sportsbook-3e8bf.appspot.com",
  messagingSenderId: "574739937477",
  appId: "1:574739937477:web:7f8901a969f80811cd98ac",
  measurementId: "G-E46X6Z87P8",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth };
