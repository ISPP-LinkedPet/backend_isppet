const express = require('express');
const router = new express.Router();
const publicationController = require('../controllers/publication');
const authorization = require('../authorization/index');

router.get('/rejectedRequestList', authorization.particular, (req, res) => publicationController.getRejectedRequestListByActorId(req, res));
router.get('/acceptedRequestList', authorization.particular, (req, res) => publicationController.getAcceptedRequestListByActorId(req, res));
router.get('/requests/pending', authorization.shelter_particular, (req, res) => publicationController.getPendingRequestsToMyPublications(req, res));
router.get('/requests/accepted', authorization.shelter_particular, (req, res) => publicationController.getAcceptedRequestsToMyPublications(req, res));
router.get('/status/:status', authorization.moderator, (req, res) => publicationController.getPublicationStatus(req, res));
router.get('/user/:id', authorization.shelter_particular, (req, res) => publicationController.getPublicationsByActorId(req, res));
router.get('/:id', authorization.all, (req, res) => publicationController.getPublication(req, res));

module.exports = router;
