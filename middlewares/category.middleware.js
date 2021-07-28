// Source: https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/

const { query } = require("express-validator");
const validation = require("../services/validations");

exports.beforeIndex = [
    query("populate_with").trim(),
    query("select_only").trim(),
    validation
];
