const express = require('express');
const router = new express.Router();
const adController = require('../controllers/ad');

router.post('/addClick/:id', adController.addClick);
router.get('/:numAds?', adController.getRandomAds);

module.exports = router;
