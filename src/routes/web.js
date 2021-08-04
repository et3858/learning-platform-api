var indexRouter = require("./web/index");

var express = require("express");
var router = express.Router();

router.use("/", indexRouter);

module.exports = router;