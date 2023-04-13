// import React, { useEffect } from "react";
// import { auth, db } from ".././firebase";
// import "firebase/auth";
// import "firebase/firestore";

// import dynamic from "next/dynamic";
// import { useRouter } from "next/router";
// const SignUp = () => {
//   const router = useRouter();
//   // Listen for user authentication state changes
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user && user.metadata.creationTime === user.metadata.lastSignInTime) {
//         // New user, set initial values
//         const initialAmount = 1000;
//         const usersRef = db.collection("users");
//         const userDoc = usersRef.doc(user.uid);
//         await userDoc.set({
//           email: user.email,
//           balance: initialAmount,
//           bets: [],
//         });
//         console.log("User registered:", user);
//         // After successful registration, redirect to another page or show a message
//         router.push("/");
//       }
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, [router]);

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign up for an account
//           </h2>
//         </div>
//         <DynamicFirebaseAuth />
//       </div>
//     </div>
//   );
// };

// // FirebaseAuth component
// const DynamicFirebaseAuth = dynamic(() => import("./FirebaseAuth"), {
//   ssr: false,
// });

// export default SignUp;
