// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { body, query } = require("express-validator");
const validation = require("../services/validations");

const User = require("../models/user.model.db");


/**
 * Check if email is already in use by a user.
 * Source of this method: https://stackoverflow.com/q/59764397
 * @param   string email
 * @param   object param1
 * @returns object [Promise]
 */
function emailAlreadyExists(email, { req }) {
    return User.findOne({
        email,
        _id: { $ne: req.params.id }
    }).then(user => {
        if (user !== null) {
            return Promise.reject("email already in use");
        }
    });
}

exports.beforeIndex = [
    query("name")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("name must not be empty"),
    query("email")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("email must not be empty")
        .isEmail()
        .withMessage("not a valid email"),
    validation
];

exports.beforeStore = [
    body("name", "name is required")
        .exists()
        .trim()
        .not().isEmpty()
        .withMessage("name must not be empty"),
    body("email", "email is required")
        .exists()
        .trim()
        .not().isEmpty()
        .withMessage("email must not be empty")
        .isEmail()
        .withMessage("not a valid email")
        .custom(emailAlreadyExists),
    validation
];

exports.beforeUpdate = [
    body("name")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("name must not be empty"),
    body("email")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("email must not be empty")
        .isEmail()
        .withMessage("not a valid email")
        .custom(emailAlreadyExists),
    validation
];
