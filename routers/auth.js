const express = require('express');
const router = new express.Router();
const authController = require('../controllers/auth');

router.post('/login', (req, res) => authController.login(req, res));
router.post('/register', authController.register);

module.exports = router;
