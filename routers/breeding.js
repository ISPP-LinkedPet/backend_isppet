const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');
const authorization = require('../authorization/index');

router.get('/favorites', authorization.all, (req, res) => breedingController.getMyFavoriteBreedings(req, res));
router.get('/pending', authorization.moderator, (req, res) => breedingController.getPendingBreedings(req, res));
router.get('/offers', authorization.particular, (req, res) => breedingController.getBreedingsOffers(req, res));
router.post('/', authorization.all, (req, res) => breedingController.createBreading(req, res));
router.get('/:id', authorization.all, (req, res) => breedingController.getBreeding(req, res));
router.post('/interested/:id', authorization.particular, (req, res) => breedingController.imInterested(req, res));

module.exports = router;
