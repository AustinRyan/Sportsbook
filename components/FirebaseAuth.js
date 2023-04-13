import React, { useEffect } from "react";
import { auth } from ".././firebase";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import firebase from "firebase/app";
import "firebase/auth";
import { useRouter } from "next/router";

const FirebaseAuth = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const uiConfig = {
        signInOptions: [
          // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        ],
        // Change the sign in flow to "redirect"
        signInFlow: "popup",
        credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
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
