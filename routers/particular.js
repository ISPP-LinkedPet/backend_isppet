const express = require('express');
const router = new express.Router();
const particularController = require('../controllers/particular');
const authorization = require('../authorization/index');

router.get('/:id', authorization.all, (req, res) => particularController.getParticular(req, res));
router.get('/hasRequest/:id', authorization.particular, (req, res) => particularController.hasRequestFrom(req, res));
router.get('/user/profile', authorization.particular, (req, res) => particularController.getParticularLogged(req, res));

module.exports = router;
