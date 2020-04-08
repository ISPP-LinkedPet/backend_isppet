const express = require('express');
const router = new express.Router();
const userController = require('../controllers/user');
const authorization = require('../authorization/index');

router.get('/', authorization.all, (req, res) => userController.getUser(req, res));


module.exports = router;
