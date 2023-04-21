import firebase from "firebase/app";
import "firebase/firestore";
import { db } from "../../firebase";

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
    "X-RapidAPI-Host": "odds.p.rapidapi.com",
  },
};
// A function to fetch match results from an external API or other data source
async function fetchMatchResults(sport) {
  // Fetch match results here and return them
  const response = await fetch(
    `https://odds.p.rapidapi.com/v4/sports/${sport}/scores?daysFrom=2`,
    options
  );
  const data = await response.json();
  console.log("API response:", data); // Log the response for debugging purposes
  return data;
}

// A function to determine if a bet is a winner based on the match results
function isBetWinner(bet, matchResults) {
  // Find the completed match result based on the bet data
  const match = matchResults.find(
    (result) =>
      result.home_team === bet.homeTeam &&
      result.away_team === bet.awayTeam &&
      result.completed === true &&
      result.commence_time === bet.startTime
  );

  // If the match result was not found or is not completed, return false
  if (!match || !match.completed) {
    return null;
  }

  if (bet.type === "moneyline") {
    const winner =
      match.scores[0].points > match.scores[1].points
        ? match.home_team
        : match.away_team;
    return winner === bet.team;
  } else if (bet.type === "over_under") {
    const totalPoints = match.scores[0].points + match.scores[1].points;
    return bet.outcome.name === "Over"
      ? totalPoints > bet.outcome.point
      : totalPoints < bet.outcome.point;
  }
}

function calculateWinnings(bet) {
  const wager = bet.amount;
  const odds = bet.odds;
  if (odds > 0) {
    return wager * (odds / 100);
  } else {
    return wager * (100 / Math.abs(odds));
  }
}

function calculateParlayWinnings(bet) {
  const wager = bet.amount;
  const odds = bet.bets.reduce((accumulator, singleBet) => {
    const singleBetOdds = singleBet.odds;
    if (singleBetOdds > 0) {
      return accumulator * (1 + singleBetOdds / 100);
    } else {
      return accumulator * (1 - 100 / Math.abs(singleBetOdds));
    }
  }, 1);

  return wager * (odds - 1);
}

// A function to update the user's balance in the database
async function updateUserBalance(userId, winnings) {
  const userDoc = db.collection("users").doc(userId);
  console.log("Updating user balance, user ID:", userId, "winnings:", winnings);

  await userDoc.update({
    balance: firebase.firestore.FieldValue.increment(winnings),
  });
}
async function processParlayBets(matchResults) {
  const usersSnapshot = await db.collection("users").get();
  usersSnapshot.forEach(async (userDoc) => {
    const userRef = db.collection("users").doc(userDoc.id);
    const user = userDoc.data();
    const parlayPendingBets = user.parlayPendingBets || [];

    for (const bet of parlayPendingBets) {
      const allLegsWin = bet.bets.every((leg) => {
        const isWinner = isBetWinner(leg, matchResults);
        return isWinner === null ? false : isWinner;
      });

      if (bet.bets.some((leg) => isBetWinner(leg, matchResults) === null)) {
        console.log("This parlay bet is still pending! Bet data:", bet);
        continue;
      }

      console.log(
        "Processing parlay bet for user:",
        userDoc.id,
        "bet data:",
        bet
      );

      if (allLegsWin) {
        console.log("This parlay has won! Bet data:", bet);
        const totalOdds = bet.bets.reduce(
          (accumulator, leg) => accumulator * leg.odds,
          1
        );
        const winnings = bet.amount * totalOdds;

        // Update user's balance
        await updateUserBalance(userDoc.id, winnings);

        // Move the bet to the 'betsWon' array
        await userRef.update({
          betsWon: firebase.firestore.FieldValue.arrayUnion(bet),
        });
      } else {
        // Move the bet to the 'betsLost' array
        console.log("This parlay has lost! Bet data:", bet);
        await userRef.update({
          betsLost: firebase.firestore.FieldValue.arrayUnion(bet),
        });
      }

      // Remove the processed bet
      await userRef.update({
        parlayPendingBets: firebase.firestore.FieldValue.arrayRemove(bet),
      });
    }
  });
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function processSingles(allMatchResults) {
  const usersSnapshot = await db.collection("users").get();
  usersSnapshot.forEach(async (userDoc) => {
    const userRef = db.collection("users").doc(userDoc.id);
    const user = userDoc.data();
    const singlesPendingBets = user.singlesPendingBets || [];

    for (const bet of singlesPendingBets) {
      console.log("Processing single bet:", bet);
      const isWinner = isBetWinner(bet, allMatchResults);

      if (isWinner === null) {
        console.log("This single bet is still pending! Bet data:", bet);
        continue;
      }

      if (isWinner) {
        console.log("This single bet has won! Bet data:", bet);
        const winnings = calculateWinnings(bet);
        await updateUserBalance(userDoc.id, winnings);
        await userRef.update({
          betsWon: firebase.firestore.FieldValue.arrayUnion(bet),
        });
      } else {
        console.log("This single bet has lost! Bet data:", bet);
        await userRef.update({
          betsLost: firebase.firestore.FieldValue.arrayUnion(bet),
        });
      }
      // Remove the processed bet
      await userRef.update({
        singlesPendingBets: firebase.firestore.FieldValue.arrayRemove(bet),
      });
    }
  });
}
export default async function checkBets(req, res) {
  try {
    const sports = [
      "baseball_mlb",
      "basketball_nba",
      "basketball_wnba",
      "americanfootball_nfl",
      "icehockey_nhl",
      "soccer_usa_mls",
    ];
    const allMatchResults = [];

    // Fetch match results
    for (const sport of sports) {
      const matchResults = await fetchMatchResults(sport);
      allMatchResults.push(...matchResults);
      await delay(1000);
    }
    console.log("Fetched match results:", allMatchResults);

    /* Process single bets  */
    console.log("Processing single bets...");
    await processSingles(allMatchResults);

    /* Process parlay bets  */
    console.log("Processing parlay bets...");
    await processParlayBets(allMatchResults);

    res.status(200).json({ message: "Bets processed successfully" });
  } catch (error) {
    console.error("Error processing bets:", error);
    res.status(500).json({ message: "Error processing bets" });
  }
}
