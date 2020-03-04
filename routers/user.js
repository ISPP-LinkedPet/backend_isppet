
const express = require('express');
const router = new express.Router();
const userService = require('../services/user');
const authorization = require('../authorization/index');

router.get('/', authorization.user, (req, res) => userService.getUser(req, res));
router.post('/', authorization.user, (req, res) => userService.addUser(req, res));

module.exports = router;
