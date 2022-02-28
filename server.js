const express = require("express");
const cors = require("cors");
const routes = require("./app/routes");
const path = require("path");

// Importing the mongoose module
const mongoose = require('mongoose');

// Logger mongoose
mongoose.set('debug', true);

// Importing the mongoose sanitize module
const mongoSanitize = require('express-mongo-sanitize');

// Importing the express rate limit module
const rateLimit = require('express-rate-limit')

// Importing the express slow dowh module
const slowDown = require("express-slow-down");

// Init .env config
require('dotenv').config();

const app = express();

var hateoasLinker = require('express-hateoas-links');

var corsOptions = {
  origin: "http://127.0.0.1:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to piiquante application." });
});

app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

//  apply to all requests
app.use(speedLimiter);

// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter);

// replace standard express res.json with the new version
app.use(hateoasLinker);

app.use(routes);

app.use('/images', express.static(path.join(__dirname, 'images')));

const db = require("./config/db.config");

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});