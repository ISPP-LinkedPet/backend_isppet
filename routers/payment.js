const express = require('express');
const router = new express.Router();
const paymentController = require('../controllers/payment');
const authorization = require('../authorization/index');

router.post('/', authorization.particular, (req, res) => paymentController.createPaymentToMyself(req, res));
router.post('/confirm', authorization.particular, (req, res) => paymentController.confirmPaymentToMyself(req, res));
router.post('/user', authorization.particular, (req, res) => paymentController.payUser(req, res));

module.exports = router;
