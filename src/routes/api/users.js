var UserController = include("controllers/user.controller");
var UserMiddleware = include("middlewares/user.middleware");

var express = require("express");
var router = express.Router();

router
    .route("/")
    .get(UserMiddleware.beforeIndex, UserController.index)
    .post(UserMiddleware.beforeStore, UserController.store);

router
    .route("/:id")
    .get(UserController.show)
    .put(UserMiddleware.beforeUpdate, UserController.update)
    .delete(UserController.destroy);

module.exports = router;