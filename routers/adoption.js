const express = require('express');
const router = new express.Router();
const adoptionController = require('../controllers/adoption');
const authorization = require('../authorization/index');

router.get('/favorites', authorization.user, adoptionController.getMyFavoriteAdoptions);

module.exports = router;
