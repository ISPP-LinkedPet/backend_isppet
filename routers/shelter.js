const express = require('express');
const router = new express.Router();
const shelterController = require('../controllers/shelter');
const authorization = require('../authorization/index');

router.get('/', authorization.all, (req, res) => shelterController.getShelters(req, res));
router.get('/:id', authorization.shelter_particular_moderator, (req, res) => shelterController.getShelter(req, res));

module.exports = router;
