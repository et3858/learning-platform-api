var UserController = require('../controllers/user.controller');

var express = require('express');
var router = express.Router();

router
    .get('/', UserController.index)
    .post('/', UserController.store)
    .get('/:id', UserController.show)
    .put('/:id', UserController.update)
    .delete('/:id', UserController.destroy);

module.exports = router;
