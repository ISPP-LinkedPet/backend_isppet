const express = require('express');
const router = new express.Router();
const adoptionController = require('../controllers/adoption');
const authorization = require('../authorization/index');

router.get('/particular', authorization.particular, (req, res) => adoptionController.getParticularAdoptions(req, res));

module.exports = router;