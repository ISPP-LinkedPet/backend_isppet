const express = require('express');
const router = new express.Router();
const administratorController = require('../controllers/administrator');
const authorization = require('../authorization/index');

router.put('/ban/:id', authorization.administrator, (req, res) => administratorController.banUser(req, res));
router.get('/ban/list', authorization.administrator, (req, res) => administratorController.getBanUsers(req, res));
router.put('/unban/:id', authorization.administrator, (req, res) => administratorController.unbanUser(req, res));
router.get('/unban/list', authorization.administrator, (req, res) => administratorController.getUnbanUsers(req, res));

module.exports = router;
