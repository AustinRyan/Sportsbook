import React, { useEffect } from "react";
import { auth } from "../firebase";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  PhoneAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/router";

const FirebaseAuth = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const uiConfig = {
        signInSuccessUrl: "/", // The URL to redirect to after a successful sign-in
        signInOptions: [
          GoogleAuthProvider.PROVIDER_ID,
          EmailAuthProvider.PROVIDER_ID,
          PhoneAuthProvider.PROVIDER_ID,
        ],
        // Enable email link sign in (optional)
        signInFlow: "emailLink",
        signInWithEmailLink: true,
        callbacks: {
          signInSuccessWithAuthResult: () => {
            return false; // Avoid redirects after sign-in
          },
        },
      };

      const ui =
        firebaseui.auth.AuthUI.getInstance() ||
        new firebaseui.auth.AuthUI(auth);

      ui.start("#firebaseui-auth-container", uiConfig);
      return () => {
        ui.reset();
      };
    }
  }, []);

  return <div id="firebaseui-auth-container"></div>;
};

export default FirebaseAuth;
