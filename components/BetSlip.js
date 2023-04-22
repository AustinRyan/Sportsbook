import React, { useState, useEffect } from "react";
import { auth, db } from ".././firebase";
import firebase from "firebase/app";
import Modal from "./Modal";

const BetSlip = ({
  selectedBets,
  removeBet,
  isParlayValid,
  updateBetAmount,
  balance,
  setBalance,
}) => {
  const [betType, setBetType] = useState("singles");
  const [betAmount, setBetAmount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [success, setSuccess] = useState(false);
  // const [balance, setBalance] = useState();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = db.collection("users").doc(user.uid);
        const userDocSnapshot = await userDoc.get();
        if (userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          setBalance(userData.balance);
        }
      } else {
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);
  const formatOdds = (odds) => {
    return odds > 0 ? `+${odds}` : odds;
  };
  const placeBet = async () => {
    try {
      if (betType === "singles") {
        await placeSinglesBets();
      } else if (betType === "parlays") {
        await placeParlayBet();
      }
      setModalMessage("Bet placed successfully.");
      setSuccess(true);
      setBalance((prevBalance) => prevBalance - betAmount); // Update the balance using setBalance

      // Send an SMS with the bet information
      const betInfo = `Bet Type: ${betType}, Selected Bets: ${JSON.stringify(
        selectedBets
      )}, Bet Amount: ${betAmount}`;

      // Call the API route to send the SMS
      const response = await fetch("/api/sendBetNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betInfo }),
      });

      if (response.ok) {
        console.log("SMS sent successfully");
      } else {
        console.error("Error sending SMS");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      setModalMessage("Something went wrong when placing your bet. Try again.");
      setSuccess(false);
    }
  };

  const placeSinglesBets = async () => {
    let totalAmount = 0;
    selectedBets.forEach((bet) => {
      totalAmount += bet.amount;
    });
    if (totalAmount > balance) {
      alert("You don't have enough balance to place the bets.");
      return;
    } else if (totalAmount === 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    // Iterate over the selectedBets and save them as individual bets in the database
    const userDoc = db.collection("users").doc(userId);

    await userDoc.update({
      singlesPendingBets: firebase.firestore.FieldValue.arrayUnion(
        ...selectedBets
      ),
      balance: firebase.firestore.FieldValue.increment(-totalAmount),
    });
  };

  const placeParlayBet = async () => {
    if (betAmount > balance) {
      alert("You don't have enough balance to place the bet.");
      return;
    } else if (betAmount === 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    console.log("Placing parlay bet:", selectedBets);
    const userDoc = db.collection("users").doc(userId);

    await userDoc.update({
      parlayPendingBets: firebase.firestore.FieldValue.arrayUnion({
        bets: selectedBets,
        amount: betAmount, // Add the bet amount for parlays
      }),
      balance: firebase.firestore.FieldValue.increment(-betAmount),
    });
  };

  const calculateParlayOdds = () => {
    return selectedBets.reduce((accumulator, bet) => {
      const odds = bet.type === "moneyline" ? bet.odds : bet.outcome.price;
      const multiplier = odds > 0 ? 1 + odds / 100 : 1 - 100 / odds;
      return (accumulator * multiplier).toPrecision(2);
    }, 1);
  };
  const calculateParlayPayout = (betAmount, totalOdds) => {
    const decimalOdds = totalOdds + 100 / 100;
    const payout = betAmount * decimalOdds;
    return payout.toFixed(2);
  };

  const renderBetTypeTabs = () => {
    return (
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 ${
            betType === "singles" ? "bg-green-500 text-white" : "text-green-500"
          } font-bold rounded-l-md border-2 border-green-500 focus:outline-none`}
          onClick={() => setBetType("singles")}
        >
          Singles
        </button>
        <button
          className={`px-4 py-2 ${
            betType === "parlays" ? "bg-green-500 text-white" : "text-green-500"
          } font-bold rounded-r-md border-2 border-green-500 focus:outline-none`}
          onClick={() => setBetType("parlays")}
        >
          Parlays
        </button>
      </div>
    );
  };
  const renderBetInput = (bet, index) => {
    return (
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={`betAmount-${index}`} className="font-semibold">
          Bet Amount:
        </label>
        {betType === "singles" && (
          <input
            type="number"
            id={`betAmount-${index}`}
            name={`betAmount-${index}`}
            className="px-2 py-1 w-20 border-2 border-gray-300 rounded-md focus:outline-none focus:border-green-500"
            min="0"
            step="1"
            value={bet.amount || ""}
            placeholder="0.00"
            onChange={(e) => updateBetAmount(index, e.target.value)}
          />
        )}
        {betType === "parlays" && (
          <input
            type="number"
            id={`betAmount-${index}`}
            name={`betAmount-${index}`}
            className="px-2 py-1 w-20 border-2 border-gray-300 rounded-md focus:outline-none focus:border-green-500"
            min="0"
            step="1"
            value={betAmount}
            placeholder="0.00"
            onChange={(e) => setBetAmount(e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderParlayInfo = () => {
    if (betType !== "parlays" || selectedBets.length === 0) return null;

    const totalOdds = calculateParlayOdds() - 1;
    const displayOdds = formatOdds(
      totalOdds >= 1 ? totalOdds * 100 : -100 / totalOdds
    );
    const payout = calculateParlayPayout(betAmount, totalOdds);

    return (
      <div className="text-sm mb-2">
        <p>Total Odds: {displayOdds}</p>
        <p>To Win: ${payout}</p>
      </div>
    );
  };
  const handleRemoveClick = (index) => {
    removeBet(index);
  };
  const handleSinglesPlaceBetClick = () => {
    setShowModal(true);
    setBetType("singles");
    placeBet();
  };
  const handleModalClose = () => {
    setShowModal(false);
  };
  const handlePlacedParlayBet = () => {
    setShowModal(true);
    setBetType("parlays");
    placeBet();
  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="p-2">
      <div className="bg-gradient-to-r from-white to-gray-100 p-6 min-h-72 max-h-[90vh] rounded-md shadow-lg overflow-y-auto">
        <h2 className="text-xl font-bold mb-2 text-center">Bet Slip</h2>
        {renderBetTypeTabs()}
        {selectedBets.length === 0 && (
          <p className="text-gray-700 text-center">No bets placed</p>
        )}

        {betType === "singles" && (
          <>
            {selectedBets.map((bet, index) => (
              <div key={index} className="border-b border-gray-300 pb-2 mb-2">
                <h3 className="font-semibold">
                  {bet.type === "moneyline" ? "Moneyline" : "Over/Under"}
                </h3>
                <p>
                  {bet.type === "moneyline"
                    ? `${bet.team} (${formatOdds(bet.odds)})`
                    : `${bet.outcome.name} ${bet.outcome.point} (${formatOdds(
                        bet.outcome.price
                      )})`}
                  <span
                    className="text-sm text-red-700 ml- cursor-pointer "
                    onClick={() => handleRemoveClick(bet.index)}
                  >
                    x
                  </span>
                </p>
                <p>
                  {bet.homeTeam} vs {bet.awayTeam}
                </p>
                {renderBetInput(bet, index)}
                {bet.amount > 0 && (
                  <>
                    <p>
                      To Win: $
                      {(
                        bet.amount *
                        (bet.type === "moneyline"
                          ? bet.odds > 0
                            ? bet.odds / 100
                            : -100 / bet.odds
                          : bet.outcome.price > 0
                          ? bet.outcome.price / 100
                          : -100 / bet.outcome.price)
                      ).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleSinglesPlaceBetClick()}
                      className="px-4 py-2 bg-green-500 text-white font-bold rounded-md focus:outline-none disabled:opacity-50"
                    >
                      Place Bet
                    </button>
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {betType === "parlays" && (
          <>
            {selectedBets.map((bet, index) => (
              <div key={index} className="border-b border-gray-300 pb-2 mb-2">
                <h3 className="font-semibold">
                  {bet.type === "moneyline" ? "Moneyline" : "Over/Under"}
                </h3>
                <p>
                  {bet.type === "moneyline"
                    ? `${bet.team} (${formatOdds(bet.odds)})`
                    : `${bet.outcome.name} ${bet.outcome.point} (${formatOdds(
                        bet.outcome.price
                      )})`}
                  <span
                    className="text-sm text-red-700 ml- cursor-pointer "
                    onClick={() => handleRemoveClick(bet.index)}
                  >
                    x
                  </span>
                </p>
                <p>
                  {bet.homeTeam} vs {bet.awayTeam}
                </p>
              </div>
            ))}
            {betType === "parlays" && renderBetInput({ index: 0 })}
            {renderParlayInfo()}
            {selectedBets.length > 0 && (
              <div className="mt-4">
                {!isParlayValid && betType === "parlays" && (
                  <div className="text-red-500 p-2">
                    One or more of your legs are not available to parlay.
                  </div>
                )}
                <button
                  disabled={!isParlayValid && betType === "parlays"}
                  onClick={() => handlePlacedParlayBet()}
                  className="px-4 py-2 bg-green-500 text-white font-bold rounded-md focus:outline-none disabled:opacity-50"
                >
                  Place Bet
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Modal show={showModal} onClose={handleModalClose}>
        <div className="p-4">
          <p>{modalMessage}</p>
          <button
            className={`mt-4 px-4 py-2 font-bold rounded-md focus:outline-none ${
              success ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
            onClick={handleModalClose}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BetSlip;
