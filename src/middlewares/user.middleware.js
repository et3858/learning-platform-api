// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { body, query } = require("express-validator");
const validation = include("services/validations");

const User = include("models/user.model");

/**
 * Returns a list of possible regex keywords to search by name.
 * @param   string name
 * @returns object
 */
function nameKeywords(name) {
    return { $in: name.replace(/\s+/g, " ").split(" ").map(keyword => new RegExp(keyword, "i")) };
    // Source: https://stackoverflow.com/a/53026977
}

/**
 * Check if email is already in use by a user.
 * Source of this method: https://stackoverflow.com/q/59764397
 * @param   string email
 * @param   object param1
 * @returns object [Promise]
 */
function emailAlreadyExists(email, { req }) {
    return User.findOne({
        email: new RegExp(email, "i"),
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
        .withMessage("name must not be empty")
        .customSanitizer(nameKeywords),
    query("email")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("email must not be empty")
        .isEmail()
        .withMessage("not a valid email")
        .toLowerCase(),
    validation
];

exports.beforeStore = [
    body("name", "name is required")
        .exists()
        .trim()
        .not().isEmpty()
        .withMessage("name must not be empty"),
    body("username", "username is required")
        .exists()
        .trim()
        .not().isEmpty()
        .withMessage("username must not be empty"),
    body("password", "password is required")
        .exists()
        .not().isEmpty()
        .withMessage("password must not be empty"),
    body("email", "email is required")
        .exists()
        .trim()
        .not().isEmpty()
        .withMessage("email must not be empty")
        .isEmail()
        .withMessage("not a valid email")
        .custom(emailAlreadyExists)
        .toLowerCase(),
    validation
];

exports.beforeUpdate = [
    body("name")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("name must not be empty"),
    body("username")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("username must not be empty"),
    body("password")
        .optional()
        .not().isEmpty()
        .withMessage("password must not be empty"),
    body("email")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("email must not be empty")
        .isEmail()
        .withMessage("not a valid email")
        .custom(emailAlreadyExists)
        .toLowerCase(),
    validation
];
