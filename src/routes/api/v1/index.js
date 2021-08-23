var categoryRoutes = require("./category.routes");
var courseRoutes = require("./course.routes");
var userRoutes = require("./user.routes");

var express = require("express");
var router = express.Router();

router.use("/categories", categoryRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);

module.exports = router;
