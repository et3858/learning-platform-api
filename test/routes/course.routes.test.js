// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

const faker = require("faker");
const chai = require("chai");
const chaiDT = require("chai-datetime");
const chaiHttp = require("chai-http");
const chaiSorted = require("chai-sorted");
chai.should();
const dbHandler = require("../db_handler");
const Course = require("../../src/models/course.model");
const Lesson = require("../../src/models/lesson.model");

const server = require("../../src/app");
chai.use(chaiDT);
chai.use(chaiHttp);
chai.use(chaiSorted);

// Help source: https://stackoverflow.com/a/65223900
// const requester = chai.request(server).keepOpen();


/**
 * Returns fake data to populate courses
 * @param  {int}   n
 * @return {array}
 */
function getFakeCourses(n) {
    const arr = [];

    for (let i = 0; i < n; i++) {
        arr.push({
            name: faker.lorem.words(),
            excerpt: faker.lorem.sentences(),
            content: faker.lorem.paragraphs(),
            slug: faker.lorem.slug(),
            release_date: faker.date.between("2018-01-01", "2021-12-31"),
        });
    }

    return arr;
}

/**
 * Returns fake data to populate lessons
 * @param  {int}    n
 * @param  {object} course [ObjectId]
 * @return {array}
 */
function getFakeLessons(n = 0, course = null) {
    const arr = [];

    for (let i = 0; i < n; i++) {
        const duration = faker.datatype.number({
            "min": 30,
            "max": 3600
        });

        arr.push({
            name: faker.lorem.words(),
            description: faker.lorem.paragraphs(),
            slug: faker.lorem.slug(),
            position: i + 1,
            duration,
            is_free: false,
            course,
        });
    }

    return arr;
}


// Connect to a new in-memory database before running any tests.
before(async () => await dbHandler.connect());

// Clear all test data after every test.
afterEach(async () => await dbHandler.clearDatabase());

// Remove and close the db and server.
after(async () => await dbHandler.closeDatabase());


