import React, { useState } from "react";
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";

const TopNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <section className="bg-primary h-20 w-screen">
      <div className=" mx-auto h-full flex items-center px-4">
        <Image
          src="/vercel.svg"
          width={100}
          height={100}
          alt="company logo"
          className="w-28 h-20"
        />
        <div className="flex-grow flex items-center justify-between ml-4">
          <ul className="hidden md:flex text-lg text-gray-300">
            <li className="mx-4">
              <a href="">Home</a>
            </li>
            <li className="mx-4">
              <a href="">My Bets</a>
            </li>
            <li className="mx-4">
              <a href="">Live In-Game</a>
            </li>
            <li className="mx-4">
              <a href="">Promos</a>
            </li>
            <li className="mx-4">
              <a href="">How To Bet</a>
            </li>
          </ul>
          <button className="hidden md:block bg-green-500 text-black rounded-md p-2 w-32">
            Sign In
          </button>
          <button className="md:hidden ml-4" onClick={toggleMobileMenu}>
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
