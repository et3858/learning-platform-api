// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { param, query } = require("express-validator");
const validation = include("services/validations");

/**
 * Checks if there is an only dash without any characters followed
 * @param  {string} value
 * @return {bool}
 */
const checkDashes = value => !(value.split(" ").some(v => /^\-$/g.test(v)));

exports.validateIdParam = [
    param("id")
        .isMongoId() // NOTE: this method applies a 'trimEnd()' on the param.
        .withMessage("not a valid id"),
    validation
];

exports.beforeIndex = [
    query("populate_with").trim(),
    query("select_only").trim(),
    query("sort")
        .optional()
        .custom(checkDashes)
        .withMessage("a ('-') dash must not be alone or prefixed for a blank space"),
    query("page")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("page must not be empty")
        .isNumeric()
        .withMessage("page must be a number")
        .toInt()
        .isInt({ gt: -1 })
        .withMessage("page must be greater than or equal to zero")
        .customSanitizer(value => value > 0 ? value : 1),
    query("limit")
        .optional()
        .trim()
        .not().isEmpty()
        .withMessage("limit must not be empty")
        .isNumeric()
        .withMessage("limit must be a number")
        .toInt()
        .isInt({ gt: -1 })
        .withMessage("limit must be greater than or equal to zero"),
    validation
];

exports.beforeShow = [
    query("populate_with").trim(),
    query("select_only").trim(),
    validation
];
