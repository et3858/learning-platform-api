const Course = require("../models/course.model");
const Lesson = require("../models/lesson.model");

const CourseController = {
    index: ((req, res) => {
        Course.find(req.query, (err, courses) => {
            if (err) return res.send(500, err.message);
            res.status(200).jsonp(courses);
        });
    }),
    getCourseBySlug: ((req, res) => {
        Course.findOne({ slug: req.params.courseSlug }, (err, course) => {
            if (err) return res.status(500).send(err.message);
            res.status(200).jsonp(course);
        });
    }),
    getLessonOfCourseBySlugs: ((req, res) => {
        Course.findOne({ slug: req.params.courseSlug }, (err, course) => {
            if (err) return res.status(500).send(err.message);

            Lesson.findOne({ slug: req.params.lessonSlug, course: course._id }, (err, lesson) => {
                if (err) return res.status(500).send(err.message);
                res.status(200).jsonp(lesson);
            });
        });
    })
};

module.exports = CourseController;
