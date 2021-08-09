var AuthController = include("controllers/auth.controller");
var AuthMiddleware = include("middlewares/auth.middleware");

var express = require("express");
var router = express.Router();

router.post("/login", AuthMiddleware.beforeLogin, AuthController.login);

module.exports = router;