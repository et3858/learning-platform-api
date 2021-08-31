const AuthController = include("controllers/api/auth.controller");
const AuthMiddleware = include("middlewares/auth.middleware");

const express = require("express");
const router = express.Router();

router.post("/login", AuthMiddleware.beforeLogin, AuthController.login);

router.get("/show", AuthMiddleware.checkToken, (req, res) => {
    res.status(200).send("You're authenticated again");
});

module.exports = router;
