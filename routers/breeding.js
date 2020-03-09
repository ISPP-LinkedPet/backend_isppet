const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');
const authorization = require('../authorization/index');

router.get('/offers', authorization.particular, (req, res) => breedingController.getBreedingsOffers(req, res));
router.get('/favorites', authorization.particular, (req, res) => breedingController.getMyFavoriteBreedings(req, res));
router.post('/', authorization.all, (req, res) => breedingController.createBreading(req, res));
router.get('/:id', authorization.all, (req, res) => breedingController.getBreeding(req, res));

module.exports = router;
