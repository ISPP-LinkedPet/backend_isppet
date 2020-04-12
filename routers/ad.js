const express = require('express');
const router = new express.Router();
const adController = require('../controllers/ad');
const authorization = require('../authorization/index');

router.post('/addClick/:id', authorization.all, adController.addClick);
router.get('/:numAds?', authorization.all, adController.getRandomAds);

module.exports = router;
