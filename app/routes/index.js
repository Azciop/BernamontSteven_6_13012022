const express = require('express');

const router = express.Router();

const userRoutes = require("./user");


router.use("/api/auth", userRoutes);

module.exports = router