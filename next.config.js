/** @type {import('next').NextConfig} */
require("dotenv").config();
const nextConfig = {
  reactStrictMode: true,
  env: {
    REACT_APP_API_KEY: process.env.REACT_APP_API_KEY,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  },
};

module.exports = nextConfig;
