const express = require('express');
const router = new express.Router();
const particularController = require('../controllers/particular');
const authorization = require('../authorization/index');

router.get('/:id', authorization.moderator, (req, res) => particularController.getParticular(req, res));

module.exports = router;
