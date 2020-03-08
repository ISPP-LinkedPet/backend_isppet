const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');
const authorization = require('../authorization/index');

router.get('/favorites', authorization.all, (req, res) => breedingController.getMyFavoriteBreedings(req, res));
router.post('/', authorization.particular, breedingController.createBreading);
router.post('/interested/:id', authorization.particular, breedingController.imInterested);
router.get('/:id', breedingController.getBreeding);

module.exports = router;
