const express = require('express');
const app = express();
const router = express.Router();

const sauceCtrl = require('../controllers/sauce')

router.get("/", sauceCtrl.getAllSauces);
router.get("/api/sauces", sauceCtrl.getAllSauces);
router.get("/:id", sauceCtrl,getOneSauce);

module.exports = router;
