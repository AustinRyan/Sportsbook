import React from "react";

const BetCard = ({ bet, status, winnings }) => {
  const formatOdds = (odds) => {
    return odds > 0 ? `+${odds}` : odds;
  };
  const calculatePayout = (outcome, amount) => {
    const odds =
      outcome.type === "moneyline" ? outcome.odds : outcome.outcome.price;
    const decimalOdds = odds >= 0 ? 1 + odds / 100 : 1 - 100 / odds;
    const payout = amount * decimalOdds;
    return payout.toFixed(2);
  };

  const calculateParlayPayout = (betAmount, totalOdds) => {
    const decimalOdds = totalOdds + 100 / 100;
    const payout = betAmount * decimalOdds;
    return payout.toFixed(2);
  };

  const renderParlayOutcome = (outcome) => {
    if (outcome.type === "moneyline") {
      return (
        <>
          <p>
            Moneyline: {outcome.team} ({formatOdds(outcome.odds)})
          </p>
          <p>
            {outcome.homeTeam} vs {outcome.awayTeam}
          </p>
        </>
      );
    } else if (outcome.type === "over_under" && outcome.outcome) {
      return (
        <>
          <p>
            Over/Under: {outcome.outcome.name} {outcome.outcome.point} (
            {formatOdds(outcome.outcome.price)})
          </p>
          <p>
            {outcome.homeTeam} vs {outcome.awayTeam}
          </p>
        </>
      );
    } else {
      return (
        <p>
          {outcome.homeTeam} vs {outcome.awayTeam}
        </p>
      );
    }
  };

  const renderBetOutcome = () => {
    if (bet.bets) {
      const totalOdds = bet.bets.reduce((accumulator, outcome) => {
        const odds =
          outcome.type === "moneyline" ? outcome.odds : outcome.outcome.price;
        const multiplier = odds > 0 ? 1 + odds / 100 : 1 - 100 / odds;
        return (accumulator * multiplier).toPrecision(2);
      }, 1);
      const payout = calculateParlayPayout(bet.amount, totalOdds - 1);

      return (
        <>
          {bet.bets.map((outcome, index) => (
            <div
              key={index}
              className={`${
                index < bet.bets.length - 1 ? "border-b border-gray-300" : ""
              } pb-2 pt-2`}
            >
              {renderParlayOutcome(outcome)}
            </div>
          ))}
          <div className="pt-2">Bet Amount: ${bet.amount}</div>
          <div className="pt-2">To Win: ${payout}</div>{" "}
          {/* Display the "To Win" amount for parlays */}
        </>
      );
    } else {
      const payout = calculatePayout(bet, bet.amount);
      return (
        <>
          {renderParlayOutcome(bet)}
          <div className="pt-2">Bet Amount: ${bet.amount}</div>
          <div className="pt-2">To Win: ${payout}</div>{" "}
          {/* Display the "To Win" amount for singles */}
        </>
      );
    }
  };

  return (
    <div className="bg-white p-4 mb-4 rounded-md shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">
          {bet.bets ? "Parlay Bet" : "Single Bet"}
        </h3>
        <span className="text-green-600 font-bold text-xl">{status}</span>
      </div>
      <div className="divide-y divide-gray-300">{renderBetOutcome()}</div>
      <div className="flex justify-between items-center mt-4">
        {status === "Winning" && (
          <p className="text-green-600 font-bold">Amount Won: ${winnings}</p>
        )}
      </div>
    </div>
  );
};

export default BetCard;
