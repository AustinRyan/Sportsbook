import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";
import { auth, db } from "../firebase";
import "firebase/auth";
import "firebase/firestore";

import Link from "next/link";
const TopNav = ({ balance, isLoggedIn, displayName }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [balance, setBalance] = useState();
  // const [displayName, setDisplayName] = useState("");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const handleSignOut = async () => {
    const confirmSignOut = window.confirm("Are you sure you want to sign out?");

    if (confirmSignOut) {
      try {
        await auth.signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  return (
    <section className="bg-primary h-20 w-screen">
      <div className=" mx-auto h-full flex items-center px-4">
        <Image
          src="/logo2.svg"
          width={100}
          height={100}
          alt="company logo"
          className="w-max h-28"
        />
        <div className="flex-grow flex items-center justify-between ml-4">
          <ul className="hidden md:flex text-lg text-gray-300">
            <li className="mx-4">
              <a href="">Home</a>
            </li>
            <li className="mx-4">
              <Link href="/MyBets">My Bets</Link>
            </li>

            <li className="mx-4">
              <Link href="How-To-Bet">How To Bet</Link>
            </li>
          </ul>
          {isLoggedIn ? (
            <div className="flex items-center">
              <span className="mr-16 text-white ">
                {displayName ? `Welcome, ${displayName}!` : "none"}
              </span>
              <span className="mr-10 text-white">Balance: {balance}</span>
              <button
                className="hidden md:block bg-green-500 text-black rounded-md p-2 w-32"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/signup">
              <button className="hidden md:block bg-green-500 text-black rounded-md p-2 w-32">
                Sign In
              </button>
            </Link>
          )}
          <button className="md:hidden ml-4 z-10" onClick={toggleMobileMenu}>
            <GiHamburgerMenu size={24} />
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 bg-slate-500 text-gray-300 text-lg w-full">
            {/* Add mobile menu items here */}
            <ul className="px-4 py-2">
              <li className="py-2">
                <a href="">Home</a>
              </li>
              <li className="py-2">
                <a href="">My Bets</a>
              </li>
              <li className="py-2">
                <a href="">Live In-Game</a>
              </li>
              <li className="py-2">
                <a href="">Promos</a>
              </li>
              <li className="py-2">
                <a href="">How To Bet</a>
              </li>
              <li className="py-2">
                <button className="bg-green-500 text-black rounded-md p-2 w-32">
                  Sign In
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopNav;
