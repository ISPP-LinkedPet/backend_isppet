const express = require('express');
const router = new express.Router();
const petController = require('../controllers/pet');
const authorization = require('../authorization/index');

router.put('/edit/:id', authorization.shelter_particular, (req, res) => petController.editPet(req, res));
router.delete('/delete/:id', authorization.shelter_particular, (req, res) => petController.deletePet(req, res));
router.put('/accept/:id', authorization.moderator, (req, res) => petController.acceptPet(req, res));
router.put('/reject/:id', authorization.moderator, (req, res) => petController.rejectPet(req, res));
router.get('/revision', authorization.moderator, (req, res) => petController.getPetsInRevision(req, res));
router.post('/', authorization.shelter_particular, (req, res) => petController.createPet(req, res));
router.get('/:id', authorization.shelter_particular_moderator, (req, res) => petController.getPet(req, res));
router.get('/user/:id', authorization.all, (req, res) => petController.getPetsByParticularId(req, res));
router.get('/shelter/:id', authorization.all, (req, res) => petController.getPetsByShelterId(req, res));
router.get('/canDelete/:id', authorization.shelter_particular, (req, res) => petController.getCanDelete(req, res));

module.exports = router;
