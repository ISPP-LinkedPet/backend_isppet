const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');

router.get('/', breedingController.getBreedingsOffers)
router.get('/:id', breedingController.getBreeding);

module.exports = router;
