var authRoutes = require("./api/auth.routes");
var v1Routes = require("./api/v1/index");

var express = require("express");
var router = express.Router();

router.use("/auth", authRoutes);
router.use("/v1", v1Routes);

module.exports = router;
