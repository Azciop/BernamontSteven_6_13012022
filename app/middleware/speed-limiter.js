// Importing the Express module
const express = require("express");
const app = express();

// Importing the express slow down module
const slowDown = require("express-slow-down");

// we use a speedlimiter to limit the speed of the flux in our nodeJS
const speedLimiter = slowDown({
	windowMs: 15 * 60 * 1000, // 15 minutes
	delayAfter: 100, // allow 100 requests per 15 minutes, then...
	delayMs: 500, // begin adding 500ms of delay per request above 100:
	// request # 101 is delayed by  500ms
	// request # 102 is delayed by 1000ms
	// request # 103 is delayed by 1500ms
	// etc.
});

//  apply to all requests
app.use(speedLimiter);

module.exports = speedLimiter;
