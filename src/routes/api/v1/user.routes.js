const UserController = include("controllers/api/v1/user.controller");
const UserMiddleware = include("middlewares/user.middleware");

const express = require("express");
const router = express.Router();

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
