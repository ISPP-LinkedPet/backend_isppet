const express = require('express');
const router = new express.Router();
const authController = require('../controllers/auth');

router.post('/login', (req, res) => authController.login(req, res));

module.exports = router;
