const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/me', authController.getMe);

module.exports = router;
