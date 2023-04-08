import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";
import { auth, db } from ".././firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

export default function MyBets() {
  const [activeBets, setActiveBets] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = db.collection("users").doc(user.uid);
        const userDocSnapshot = await userDoc.get();
        if (userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          setActiveBets(userData.bets);
        }
      } else {
        setIsLoggedIn(false);
        setBalance(0);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            My Bets
            {activeBets.map((bet) => (
              <div key={bet.id}>
                <p>{bet}</p>
              </div>
            ))}
          </h2>
        </div>
      </div>
    </div>
  );
}
