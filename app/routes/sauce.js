// Importing our express and router modules
const express = require("express");
const router = express.Router();

// importing our sauce controller and also our auth and multer middleware
const sauceCtrl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

// We make our routes to create a sauce and to like a sauce
router.post("/", auth, multer, sauceCtrl.createSauce);
router.post("/:id/like", auth, sauceCtrl.rateSauce);

// We make our routes to get one or all the sauces
router.get("/:id", sauceCtrl.readOneSauce);
router.get("/", sauceCtrl.readAllSauces);

// We make our route to update a sauce
router.put("/:id", auth, multer, sauceCtrl.updateSauce);

// We make our route to delete a sauce
router.delete("/:id", auth, sauceCtrl.deleteSauce);

// We make our route to report a sauce (RGPD rules)
router.post("/report/:id", auth, sauceCtrl.reportSauce);

module.exports = router;
