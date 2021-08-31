const categoryRoutes = require("./category.routes");
const courseRoutes = require("./course.routes");
const userRoutes = require("./user.routes");

const express = require("express");
const router = express.Router();

router.use("/categories", categoryRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);

module.exports = router;
