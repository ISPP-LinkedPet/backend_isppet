const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');
const authorization = require('../authorization/index');

router.get('/favorites', authorization.user, breedingController.getMyFavoriteBreedings);
router.get('/:id', breedingController.getBreeding);


module.exports = router;
