const indexRouter = require("./web/index");

const express = require("express");
const router = express.Router();

router.use("/", indexRouter);

module.exports = router;
