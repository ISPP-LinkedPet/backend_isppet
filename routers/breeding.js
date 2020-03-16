const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');
const authorization = require('../authorization/index');

router.put('/edit/:id', authorization.particular, (req, res) => breedingController.editBreeding(req, res));
router.get('/pending', authorization.moderator, (req, res) => breedingController.getPendingBreedings(req, res));
router.get('/offers', authorization.particular, (req, res) => breedingController.getBreedingsOffers(req, res));
router.get('/interested', authorization.particular, (req, res) => breedingController.getMyInterestedBreedings(req, res));
router.post('/', authorization.particular, (req, res) => breedingController.createBreading(req, res));
router.get('/:id', authorization.all, (req, res) => breedingController.getBreeding(req, res));
router.post('/interested/:id', authorization.particular, (req, res) => breedingController.imInterested(req, res));
router.put('/accept/:id', authorization.moderator, (req, res) => breedingController.acceptBreeding(req, res));
router.put('/reject/:id', authorization.moderator, (req, res) => breedingController.rejectBreeding(req, res));
router.get('/hasRequest/:id', authorization.particular, (req, res) => breedingController.breedingHasRequest(req, res));

module.exports = router;
