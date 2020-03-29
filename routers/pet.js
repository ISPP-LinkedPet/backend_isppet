const express = require('express');
const router = new express.Router();
const petController = require('../controllers/pet');
const authorization = require('../authorization/index');

router.put('/edit/:id', authorization.particular, (req, res) => petController.editPet(req, res));
router.post('/', authorization.particular, (req, res) => petController.createPet(req, res));

module.exports = router;
