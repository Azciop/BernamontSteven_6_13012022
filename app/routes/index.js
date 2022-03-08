// importing the express module and the user and sauce routes
const express = require('express');
const saucesRoutes = require("./sauce");
const userRoutes = require("./user");

// Then we make a router to defind URI
const router = express.Router();

// We create the user and sauces routes
router.use("/api/auth", userRoutes);
router.use("/api/sauces", saucesRoutes);

// then we export our router
module.exports = router


