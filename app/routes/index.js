// importing the express module and the user and sauce routes
const express = require("express");
const saucesRoutes = require("./sauce");
const userRoutes = require("./user");

// Importing rate and speed limiter modules
const rateLimiter = require("../middleware/rate-limiter");
const slowDown = require("../middleware/speed-limiter");

// Then we make a router to defind URI
const router = express.Router();

// We create the user and sauces routes
router.use("/api/auth", slowDown, userRoutes);
router.use("/api/sauces", slowDown, rateLimiter, saucesRoutes);

// then we export our router
module.exports = router;
