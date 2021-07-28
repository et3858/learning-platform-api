var CategoryController = require("../controllers/category.controller");
var CategoryMiddleware = require("../middlewares/category.middleware");

var express = require("express");
var router = express.Router();

router
    .route("/")
    .get(CategoryMiddleware.beforeIndex, CategoryController.index);

module.exports = router;
