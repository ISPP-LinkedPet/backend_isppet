const express = require('express');
const router = new express.Router();
const paymentController = require('../controllers/payment');
const authorization = require('../authorization/index');

router.get('/myself', authorization.particular, (req, res) => paymentController.createPaymentToMyself(req, res));
router.get('/myself/confirm', authorization.particular, (req, res) => paymentController.confirmPaymentToMyself(req, res));

module.exports = router;
