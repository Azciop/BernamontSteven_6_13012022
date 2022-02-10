const express = require("express");
const router = express.Router();

const sauceCtrl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require('../middleware/multer-config');

router.post("/", auth, multer, sauceCtrl.createSauce);
router.post("/:id/like", auth, sauceCtrl.rateSauce);

router.get("/:id", sauceCtrl.readOneSauce);
router.get("/", sauceCtrl.readAllSauces);

router.put("/:id", auth, multer, sauceCtrl.updateSauce);

module.exports = router;