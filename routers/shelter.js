const express = require('express');
const router = new express.Router();
const shelterController = require('../controllers/shelter');
const authorization = require('../authorization/index');

router.get('/', authorization.user, (req, res) => shelterController.getShelters(req, res));

module.exports = router;
