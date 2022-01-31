const express = require("express");
const router = express.Router();

const sauceCtrl = require("../controllers/sauce");

router.get("/:id", sauceCtrl.getOneSauce);
router.get("/", sauceCtrl.getAllSauces);


module.exports = router;