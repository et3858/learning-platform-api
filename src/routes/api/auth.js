var AuthController = include("controllers/auth.controller");
var AuthMiddleware = include("middlewares/auth.middleware");

var express = require("express");
var router = express.Router();

router.post("/login", AuthMiddleware.beforeLogin, AuthController.login);

router.get("/show", AuthMiddleware.checkToken, (req, res) => {
    res.status(200).send("You're authenticated again");
});

module.exports = router;
