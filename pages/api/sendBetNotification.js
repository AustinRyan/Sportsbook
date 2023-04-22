import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { betInfo } = req.body;

  try {
    const toPhoneNumber = process.env.TO_PHONE_NUMBER; // Make sure to set this in your .env.local file
    if (!toPhoneNumber) {
      throw new Error('Missing "TO_PHONE_NUMBER" environment variable');
    }

    await client.messages.create({
      body: `New Bet Placed: ${betInfo}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhoneNumber,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
