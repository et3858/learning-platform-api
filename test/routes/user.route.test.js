// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

var assert = require('assert');
let faker = require("faker");
var chai = require("chai");
var chaiHttp = require("chai-http");
let should = chai.should();
const dbHandler = require("../db_handler");
const User = require("../../src/models/user.model");

const server = require("../../src/app");
chai.use(chaiHttp);

// Help source: https://stackoverflow.com/a/65223900
// const requester = chai.request(server).keepOpen();


// Connect to a new in-memory database before running any tests.
before(async () => await dbHandler.connect());

// Clear all test data after every test.
afterEach(async () => await dbHandler.clearDatabase());

// Remove and close the db and server.
after(async () => await dbHandler.closeDatabase());


describe("User Routes", () => {

    let body;
    let endpoint = "/api/users";

    beforeEach(() => {
        body = {
            name: faker.name.findName(), // Rowan Nikolaus
            username: faker.internet.userName(), // afuentes
            password: faker.internet.password(), // 123abc
            email: faker.internet.email() // Kassandra.Haley@erich.biz
        };
    });

    describe("GET route /users", () => {
        it("Get no users", (done) => {
            // requester
            chai
                .request(server)
                .get(endpoint)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(200);
                    res.body.should.be.an("array").that.is.empty;
                    done();
                });
        });

        it("Get all users", (done) => {
            let user = new User(body);
            user.save((err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        res.body.should.be.an("array");
                        res.body.length.should.be.above(0);
                        res.body.every(
                            u => u.should.include.all.keys("name", "username", "email").but.not.have.all.keys("password")
                        );
                        // Help source: https://github.com/chaijs/chai/issues/410#issuecomment-344967338

                        done();
                    });
            });
        });

        it("SHOULD have error 422 if name field is empty", (done) => {
            // requester
            chai
                .request(server)
                .get(endpoint)
                .query({ name: "" })
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(422);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([{
                        value: "",
                        msg: "name must not be empty",
                        param: "name",
                        location: "query"
                    }]);
                    done();
                });
        });

        describe("Bad emails", () => {
            let notEmptyMsg = "email must not be empty";
            let notValidMsg = "not a valid email";

            let tests = [
                { email: "", msg: notEmptyMsg },
                { email: "     ", msg: notEmptyMsg },
                { email: "foo", msg: notValidMsg },
                { email: "foo bar", msg: notValidMsg },
                { email: "foo@bar", msg: notValidMsg },
                { email: "foo.bar", msg: notValidMsg },
                { email: "foo.bar@baz", msg: notValidMsg },
                { email: "foo@bar,baz", msg: notValidMsg },
                { email: "foo@bar:baz", msg: notValidMsg },
                { email: "foo@bar..baz", msg: notValidMsg },
                { email: "<foo@bar.baz>", msg: notValidMsg },
            ];

            tests.forEach(({ email, msg }) => {
                it(`SHOULD have error 422 if email field is "${email}"`, (done) => {
                    // requester
                    chai
                        .request(server)
                        .get(endpoint)
                        .query({ email })
                        .end((err, res) => {
                            if (err) done(err);

                            res.should.have.status(422);
                            res.body.should.have.property("errors");
                            res.body.errors.should.be.an("array");
                            res.body.errors.should.include.deep.members([{
                                value: email.trim(),
                                msg: msg,
                                param: "email",
                                location: "query"
                            }]);

                            done();
                        });
                });
            });
        });
    });

    describe("POST route /users", () => {
        it("Creating a right new user", (done) => {
            // requester
            chai
                .request(server)
                .post(endpoint)
                .send(body)
                .end((err, res) => {
                    if (err) {
                        console.error(err);
                        assert(false);
                    }
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.not.have.property("errors");
                    res.body.should.have.property("name");
                    res.body.should.have.property("email");
                    done();
                });
        });

        it("Creating a user using whitespace(s) in a password", (done) => {
            // Source: https://www.infosecmatter.com/spaces-in-passwords-good-or-a-bad-idea/

            // Set the password fields with whitespaces only
            body.password = "      ";

            // requester
            chai
                .request(server)
                .post(endpoint)
                .send(body)
                .end((err, res) => {
                    if (err) {
                        console.error(err);
                        assert(false);
                    }

                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    res.body.should.not.have.property("errors");
                    done();
                });
        });
    });

    describe("GET route /users/:id", () => {
        it("Getting an existing user", (done) => {
            let user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint + "/" + newUser._id)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        res.body.should.not.be.a("null");
                        res.body.should.be.an("object");
                        res.body.should.include.all.keys("_id", "name", "username", "email").but.not.have.all.keys("password")
                        res.body._id.toString().should.equal(newUser._id.toString());
                        done();
                    });
            });
        });
    });

    describe("PUT route /users/:id", () => {
        it("Updating a user", (done) => {
            let user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                let updatedBody = {
                    name: faker.name.findName(), // Ricardo Lang
                    email: faker.internet.email() // Lupe.Kunze@yahoo.com
                };

                // requester
                chai
                    .request(server)
                    .put(endpoint + "/" + newUser._id)
                    .send(updatedBody)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        res.body.should.be.an("object");
                        res.body.should.have.property("name");
                        res.body.should.have.property("email");
                        res.body.name.should.equal(updatedBody.name).not.equal(newUser.name);
                        res.body.email.should.equal(updatedBody.email.toLowerCase()).not.equal(newUser.email);
                        done();
                    });
            });
        });

        it("Updating a user's password using whitespace(s)", (done) => {
            // Source: https://www.infosecmatter.com/spaces-in-passwords-good-or-a-bad-idea/

            let user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                let updatedBody = {
                    password: "     ",
                };

                // requester
                chai
                    .request(server)
                    .put(endpoint + "/" + newUser._id)
                    .send(updatedBody)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.not.have.property("errors");
                        done();
                    });
            });
        });

    });

    describe("DELETE route /users/:id", () => {
        it("Deleting a user", (done) => {
            let user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .delete(endpoint + "/" + newUser._id)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        done();
                    });
            });
        });
    });
});


