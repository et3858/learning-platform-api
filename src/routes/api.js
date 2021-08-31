const authRoutes = require("./api/auth.routes");
const v1Routes = require("./api/v1/index");

const express = require("express");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/v1", v1Routes);

module.exports = router;
