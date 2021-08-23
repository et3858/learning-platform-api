const Course = include("models/course.model");
const Lesson = include("models/lesson.model");

const CourseController = {
    index: ((req, res) => {
        // Create a new object called 'query'
        // but removing 'populate_with' and 'select_only' fields from 'req.query'
        // and isolating each of them ('populate_with' and 'select_only') as a string variable
        const { populate_with, select_only, ...query } = req.query;

        Course
            .find(query, (err, courses) => {
                if (err) return res.send(500, err.message);
                res.status(200).jsonp(courses);
            })
            .populate(populate_with)
            .select(select_only);
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
