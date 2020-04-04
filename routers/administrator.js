const express = require('express');
const router = new express.Router();
const administratorController = require('../controllers/administrator');
const authorization = require('../authorization/index');

router.put('/ban/:id', authorization.administrator, (req, res) => administratorController.banUser(req, res));
router.put('/unban/:id', authorization.administrator, (req, res) => administratorController.unbanUser(req, res));
router.put('/makeVetPremium', authorization.administrator, (req, res) => administratorController.makeVetPremium(req, res));
router.put('/cancelVetPremium', authorization.administrator, (req, res) => administratorController.cancelVetPremium(req, res));

module.exports = router;
