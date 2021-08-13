// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { body, header, validationResult } = require("express-validator");
const auth = include("config/auth");
const jwt = require("jsonwebtoken");
const validation = include("services/validations");

/**
 * Check if token is valid.
 * @param   string token     [It must start with 'Bearer ']
 * @returns object [Promise]
 */
async function isTokenVerified(token) {
    return jwt.verify(token.split(" ")[1], auth.jwt.secret, (err) => {
        if (err) return Promise.reject();
    });
}

/**
 * Returns a function that validates some fields
 * @param   int      status
 * @returns function
 */
function validate(status) {
    return (req, res, next) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) return next();

        res.status(status).json({
            errors: errors.array()
        });
    }
}

const verifyToken = [
    header("authorization", "a token is required for authentication")
        .exists()
        .trim()
        .not().isEmpty()
        .custom(token => token.startsWith("Bearer ")),
    validate(403)
];

const validateToken = [
    header("authorization")
        .custom(isTokenVerified)
        .withMessage("invalid token"),
    validate(401)
];

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

exports.checkToken = [verifyToken, validateToken];
