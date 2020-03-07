const express = require('express');
const router = new express.Router();
const breedingController = require('../controllers/breeding');
const authorization = require('../authorization');

router.get('/:id', authorization.all, (req, res) => breedingController.getBreeding(req, res));
router.post('/', authorization.all, (req, res) => breedingController.createBreading(req, res));

module.exports = router;
