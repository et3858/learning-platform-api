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
    .get(UserMiddleware.validateIdParam, UserController.show)
    .put([UserMiddleware.validateIdParam, UserMiddleware.beforeUpdate], UserController.update)
    .delete(UserMiddleware.validateIdParam, UserController.destroy);

module.exports = router;
