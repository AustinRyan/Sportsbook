import React, { useEffect, useState } from "react";
import LiveUpcomingGames from "./LiveUpcomingGames";
const LandingMainContent = ({
  sportToQuery,
  handleMoneylineSelection,
  handleOverUnderSelection,
}) => {
  const [isLiveInGameExpanded, setIsLiveInGameExpanded] = useState(false);
  const toggleLiveInGameExpanded = (currentState) => {
    if (!currentState) {
      setIsLiveInGameExpanded(true);
      setIsGameLinesExpanded(false);
    }
    // console.log(`live in game selected: ${isLiveInGameExpanded}`);
  };
  const [isGameLinesExpanded, setIsGameLinesExpanded] = useState(true);
  const toggleGameLinesExpanded = (currentState) => {
    if (!currentState) {
      setIsGameLinesExpanded(!isGameLinesExpanded);
      setIsLiveInGameExpanded(false);
    }
    // console.log(`game lines selected: ${isGameLinesExpanded}`);
  };
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
      "X-RapidAPI-Host": "odds.p.rapidapi.com",
    },
  };
  const [liveGames, setLiveGames] = useState([]);
  const [overUnders, setOverUnders] = useState([]);
  const [isLive, setIsLive] = useState(false);

  const getLiveGames = async () => {
    try {
      const response = await fetch(
        `https://odds.p.rapidapi.com/v4/sports/${sportToQuery}/odds?regions=us&oddsFormat=american&markets=h2h&dateFormat=unix`,
        options
      );
      const data = await response.json();
      data.forEach((game) => {
        // Convert the commence_time to a JavaScript Date object
        const utcDate = new Date(game.commence_time * 1000);

        // Convert the Date object to Eastern Time
        const estDate = new Date(
          utcDate.toLocaleString("en-US", { timeZone: "America/New_York" })
        );

        // Extract the away and home teams
        const awayTeam = game.away_team;
        const homeTeam = game.home_team;

        // Find the odds from DraftKings
        const draftKingsBookmaker = game.bookmakers.find(
          (bookmaker) => bookmaker.key === "draftkings"
        );

        let awayTeamOdds, homeTeamOdds;

        if (draftKingsBookmaker) {
          const h2hMarket = draftKingsBookmaker.markets.find(
            (market) => market.key === "h2h"
          );
          if (h2hMarket) {
            awayTeamOdds = h2hMarket.outcomes.find(
              (outcome) => outcome.name === awayTeam
            )?.price;
            homeTeamOdds = h2hMarket.outcomes.find(
              (outcome) => outcome.name === homeTeam
            )?.price;
          }
        }
      });
      setLiveGames(data);
    } catch (err) {
      console.error(err);
    }
    // getOverUnders();
  };
  const getOverUnders = async () => {
    try {
      const response = await fetch(
        `https://odds.p.rapidapi.com/v4/sports/${sportToQuery}/odds?regions=us&oddsFormat=american&markets=totals&dateFormat=unix`,
        options
      );
      const data = await response.json();
      const updatedOverUnders = data.map((game) => {
        let overUnderOdds;
        const draftKingsBookmaker = game.bookmakers.find(
          (bookmaker) => bookmaker.key === "draftkings"
        );

        if (draftKingsBookmaker) {
          const totalsMarket = draftKingsBookmaker.markets.find(
            (market) => market.key === "totals"
          );
          if (totalsMarket) {
            overUnderOdds = totalsMarket.outcomes.map((outcome) => ({
              name: outcome.name,
              price: outcome.price,
              point: outcome.point,
            }));
          }
        }
        return overUnderOdds;
      });
      setOverUnders(updatedOverUnders);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (estDate) => {
    const today = new Date();
    const isToday =
      estDate.getDate() === today.getDate() &&
      estDate.getMonth() === today.getMonth() &&
      estDate.getFullYear() === today.getFullYear();

    const hours24 = estDate.getHours();
    const hours12 = hours24 % 12 || 12; // Convert to 12-hour format
    const minutes = estDate.getMinutes();
    const ampm = hours24 < 12 ? "am" : "pm";
    const time = `${hours12}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;

    return isToday
      ? `Today @${time}`
      : estDate.toLocaleDateString() + ` @${time}`;
  };

  useEffect(() => {
    getLiveGames();
    getOverUnders();
  }, [sportToQuery]);

  return (
    <div className="">
      <ul className="flex p-4 justify-evenly ">
        <li
          className={`text-white cursor-pointer ${
            isGameLinesExpanded ? "border-b-2 border-green-500" : ""
          }`}
          onClick={() => {
            toggleGameLinesExpanded(isGameLinesExpanded);
          }}
        >
          Upcoming Games
        </li>
        <li
          className={`text-white cursor-pointer ${
            isLiveInGameExpanded ? "border-b-2 border-green-500" : ""
          }`}
          onClick={() => {
            toggleLiveInGameExpanded(isLiveInGameExpanded);
          }}
        >
          Live In-Game
        </li>
      </ul>
      {isLiveInGameExpanded && (
        <>
          <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
            {liveGames.map((game, index) => {
              const utcDate = new Date(game.commence_time * 1000);
              const estDate = new Date(
                utcDate.toLocaleString("en-US", {
                  timeZone: "America/New_York",
                })
              );
              const awayTeam = game.away_team;
              const homeTeam = game.home_team;
              const draftKingsBookmaker = game.bookmakers.find(
                (bookmaker) => bookmaker.key === "draftkings"
              );
              let awayTeamOdds, homeTeamOdds;

              if (draftKingsBookmaker) {
                const h2hMarket = draftKingsBookmaker.markets.find(
                  (market) => market.key === "h2h"
                );
                if (h2hMarket) {
                  awayTeamOdds = h2hMarket.outcomes.find(
                    (outcome) => outcome.name === awayTeam
                  )?.price;
                  homeTeamOdds = h2hMarket.outcomes.find(
                    (outcome) => outcome.name === homeTeam
                  )?.price;
                }
              }
              const isLive = () => {
                const currentTime = new Date();
                return new Date(game.commence_time * 1000) <= currentTime;
              };

              return isLive() ? (
                <LiveUpcomingGames
                  key={game.id}
                  estDate={formatDate(estDate)}
                  awayTeam={awayTeam}
                  homeTeam={homeTeam}
                  awayTeamOdds={awayTeamOdds}
                  homeTeamOdds={homeTeamOdds}
                  overUnderOdds={overUnders[index]}
                  commenceTime={game.commence_time}
                  sportToQuery={sportToQuery}
                  handleMoneylineSelection={handleMoneylineSelection}
                  handleOverUnderSelection={handleOverUnderSelection}
                />
              ) : (
                ""
              );
            })}
          </div>
        </>
      )}
      {isGameLinesExpanded && (
        <>
          <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
            {liveGames.map((game, index) => {
              const utcDate = new Date(game.commence_time * 1000);
              const estDate = new Date(
                utcDate.toLocaleString("en-US", {
                  timeZone: "America/New_York",
                })
              );
              const awayTeam = game.away_team;
              const homeTeam = game.home_team;
              const draftKingsBookmaker = game.bookmakers.find(
                (bookmaker) => bookmaker.key === "draftkings"
              );
              let awayTeamOdds, homeTeamOdds;

              if (draftKingsBookmaker) {
                const h2hMarket = draftKingsBookmaker.markets.find(
                  (market) => market.key === "h2h"
                );
                if (h2hMarket) {
                  awayTeamOdds = h2hMarket.outcomes.find(
                    (outcome) => outcome.name === awayTeam
                  )?.price;
                  homeTeamOdds = h2hMarket.outcomes.find(
                    (outcome) => outcome.name === homeTeam
                  )?.price;
                }
              }
              const isLive = () => {
                const currentTime = new Date();
                return new Date(game.commence_time * 1000) <= currentTime;
              };

              return !isLive() ? (
                <LiveUpcomingGames
                  key={game.id}
                  estDate={formatDate(estDate)}
                  awayTeam={awayTeam}
                  homeTeam={homeTeam}
                  awayTeamOdds={awayTeamOdds}
                  homeTeamOdds={homeTeamOdds}
                  overUnderOdds={overUnders[index]}
                  commenceTime={game.commence_time}
                  sportToQuery={sportToQuery}
                  handleMoneylineSelection={handleMoneylineSelection}
                  handleOverUnderSelection={handleOverUnderSelection}
                />
              ) : (
                ""
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
export default LandingMainContent;
