var CourseController = require("../controllers/course.controller");

var express = require("express");
var router = express.Router();

router
    .route("/")
    .get(CourseController.index);

router
    .route("/:courseSlug")
    .get(CourseController.getCourseBySlug);

router
    .route("/:courseSlug/:lessonSlug")
    .get(CourseController.getLessonOfCourseBySlugs);

module.exports = router;
