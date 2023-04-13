import React, { useState, useEffect } from "react";

const LiveUpcomingGames = ({
  estDate,
  awayTeam,
  homeTeam,
  awayTeamOdds,
  homeTeamOdds,
  overUnderOdds,
  commenceTime,
  sportToQuery,
  handleMoneylineSelection,
  handleOverUnderSelection,
}) => {
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
      "X-RapidAPI-Host": "odds.p.rapidapi.com",
    },
  };
  const formatOdds = (odds) => {
    return odds > 0 ? `+${odds}` : odds;
  };
  const isLive = () => {
    const currentTime = new Date();
    return new Date(commenceTime * 1000) <= currentTime;
  };
  const [liveScores, setLiveScores] = useState({});

  const getLiveScore = async () => {
    const response = await fetch(
      `https://odds.p.rapidapi.com/v4/sports/${sportToQuery}/scores`,
      options
    );
    const data = await response.json();

    console.log("API response:", data); // Log the response for debugging purposes

    const scores = Array.isArray(data)
      ? data.reduce((acc, game) => {
          if (
            game.home_team === homeTeam &&
            game.away_team === awayTeam &&
            game.scores &&
            game.scores.length >= 2
          ) {
            acc[game.home_team] = game.scores[0].score;
            acc[game.away_team] = game.scores[1].score;
          }
          return acc;
        }, {})
      : {};

    setLiveScores(scores);
  };

  useEffect(() => {
    if (isLive()) {
      getLiveScore();
    }
  }, [isLive()]);

  const [selectedBetIndices, setSelectedBetIndices] = useState(new Set());

  const handleSelection = (index, selectionCallback, ...args) => {
    const newSelectedBetIndices = new Set(selectedBetIndices);

    if (newSelectedBetIndices.has(index)) {
      newSelectedBetIndices.delete(index);
    } else {
      newSelectedBetIndices.add(index);
    }

    setSelectedBetIndices(newSelectedBetIndices);
    selectionCallback(...args);
  };

  const isSelected = (index) => selectedBetIndices.has(index);

  return (
    <div className="bg-gray-800 text-white my-4 rounded shadow-lg">
      <div className="text-lg font-bold p-4">{estDate}</div>
      <div className="text-xl font-semibold p-4">
        {awayTeam}{" "}
        {isLive() && liveScores[awayTeam] !== undefined && (
          <span>({liveScores[awayTeam]})</span>
        )}{" "}
        vs {homeTeam}{" "}
        {isLive() && liveScores[homeTeam] !== undefined && (
          <span>({liveScores[homeTeam]})</span>
        )}
        {isLive() && <span className="text-red-600 ml-2">LIVE</span>}
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-600">
        {awayTeamOdds && homeTeamOdds ? (
          <>
            <div className="relative group">
              <div
                className={`p-4 ${
                  isSelected(0) ? "bg-white text-gray-900" : "bg-gray-700"
                } hover:bg-white hover:text-gray-900 cursor-pointer transition duration-300 ease-in-out`}
                onClick={() =>
                  handleSelection(
                    0,
                    handleMoneylineSelection,
                    awayTeam,
                    awayTeamOdds,
                    homeTeam,
                    awayTeam
                  )
                }
              >
                {awayTeam} Odds: {formatOdds(awayTeamOdds)}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 group-hover:opacity-100 opacity-0 transition duration-300 ease-in-out"></div>
            </div>
            <div className="relative group">
              <div
                className={`p-4 ${
                  isSelected(1) ? "bg-white text-gray-900" : "bg-gray-700"
                } hover:bg-white hover:text-gray-900 cursor-pointer transition duration-300 ease-in-out`}
                onClick={() =>
                  handleSelection(
                    1,
                    handleMoneylineSelection,
                    homeTeam,
                    homeTeamOdds,
                    homeTeam,
                    awayTeam
                  )
                }
              >
                {homeTeam} Odds: {formatOdds(homeTeamOdds)}
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 group-hover:opacity-100 opacity-0 transition duration-300 ease-in-out"></div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 p-4 col-span-2">
            Moneyline odds not available at this moment
          </div>
        )}
      </div>
      <div className="text-xl font-semibold p-4">Over/Under</div>
      <div className="grid grid-cols-2 divide-x divide-gray-600">
        {overUnderOdds && overUnderOdds.length > 0 ? (
          overUnderOdds.map((outcome, index) => {
            const adjustedIndex = index + 1000; // Add an offset to the over/under indices
            return (
              <div className="relative group" key={outcome.name}>
                <div
                  className={`p-4 ${
                    isSelected(adjustedIndex)
                      ? "bg-white text-gray-900"
                      : "bg-gray-700"
                  } hover:bg-white hover:text-gray-900 cursor-pointer transition duration-300 ease-in-out`}
                  onClick={() =>
                    handleSelection(adjustedIndex, handleOverUnderSelection, {
                      outcome,
                      homeTeam,
                      awayTeam,
                      index,
                    })
                  }
                >
                  {outcome.name} {outcome.point}: {formatOdds(outcome.price)}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 group-hover:opacity-100 opacity-0 transition duration-300 ease-in-out"></div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 p-4 col-span-2">
            Over/Under odds not available
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveUpcomingGames;
