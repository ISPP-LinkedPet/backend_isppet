const express = require('express');
const router = new express.Router();
const paymentController = require('../controllers/payment');
const authorization = require('../authorization/index');

router.post('/myself', authorization.particular, (req, res) => paymentController.createPaymentToMyself(req, res));
router.post('/:id/myself/confirm', authorization.particular, (req, res) => paymentController.confirmPaymentToMyself(req, res));

module.exports = router;
