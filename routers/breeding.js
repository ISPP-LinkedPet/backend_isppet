const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');
const authorization = require('../authorization');

router.get('/:id', breedingController.getBreeding);
router.post('/', authorization.user, breedingController.createBreading);

module.exports = router;
