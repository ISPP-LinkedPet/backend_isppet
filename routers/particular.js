const express = require('express');
const router = new express.Router();
const particularController = require('../controllers/particular');
const authorization = require('../authorization/index');

router.get('/myData', authorization.particular, (req, res) => particularController.getMyData(req, res));
router.get('/:id', authorization.all, (req, res) => particularController.getParticular(req, res));
router.get('/hasRequest/:id', authorization.particular, (req, res) => particularController.hasRequestFrom(req, res));
router.get('/user/profile', authorization.particular, (req, res) => particularController.getParticularLogged(req, res));
router.delete('/delete/user', authorization.particular, (req, res) => particularController.deleteParticular(req, res));


module.exports = router;
