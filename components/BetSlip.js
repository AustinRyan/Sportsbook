import React, { useState } from "react";

const BetSlip = ({ selectedBets, removeBet, isParlayValid }) => {
  const [betType, setBetType] = useState("singles");
  const [betAmount, setBetAmount] = useState(0);

  const formatOdds = (odds) => {
    return odds > 0 ? `+${odds}` : odds;
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

  const renderBetInput = () => {
    return (
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="betAmount" className="font-semibold">
          Bet Amount:
        </label>
        <input
          type="number"
          id="betAmount"
          name="betAmount"
          className="px-2 py-1 w-20 border-2 border-gray-300 rounded-md focus:outline-none focus:border-green-500"
          min="0"
          step="1"
          value={betAmount}
          placeholder="0.00"
          onChange={(e) => setBetAmount(e.target.value)}
        />
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

  return (
    <div className="p-2">
      <div className="bg-gradient-to-r from-white to-gray-100 p-6 min-h-72 max-h-[90vh] rounded-md shadow-lg overflow-y-auto">
        <h2 className="text-xl font-bold mb-2 text-center">Bet Slip</h2>
        {renderBetTypeTabs()}
        {selectedBets.length === 0 && (
          <p className="text-gray-700 text-center">No bets placed</p>
        )}
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
            {betType === "singles" && renderBetInput()}
          </div>
        ))}
        {betType === "parlays" && (
          <>
            {renderBetInput()}
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
                  // onClick={placeBet}
                  className="px-4 py-2 bg-green-500 text-white font-bold rounded-md focus:outline-none disabled:opacity-50"
                >
                  Place Bet
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BetSlip;
