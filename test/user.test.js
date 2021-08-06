// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

var assert = require('assert');
let faker = require("faker");
var chai = require("chai");
var chaiHttp = require("chai-http");
let should = chai.should();
const dbHandler = require("./db_handler");
const User = require("../src/models/user.model");

const server = require("../src/app");
chai.use(chaiHttp);

// Help source: https://stackoverflow.com/a/65223900
// const requester = chai.request(server).keepOpen();


// Connect to a new in-memory database before running any tests.
before(async () => await dbHandler.connect());

// Clear all test data after every test.
afterEach(async () => await dbHandler.clearDatabase());

// Remove and close the db and server.
after(async () => await dbHandler.closeDatabase());

// Fuente: https://mochajs.org/

// describe('Array', function () {
//     describe('#indexOf()', function () {
//         it('should return -1 when the value is not present', function () {
//             assert.equal([1, 2, 3].indexOf(4), -1);
//         });


//         it('¿2 + 2 = 4?', function () {
//             assert.equal(2 + 2, 4);
//         });
//     });
// });




describe("User", () => {
    describe("Model", () => {
        it("Get all users", async () => {
            let user = new User({
                name: faker.name.findName(), // Rowan Nikolaus
                username: faker.internet.userName(), // afuentes
                password: faker.internet.password(), // 123abc
                email: faker.internet.email() // Kassandra.Haley@erich.biz
            });
            await user.save();

            User.find({}, (err, users) => {
                assert(users.length > 0);
            });
        });

        it("Add a new user without any errors", () => {
            let body = {
                name: faker.name.findName(), // Rowan Nikolaus
                username: faker.internet.userName(), // afuentes
                password: faker.internet.password(), // 123abc
                email: faker.internet.email() // Kassandra.Haley@erich.biz
            };

            User.create(body, (err, user) => {
                if (err) assert(false);
                assert(user !== null);
            });
        });

        it("Add a new user and compare password", (done) => {
            let body = {
                name: faker.name.findName(), // Rowan Nikolaus
                username: faker.internet.userName(), // afuentes
                password: faker.internet.password(), // 123abc
                email: faker.internet.email() // Kassandra.Haley@erich.biz
            };

            User.create(body, (err, user) => {
                if (err) {
                    done(err);
                }
                // user.passwordComparison("feru", (err, res) => {
                user.passwordComparison(body.password, (err, res) => {
                    if (err || !res) {
                        done(err);
                    }

                    done()
                });
            });
        });

        it("Get the existing user", async () => {
            let user = new User();
            user.name = faker.name.findName(); // Rowan Nikolaus
            user.username = faker.internet.userName(); // afuentes
            user.password = faker.internet.password(); // 123abc
            user.email = faker.internet.email(); // Kassandra.Haley@erich.biz
            await user.save();

            User.findById(user._id, (err, searchedUser) => {
                if (err) assert(false);
                assert(searchedUser !== null);
            });
        });

        it("Change the user's name and email", async () => {
            let user = new User();
            user.name = faker.name.findName(); // Rowan Nikolaus
            user.username = faker.internet.userName(); // afuentes
            user.password = faker.internet.password(); // 123abc
            user.email = faker.internet.email(); // Kassandra.Haley@erich.biz
            await user.save();

            user.name = "fizz";
            user.email = "fizz@buzz.com";

            user.save((err, updatedUser) => {
                if (err) assert(false);
                let name = updatedUser.name === "fizz";
                let email = updatedUser.email === "fizz@buzz.com";
                assert(name && email);
            });
        });

        it("Remove a user", async () => {
            let user = new User();
            user.name = faker.name.findName(); // Rowan Nikolaus
            user.username = faker.internet.userName(); // afuentes
            user.password = faker.internet.password(); // 123abc
            user.email = faker.internet.email(); // Kassandra.Haley@erich.biz

            // Save the new user
            await user.save();

            // Remove the new user
            await user.delete();

            User.findById(user._id, (err, deletedUser) => {
                if (err) assert(false);
                assert(deletedUser === null);
            });
        });
    });


    describe("API", () => {
        describe("GET route /users", () => {
            // NOTE: it works when server is turned on
            it("Getting a 200 HTTP Code", (done) => {
                // requester
                chai
                    .request(server)
                    .get("/api/users")
                    .end((err, res) => {
                        if (err) {
                            console.error(err);
                            assert(false);
                        }

                        res.should.have.status(200);
                        done();
                    });
            });
        });

        describe("POST route /users", () => {
            // NOTE: it works when server is turned on
            it("Creating a right new user", (done) => {
                let user = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    username: faker.internet.userName(), // afuentes
                    password: faker.internet.password(), // 123abc
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                // requester
                chai
                    .request(server)
                    .post("/api/users")
                    .send(user)
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

                let user = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    username: faker.internet.userName(), // afuentes
                    password: "      ",
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                // requester
                chai
                    .request(server)
                    .post("/api/users")
                    .send(user)
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
            // NOTE: it works when server is turned on
            it("Getting an existing user", (done) => {
                let data = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    username: faker.internet.userName(), // afuentes
                    password: faker.internet.password(), // 123abc
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                let user = new User(data);
                user.save((err, newUser) => {
                    // console.log("New user", newUser);

                    // requester
                    chai
                        .request(server)
                        .get("/api/users/" + newUser._id)
                        .end((err, res) => {
                            if (err) {
                                console.error(err);
                                assert(false);
                            }


                            // console.log("Body", res.body);
                            res.should.have.status(200);
                            done();
                        });
                });
            });
        });

        describe("PUT route /users/:id", () => {
            it("Updating a user", (done) => {
                let data = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    username: faker.internet.userName(), // afuentes
                    password: faker.internet.password(), // 123abc
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                let user = new User(data);
                user.save((err, newUser) => {
                    let updatedData = {
                        name: faker.name.findName(), // Ricardo Lang
                        email: faker.internet.email() // Lupe.Kunze@yahoo.com
                    };

                    // requester
                    chai
                        .request(server)
                        .put("/api/users/" + newUser._id)
                        .send(updatedData)
                        .end((err, res) => {
                            if (err) {
                                console.error(err);
                                assert(false);
                            }

                            res.should.have.status(200);
                            done();
                        });
                });
            });

            it("Updating a user's password using whitespace(s)", (done) => {
                // Source: https://www.infosecmatter.com/spaces-in-passwords-good-or-a-bad-idea/

                let data = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    username: faker.internet.userName(), // afuentes
                    password: faker.internet.password(), // 123abc
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                let user = new User(data);
                user.save((err, newUser) => {
                    let updatedData = {
                        password: "     ",
                    };

                    // requester
                    chai
                        .request(server)
                        .put("/api/users/" + newUser._id)
                        .send(updatedData)
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

        });

        describe("DELETE route /users/:id", () => {
            // NOTE: it works when server is turned on
            it("Deleting a user", (done) => {
                let data = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    username: faker.internet.userName(), // afuentes
                    password: faker.internet.password(), // 123abc
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                let user = new User(data);
                user.save((err, newUser) => {
                    // requester
                    chai
                        .request(server)
                        .delete("/api/users/" + newUser._id)
                        .end((err, res) => {
                            if (err) {
                                console.error(err);
                                assert(false);
                            }

                            res.should.have.status(200);
                            done();
                        });
                });
            });
        });
    });
});


