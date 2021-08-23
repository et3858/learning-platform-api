var CourseController = include("controllers/api/v1/course.controller");
var CourseMiddleware = include("middlewares/course.middleware");

var express = require("express");
var router = express.Router();

router
    .route("/")
    .get(CourseMiddleware.beforeIndex, CourseController.index);

router
    .route("/:courseSlug")
    .get(CourseMiddleware.beforeShow, CourseController.getCourseBySlug);

router
    .route("/:courseSlug/:lessonSlug")
    .get(CourseController.getLessonOfCourseBySlugs);

module.exports = router;
