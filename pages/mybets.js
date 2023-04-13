import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import BetCard from "@/components/BetCard";
import Link from "next/link";
import { useRouter } from "next/router";

const MyBets = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const [bets, setBets] = useState({
    singlesPendingBets: [],
    parlayPendingBets: [],
    betsLost: [],
    betsWon: [],
  });
  const [activeTab, setActiveTab] = useState("pending");
  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleCheckBets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkBets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (data.success) {
        router.reload(); // Refresh the page to display updated bet status
      } else {
        console.error("Error checking bets:", data.error);
      }
    } catch (error) {
      console.error("Error checking bets:", error);
    } finally {
      setLoading(false);
      setShowModal(true); // Show the modal
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = db.collection("users").doc(user.uid);
        const userDocSnapshot = await userDoc.get();
        if (userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          setBets({
            singlesPendingBets: userData.singlesPendingBets || [],
            parlayPendingBets: userData.parlayPendingBets || [],
            betsLost: userData.betsLost || [],
            betsWon: userData.betsWon || [],
          });
        }
      } else {
        setUserId(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const renderTabContent = () => {
    let betsToDisplay;

    switch (activeTab) {
      case "pending":
        betsToDisplay = [...bets.singlesPendingBets, ...bets.parlayPendingBets];
        break;
      case "lost":
        betsToDisplay = bets.betsLost;
        break;
      case "won":
        betsToDisplay = bets.betsWon;
        break;
      default:
        betsToDisplay = [];
    }

    return betsToDisplay.map((bet, index) => <BetCard key={index} bet={bet} />);
  };

  const Modal = () => {
    return (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-6 mx-2 md:mx-auto w-full max-w-lg rounded-md shadow-lg z-20">
            {" "}
            {/* Added z-20 */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">Game Processed</h3>
              <p className="mb-6">The game has been processed successfully.</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md inline-block hover:bg-blue-600 transition-colors duration-150 ease-in-out"
                onClick={handleModalClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {showModal && <Modal />}
      <div className="flex items-center mb-4">
        <Link href="/">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md inline-block hover:bg-blue-600 transition-colors duration-150 ease-in-out">
            Back to Home
          </button>
        </Link>
        <h2 className="text-2xl font-bold mx-auto ">My Bets</h2>
      </div>
      <div className="flex justify-center mb-6 ml-20">
        <button
          className={`px-6 py-2 mx-2 ${
            activeTab === "pending"
              ? "bg-green-500 text-white"
              : "text-green-500 bg-gray-200"
          } font-bold border-2 border-green-500 focus:outline-none transition-colors duration-150 ease-in-out`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`px-6 py-2 mx-2 ${
            activeTab === "lost"
              ? "bg-red-500 text-white"
              : "text-red-500 bg-gray-200"
          } font-bold border-2 border-red-500 focus:outline-none transition-colors duration-150 ease-in-out`}
          onClick={() => setActiveTab("lost")}
        >
          Lost
        </button>
        <button
          className={`px-6 py-2 mx-2 ${
            activeTab === "won"
              ? "bg-blue-500 text-white"
              : "text-blue-500 bg-gray-200"
          } font-bold border-2 border-blue-500 focus:outline-none transition-colors duration-150 ease-in-out`}
          onClick={() => setActiveTab("won")}
        >
          Won
        </button>
      </div>
      <div className="bg-white p-4 rounded-md shadow-md">
        {renderTabContent().length === 0 ? (
          <p className="text-center text-gray-500">No bets to display</p>
        ) : (
          renderTabContent()
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-500 py-2">
          {" "}
          Bets are processed every 4 hours, or you can manually process them by
          clicking the button below.
        </p>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md inline-block hover:bg-yellow-600 transition-colors duration-150 ease-in-out"
          onClick={handleCheckBets}
          disabled={loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-t-2 border-yellow-200 border-solid rounded-full animate-spin"></div>
          ) : (
            "Game finished? Click here to process bets"
          )}
        </button>
      </div>
    </div>
  );
};

export default MyBets;
