// Importing the Express module
const express = require("express");
const app = express();

// Importing the express rate limit module
const rateLimit = require("express-rate-limit");

// we use a rateLimit to limit the repeated requests an user can do on our api
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to API calls only
app.use("/api", apiLimiter);

module.exports = apiLimiter;
