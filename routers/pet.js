const express = require('express');
const router = new express.Router();
const petController = require('../controllers/pet');
const authorization = require('../authorization/index');

router.put('/edit/:id', authorization.particular, (req, res) => petController.editPet(req, res));
router.put('/accept/:id', authorization.moderator, (req, res) => petController.acceptPet(req, res));
router.put('/reject/:id', authorization.moderator, (req, res) => petController.rejectPet(req, res));
router.get('/revision', authorization.moderator, (req, res) => petController.getPetsInRevision(req, res));
router.post('/', authorization.particular, (req, res) => petController.createPet(req, res));
router.get('/:id', authorization.particular_moderator, (req, res) => petController.getPet(req, res));

module.exports = router;
