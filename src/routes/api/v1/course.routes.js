const CourseController = include("controllers/api/v1/course.controller");
const CourseMiddleware = include("middlewares/course.middleware");

const express = require("express");
const router = express.Router();

router
    .route("/")
    .get(CourseMiddleware.beforeIndex, CourseController.index);

router
    .route("/:id")
    .get(
        CourseMiddleware.validateIdParam,
        CourseMiddleware.beforeShow,
        CourseController.show
    );

router
    .route("/:id/lessons/:lessonID")
    .get(
        CourseMiddleware.validateIdParam,
        CourseMiddleware.validateLessonIdParam,
        CourseController.getLessonOfCourse
    );

module.exports = router;
