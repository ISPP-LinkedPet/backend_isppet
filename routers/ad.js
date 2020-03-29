const express = require('express');
const router = new express.Router();
const adController = require('../controllers/ad');

router.get('/:numAds?', adController.getRandomAds);

module.exports = router;
