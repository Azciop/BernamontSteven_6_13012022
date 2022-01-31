const express = require('express');
const saucesRoutes = require("./sauce");
const userRoutes = require("./user");

const router = express.Router();

router.use("/api/auth", userRoutes);
router.use("/api/sauces", saucesRoutes);

module.exports = router