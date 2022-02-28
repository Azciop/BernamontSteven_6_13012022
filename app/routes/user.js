const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require("../middleware/auth");

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

router.get('/read', auth, userCtrl.readUser);
router.get('/export', auth, userCtrl.exportUser);

router.put('/', auth, userCtrl.updateUser);

router.delete('/', auth, userCtrl.deleteUser);

router.post('/report/:id', auth, userCtrl.reportUser);

module.exports = router;