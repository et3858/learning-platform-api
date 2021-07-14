var UserController = require("../controllers/user.controller");

var express = require("express");
var router = express.Router();

router
    .route("/")
    .get(UserController.index)
    .post(UserController.store);

router
    .route("/:id")
    .get(UserController.show)
    .put(UserController.update)
    .delete(UserController.destroy);

module.exports = router;
