var CategoryController = include("controllers/category.controller");
var CategoryMiddleware = include("middlewares/category.middleware");

var express = require("express");
var router = express.Router();

router
    .route("/")
    .get(CategoryMiddleware.beforeIndex, CategoryController.index);

module.exports = router;
