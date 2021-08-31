const Course = include("models/course.model");
const Lesson = include("models/lesson.model");
const pagination = include("services/pagination");

const CourseController = {
    index: ((req, res) => {
        // Create a new object called 'query'
        // but removing 'populate_with', 'select_only', 'limit' and 'page' fields from 'req.query'
        // and isolating each of them ('populate_with', 'select_only', 'limit' and 'page') as independent variables
        const { populate_with, select_only, limit, page, ...query } = req.query;

        pagination.responder(
            Course.find(query, select_only, pagination.getOptions(limit, page)).populate(populate_with)
        )
            .then(data => res.status(200).jsonp(data))
            .catch(err => res.status(500).send(err.message));
    }),
    getCourseBySlug: ((req, res) => {
        Course
            .findOne({ slug: req.params.courseSlug }, (err, course) => {
                if (err) return res.status(500).send(err.message);
                res.status(200).jsonp(course);
            })
            .populate(req.query.populate_with)
            .select(req.query.select_only);
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