describe("Course Routes", () => {
    const endpoint = "/api/v1/courses";
    let courses;

    beforeEach(() => courses = getFakeCourses(5));

    describe("GET route /courses", () => {
        it("Get no courses", (done) => {
            // requester
            chai
                .request(server)
                .get(endpoint)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    res.body.data.should.be.an("array").that.is.empty;
                    done();
                });
        });

        it("Get all courses", (done) => {
            Course.insertMany(courses, (err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        res.body.should.have.property("data");
                        res.body.data.should.be.an("array");
                        res.body.data.length.should.be.above(0);
                        res.body.data.every(
                            c => c.should.include.all.keys("name", "excerpt", "content", "slug", "release_date")
                        );
                        // Help source: https://github.com/chaijs/chai/issues/410#issuecomment-344967338

                        done();
                    });
            });
        });

        it("Get all courses sorted by ascending name", (done) => {
            Course.insertMany(courses, (err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint)
                    .query({ sort: "name" })
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        res.body.should.have.property("data");
                        res.body.data.should.be.an("array");
                        res.body.data.length.should.be.above(0);
                        res.body.data.every(c => c.should.include.all.keys("name"));
                        res.body.data.should.be.sortedBy("name");
                        done();
                    });
            });
        });

        it("Get all courses sorted by descending name", (done) => {
            Course.insertMany(courses, (err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint)
                    .query({ sort: "-name" })
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        res.body.should.have.property("data");
                        res.body.data.should.be.an("array");
                        res.body.data.length.should.be.above(0);
                        res.body.data.every(c => c.should.include.all.keys("name"));
                        res.body.data.should.be.sortedBy("name", { descending: true });
                        done();
                    });
            });
        });

        it("Get courses limited by 3", (done) => {
            const limit = 3;

            Course.insertMany(courses, (err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint)
                    .query({ limit })
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        res.body.should.have.property("data");
                        res.body.data.should.be.an("array");
                        res.body.data.should.have.lengthOf(limit);
                        done();
                    });
            });
        });

        it("SHOULD get error 422 when passing only a dash without a followed property", (done) => {
            const sort = "-";

            // requester
            chai
                .request(server)
                .get(endpoint)
                .query({ sort })
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(422);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([{
                        value: sort,
                        msg: "a ('-') dash must not be alone or prefixed for a blank space",
                        param: "sort",
                        location: "query"
                    }]);
                    done();
                });
        });

        describe("Pagination", () => {
            beforeEach(() => courses = getFakeCourses(10));

            const tests = [
                { limit: 2, page: 2, expected: 2 },
                { limit: 3, page: 1, expected: 3 },
                { limit: 4, page: 3, expected: 2 },
                { limit: 6, page: 2, expected: 4 },
                { limit: 7, page: 2, expected: 3 },
                { limit: 9, page: 2, expected: 1 },
                { limit: 10, page: 1, expected: 10 },
            ];

            tests.forEach(({ limit, page, expected }) => {
                it(`Get courses with results limited by ${limit} on the page ${page}`, (done) => {
                    const len = courses.length;

                    Course.insertMany(courses, (err) => {
                        if (err) done(err);

                        // requester
                        chai
                            .request(server)
                            .get(endpoint)
                            .query({ limit, page })
                            .end((err, res) => {
                                if (err) done(err);
                                res.should.have.status(200);
                                res.body.should.have.property("data");
                                res.body.should.have.property("pagination");
                                res.body.data.should.be.an("array");
                                res.body.data.should.have.lengthOf(expected);
                                res.body.pagination.should.be.an("object");
                                res.body.pagination.should.include.all.keys(
                                    "total",
                                    "per_page",
                                    "current_page",
                                    "prev_page",
                                    "next_page",
                                    "total_pages",
                                    "links",
                                );
                                res.body.pagination.total.should.equal(len);
                                res.body.pagination.per_page.should.equal(limit);
                                res.body.pagination.current_page.should.equal(page);
                                res.body.pagination.total_pages.should.equal(Math.ceil(len / limit));
                                res.body.pagination.links.should.include.all.keys("first", "last", "prev", "next");

                                if (page > 1) {
                                    res.body.pagination.prev_page.should.equal(page - 1);
                                } else {
                                    (res.body.pagination.prev_page === null).should.be.true;
                                }

                                if ((page * limit) < len) {
                                    res.body.pagination.next_page.should.equal(page + 1);
                                } else {
                                    (res.body.pagination.next_page === null).should.be.true;
                                }

                                done();
                            });
                    });
                });
            });
        });

        describe("Bad pagination", () => {
            const notEmptyMsg = "must not be empty";
            const numberMsg = "must be a number";
            const gteMsg ="must be greater than or equal to zero";

            const tests = [
                { limit: "", page: -1, limit_msg: `limit ${notEmptyMsg}`, page_msg: `page ${gteMsg}` },
                { limit: "a", page: "", limit_msg: `limit ${numberMsg}`, page_msg: `page ${notEmptyMsg}` },
                { limit: -1, page: "<>", limit_msg: `limit ${gteMsg}`, page_msg: `page ${numberMsg}` },
            ];

            tests.forEach(({ limit, page, limit_msg, page_msg }) => {
                it(`SHOULD get error 422 when paginating with: limit '${limit}' and page '${page}'.`, (done) => {
                    // requester
                    chai
                        .request(server)
                        .get(endpoint)
                        .query({ limit, page })
                        .end((err, res) => {
                            if (err) done(err);
                            res.should.have.status(422);
                            res.body.should.have.property("errors");
                            res.body.errors.should.be.an("array");
                            res.body.errors.should.include.deep.members([
                                {
                                    value: limit,
                                    msg: limit_msg,
                                    param: "limit",
                                    location: "query"
                                },
                                {
                                    value: page,
                                    msg: page_msg,
                                    param: "page",
                                    location: "query"
                                },
                            ]);
                            done();
                        });
                });
            });
        });
    });

    describe("GET route /courses/:courseSlug", () => {
        it("Getting an existing course", (done) => {
            const course = courses[Math.floor(Math.random() * courses.length)];

            Course.insertMany(courses, (err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint + "/" + course.slug)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        res.body.should.have.property("data");
                        res.body.data.should.not.be.a("null");
                        res.body.data.should.be.an("object");
                        res.body.data.should.include.all.keys("name", "excerpt", "content", "slug", "release_date");
                        res.body.data.slug.should.equal(course.slug);
                        res.body.data.name.should.equal(course.name);
                        res.body.data.excerpt.should.equal(course.excerpt);
                        res.body.data.content.should.equal(course.content);
                        new Date(res.body.data.release_date).should.equalDate(course.release_date);
                        done();
                    });
            });
        });

        it("Getting a non existing course", (done) => {
            const fakeSlug = "a-fake-slug";

            // requester
            chai
                .request(server)
                .get(endpoint + "/" + fakeSlug)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(404);
                    res.body.should.not.have.property("data");
                    res.body.should.have.property("message");
                    res.body.message.should.have.string("Not Found");
                    done();
                });
        });

        describe("GET route /courses/:courseSlug/:lessonSlug", () => {
            let course = null;
            let lessons = null;

            beforeEach(async () => {
                courses = getFakeCourses(1);
                course = await Course.create(courses[0]);

                lessons = getFakeLessons(3, course._id);
                lessons = await Lesson.insertMany(lessons);

                // Update course attaching its lessons
                course.lessons.push({ $each: lessons.map(l => l._id) });
                await course.save();
            });

            it("Getting an existing lesson of a course", (done) => {
                const lesson = lessons[Math.floor(Math.random() * lessons.length)];

                // requester
                chai
                    .request(server)
                    .get(endpoint + "/" + course.slug + "/" + lesson.slug)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(200);
                        res.body.should.have.property("data");
                        res.body.data.should.not.be.a("null");
                        res.body.data.should.be.an("object");
                        res.body.data.should.include.all.keys(
                            "name",
                            "description",
                            "slug",
                            "position",
                            "duration",
                            "course"
                        );
                        res.body.data.slug.should.equal(lesson.slug);
                        res.body.data.name.should.equal(lesson.name);
                        res.body.data.description.should.equal(lesson.description);
                        res.body.data.position.should.equal(lesson.position);
                        res.body.data.duration.should.equal(lesson.duration);
                        res.body.data.course.should.equal(lesson.course.toString()).and.equal(course._id.toString());
                        done();
                    });
            });

            it("Getting a non existing lesson of a course", (done) => {
                const fakeSlug = "a-fake-slug";

                // requester
                chai
                    .request(server)
                    .get(endpoint + "/" + course.slug + "/" + fakeSlug)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(404);
                        res.body.should.not.have.property("data");
                        res.body.should.have.property("message");
                        res.body.message.should.have.string("Not Found");
                        done();
                    });
            });

            it("Getting a lesson of a non existing course", (done) => {
                const lesson = lessons[Math.floor(Math.random() * lessons.length)];
                const fakeSlug = "a-fake-slug";

                // requester
                chai
                    .request(server)
                    .get(endpoint + "/" + fakeSlug + "/" + lesson.slug)
                    .end((err, res) => {
                        if (err) done(err);
                        res.should.have.status(404);
                        res.body.should.not.have.property("data");
                        res.body.should.have.property("message");
                        res.body.message.should.have.string("Not Found");
                        done();
                    });
            });
        });
    });
});


