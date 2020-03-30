const express = require('express');
const router = new express.Router();
const requestController = require('../controllers/request');
const authorization = require('../authorization/index');

router.put('/:id/reject', authorization.particular, (req, res) => requestController.rejectRequest(req, res));
router.put('/:id/accept/:publicationId', authorization.particular, (req, res) => requestController.acceptRequest(req, res));
router.get('/hasRequest/:id', authorization.particular, (req, res) => requestController.hasRequest(req, res));

module.exports = router;
