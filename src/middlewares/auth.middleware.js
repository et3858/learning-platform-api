// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { body } = require("express-validator");
const validation = include("services/validations");

exports.beforeLogin = [
    body("username", "username is required")
        .exists()
        .trim()
        .not().isEmpty()
        .withMessage("username must not be empty"),
    body("password", "password is required")
        .exists()
        .not().isEmpty()
        .withMessage("password must not be empty"),
    validation
];
