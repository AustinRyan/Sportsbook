import Head from "next/head";
import React, { useState, useEffect } from "react";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import BannerCarousel from "@/components/BannerCarousel";
import LandingMainContent from "@/components/LandingMainContent";
import ReferAFriend from "@/components/ReferAFriend";
import BetSlip from "@/components/BetSlip";
import { auth, db } from "../firebase";
import "firebase/auth";
import "firebase/firestore";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";

export default function Home() {
  /*   TODO: 
          Move all API calls into their respective getServersideProps functions
          or getStaticProps functions.

          Doing this will improve performance and help with SEO.
          Also, is considered best practice for Next.js apps
  */

  const [isPopularExpanded, setIsPopularExpanded] = useState(true);
  const togglePopularExpanded = () => {
    setIsPopularExpanded(!isPopularExpanded);
  };
  const [isAllSportsExpanded, setIsAllSportsExpanded] = useState(true);
  const toggleAllSportsExpanded = () => {
    setIsAllSportsExpanded(!isAllSportsExpanded);
  };

  const [sportToQuery, setSportToQuery] = useState("baseball_mlb");
  const [isFuturesURL, setIsFuturesURL] = useState(false);
  const handleSportToQuery = (sport) => {
    if (
      sport.includes("World Series") ||
      sport.includes("Champ") ||
      sport.includes("super")
    ) {
      setIsFuturesURL(true);
    } else {
      setIsFuturesURL(false);
    }
    setSportToQuery(sport);
  };

  const [selectedBets, setSelectedBets] = useState([]);
  const [isParlayValid, setIsParlayValid] = useState(true);
  const [balance, setBalance] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isMobileBetSlipOpen, setIsMobileBetSlipOpen] = useState(false);
  const [isBetSlipExpanded, setIsBetSlipExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log(user);
        setIsLoggedIn(true);
        setDisplayName(user.email); // set display name
        const userDoc = db.collection("users").doc(user.uid);
        const userDocSnapshot = await userDoc.get();
        if (userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          console.log(userData);
          setBalance(userData.balance);
        }
      } else {
        setIsLoggedIn(false);
        setBalance(0);
        setDisplayName(""); // clear display name
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  const toggleMobileBetSlip = () => {
    setIsMobileBetSlipOpen(!isMobileBetSlipOpen);
  };

  const handleMoneylineSelection = (team, odds, homeTeam, awayTeam) => {
    const bet = {
      type: "moneyline",
      team,
      odds,
      homeTeam,
      awayTeam,
      amount: 0,
    };

    // Check if the opposite moneyline is already in selectedBets
    const oppositeMoneylineIndex = selectedBets.findIndex(
      (b) =>
        b.type === bet.type &&
        b.team !== bet.team &&
        b.homeTeam === bet.homeTeam &&
        b.awayTeam === bet.awayTeam
    );

    // If the opposite moneyline is already in selectedBets, do nothing

    const betIndex = selectedBets.findIndex(
      (b) =>
        b.type === bet.type &&
        b.team === bet.team &&
        b.homeTeam === bet.homeTeam &&
        b.awayTeam === bet.awayTeam
    );

    if (betIndex === -1) {
      setSelectedBets([...selectedBets, bet]);
    } else {
      const newSelectedBets = [...selectedBets];
      newSelectedBets.splice(betIndex, 1);
      setSelectedBets(newSelectedBets);
    }

    console.log(selectedBets);
  };

  const handleOverUnderSelection = (data) => {
    const { outcome, homeTeam, awayTeam, index } = data;

    const bet = {
      type: "over_under",
      outcome,
      homeTeam,
      awayTeam,
      amount: 0,
    };

    const betIndex = selectedBets.findIndex(
      (b) =>
        b.type === bet.type &&
        b.outcome.name === bet.outcome.name &&
        b.outcome.point === bet.outcome.point &&
        b.homeTeam === bet.homeTeam &&
        b.awayTeam === bet.awayTeam
    );

    if (betIndex === -1) {
      setSelectedBets([...selectedBets, bet]);
    } else {
      const newSelectedBets = [...selectedBets];
      newSelectedBets.splice(betIndex, 1);
      setSelectedBets(newSelectedBets);
    }

    console.log(selectedBets);
  };
  const checkParlayValid = (bets) => {
    const moneylineBets = bets.filter((bet) => bet.type === "moneyline");
    const overUnderBets = bets.filter((bet) => bet.type === "over_under");

    const gameCounts = {};

    for (const bet of moneylineBets) {
      const gameKey = `moneyline-${bet.homeTeam}-${bet.awayTeam}`;
      gameCounts[gameKey] = (gameCounts[gameKey] || 0) + 1;

      if (gameCounts[gameKey] > 1) {
        return false;
      }
    }

    for (const bet of overUnderBets) {
      const gameKey = `overUnder-${bet.homeTeam}-${bet.awayTeam}`;
      gameCounts[gameKey] = (gameCounts[gameKey] || 0) + 1;

      if (gameCounts[gameKey] > 1) {
        return false;
      }
    }

    return true;
  };
  // In the parent component
  const updateBetAmount = (index, amount) => {
    const updatedBets = [...selectedBets];
    updatedBets[index].amount = parseFloat(amount);
    setSelectedBets(updatedBets);
  };

  useEffect(() => {
    setIsParlayValid(checkParlayValid(selectedBets));
  }, [selectedBets]);

  return (
    <>
      <Head>
        <title>Fake Sportsbook Application</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav
        balance={balance}
        displayName={displayName}
        isLoggedIn={isLoggedIn}
      />
      <div className="flex flex-col lg:flex-row h-screen">
        <SideNav
          isPopularExpanded={isPopularExpanded}
          togglePopularExpanded={togglePopularExpanded}
          isAllSportsExpanded={isAllSportsExpanded}
          toggleAllSportsExpanded={toggleAllSportsExpanded}
          handleSportToQuery={handleSportToQuery}
          className="hidden lg:block" // Hide SideNav on small screens
        />
        {/* Main Content */}
        <div className="flex-grow  bg-black">
          {/* Insert promo banners here */}
          <div className="bg-black h-1/4 p-1">
            <BannerCarousel />
          </div>
          <ReferAFriend />
          <div className=" ">
            <LandingMainContent
              sportToQuery={sportToQuery}
              isFuturesURL={isFuturesURL}
              handleMoneylineSelection={handleMoneylineSelection}
              handleOverUnderSelection={handleOverUnderSelection}
            />
          </div>
        </div>
        <div className="bg-black lg:w-1/4 relative">
          {/* Add arrow button for mobile devices */}
          <button
            className="absolute top-1/2 transform -translate-y-1/2 left-0 lg:hidden p-2 bg-black text-white z-10"
            onClick={() => setIsBetSlipExpanded(!isBetSlipExpanded)}
          >
            {isBetSlipExpanded ? (
              <AiOutlineLeft size={24} />
            ) : (
              <AiOutlineRight size={24} />
            )}
          </button>
          {/* Show BetSlip on small screens when isBetSlipExpanded is true */}
          {(isBetSlipExpanded || !isMobile) && (
            <BetSlip
              selectedBets={selectedBets}
              isParlayValid={isParlayValid}
              updateBetAmount={updateBetAmount}
              balance={balance}
              setBalance={setBalance}
            />
          )}
        </div>
      </div>
    </>
  );
}
