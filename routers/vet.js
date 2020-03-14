const express = require('express');
const router = new express.Router();
const vetController = require('../controllers/vet');
const authorization = require('../authorization/index');

router.get('/', authorization.all, (req, res) => vetController.getVets(req, res));

module.exports = router;

