const express = require('express');
const router = new express.Router();
const vetController = require('../controllers/vet');
const authorization = require('../authorization/index');

router.get('/', authorization.all, (req, res) => vetController.getVets(req, res));
router.put('/premiumTrue/:id', authorization.administrator, (req, res) => vetController.premiumTrue(req, res));
router.put('/premiumFalse/:id', authorization.administrator, (req, res) => vetController.premiumFalse(req, res));
router.get('/:id', authorization.administrator, (req, res) => vetController.getVetById(req, res));

module.exports = router;

