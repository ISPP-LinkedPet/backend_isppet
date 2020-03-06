const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');

router.get('/:id', breedingController.getBreeding);
router.post('/', breedingController.createBreading);

module.exports = router;
