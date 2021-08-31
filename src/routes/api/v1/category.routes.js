const CategoryController = include("controllers/api/v1/category.controller");
const CategoryMiddleware = include("middlewares/category.middleware");

const express = require("express");
const router = express.Router();

router
    .route("/")
    .get(CategoryMiddleware.beforeIndex, CategoryController.index);

module.exports = router;
