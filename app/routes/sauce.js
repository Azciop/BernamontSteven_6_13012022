const express = require('express');
const app = express();
const router = express.Router();

const sauceCtrl = require('../controllers/sauce')

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

router.get("/api/sauces", sauceCtrl.getAllSauces);
router.get("/api/sauces/:id", sauceCtrol,getOneSauce)

module.exports = router;
