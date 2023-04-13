// pages/api/sports.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.REACT_APP_API_KEY,
      "X-RapidAPI-Host": "odds.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(
      "https://odds.p.rapidapi.com/v4/sports?all=true",
      options
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sports data" });
  }
}
