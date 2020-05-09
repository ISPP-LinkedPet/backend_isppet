const express = require('express');
const router = new express.Router();
const shelterController = require('../controllers/shelter');
const authorization = require('../authorization/index');

router.get('/myData', authorization.shelter, (req, res) => shelterController.getMyData(req, res));
router.get('/', authorization.all, (req, res) => shelterController.getShelters(req, res));
router.get('/:id', authorization.shelter_particular_moderator, (req, res) => shelterController.getShelter(req, res));
router.get('/user/profile', authorization.shelter, (req, res) => shelterController.getShelterLogged(req, res));
router.delete('/delete/user', authorization.shelter, (req, res) => shelterController.deleteShelter(req, res));

module.exports = router;
