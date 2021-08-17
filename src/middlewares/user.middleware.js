// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { body, param, query } = require("express-validator");
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
 * Check if a user already exists by conditions.
 * @param   object conditions
 * @param   string feedback
 * @returns object [Promise]
 */
function userAlreadyExists(conditions, feedback) {
    return User.findOne(conditions).then(user => {
        if (user !== null) return Promise.reject(feedback);
    });
}

/**
 * Check if username is already in use by a user.
 * Source of this method: https://stackoverflow.com/q/59764397
 * @param   string username
 * @param   object param1
 * @returns object [Promise]
 */
function usernameAlreadyExists(username, { req }) {
    return userAlreadyExists({
        username: new RegExp(username, "i"),
        _id: { $ne: req.params.id }
    }, "username already in use");
}

/**
 * Check if email is already in use by a user.
 * Source of this method: https://stackoverflow.com/q/59764397
 * @param   string email
 * @param   object param1
 * @returns object [Promise]
 */
function emailAlreadyExists(email, { req }) {
    return userAlreadyExists({
        email: new RegExp(email, "i"),
        _id: { $ne: req.params.id }
    }, "email already in use");
}

exports.validateIdParam = [
    param("id")
        .isMongoId() // NOTE: this method applies a 'trimEnd()' on the param.
        .withMessage("not a valid id"),
    validation
];

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
        .withMessage("username must not be empty")
        .custom(usernameAlreadyExists),
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
        .withMessage("username must not be empty")
        .custom(usernameAlreadyExists),
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
