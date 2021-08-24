// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { query } = require("express-validator");
const validation = include("services/validations");

exports.beforeIndex = [
    query("populate_with").trim(),
    query("select_only").trim(),
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
