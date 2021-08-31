const CourseController = include("controllers/api/v1/course.controller");
const CourseMiddleware = include("middlewares/course.middleware");

const express = require("express");
const router = express.Router();

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
