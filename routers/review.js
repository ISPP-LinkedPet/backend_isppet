const express = require('express');
const router = new express.Router();
const reviewController = require('../controllers/review');
const authorization = require('../authorization/index');

router.get('/:id', authorization.all, (req, res) =>
  reviewController.getReview(req, res),
);

module.exports = router;
