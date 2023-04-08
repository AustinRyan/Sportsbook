import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase";
import { collection, doc, getDoc } from "firebase/firestore";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Add these imports at the top of your SignIn component

  // Modify the signIn function to fetch user data from Firestore
  const signIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user data from Firestore
      const usersRef = collection(db, "users");
      const userDoc = doc(usersRef, user.uid);
      const userDataSnapshot = await getDoc(userDoc);
      const userData = userDataSnapshot.data();

      console.log("User data:", userData);
      // After fetching user data, you can use it in your application
    } catch (error) {
      console.error("Error signing in user:", error);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={signIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
