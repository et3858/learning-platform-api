var categoriesRouter = require("./api/categories");
var coursesRouter = require("./api/courses");
var usersRouter = require("./api/users");

var express = require("express");
var router = express.Router();

router.use("/categories", categoriesRouter);
router.use("/courses", coursesRouter);
router.use("/users", usersRouter);

module.exports = router;
