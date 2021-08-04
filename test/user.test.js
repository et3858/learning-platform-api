// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

var assert = require('assert');
let faker = require("faker");
var chai = require("chai");
var chaiHttp = require("chai-http");
let should = chai.should();
// const dbHandler = require("./db_handler");
const User = require("../models/user.model");

const server = require("../app");
chai.use(chaiHttp);

// Help source: https://stackoverflow.com/a/65223900
const requester = chai.request(server).keepOpen();


// Connect to a new in-memory database before running any tests.
// before(async () => await dbHandler.connect());

// Clear all test data after every test.
// afterEach(async () => await dbHandler.clearDatabase());

// Remove and close the db and server.
// after(async () => await dbHandler.closeDatabase());

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
        // Clear all test data after every test.
        afterEach(async () => await User.deleteMany({}));

        it("Get all users", async () => {
            let user = new User({
                name: "foo",
                email: "bar@baz.com"
            });
            await user.save();

            User.find({}, (err, users) => {
                assert(users.length > 0);
            });
        });

        it("Add a new user without any errors", () => {
            let body = {
                name: "foo",
                email: "bar@baz.com"
            };

            User.create(body, (err, user) => {
                if (err) assert(false);
                assert(user !== null);
            });
        });

        it("Get the existing user", async () => {
            let user = new User();
            user.name = "foo";
            user.email = "bar@baz.com";
            await user.save();

            User.findById(user._id, (err, searchedUser) => {
                if (err) assert(false);
                assert(searchedUser !== null);
            });
        });

        it("Change the user's name and email", async () => {
            let user = new User();
            user.name = "foo";
            user.email = "bar@baz.com";
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
            user.name = "foo";
            user.email = "bar@baz.com";

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


    describe("Api", () => {
        // Clear all test data after every test.
        afterEach(async () => {
            await User.deleteMany({});
        });

        describe("GET route /users", () => {
            // NOTE: it works when server is turned on
            it("Getting a 200 HTTP Code", (done) => {
                requester
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
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                requester
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
        });

        describe("GET route /users/:id", () => {
            // NOTE: it works when server is turned on
            it("Getting an existing user", (done) => {
                let data = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                let user = new User(data);
                user.save((err, newUser) => {
                    // console.log("New user", newUser);

                    requester
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
            // NOTE: it works when server is turned on
            it("Updating a user", (done) => {
                let data = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                let user = new User(data);
                user.save((err, newUser) => {
                    let updatedData = {
                        name: faker.name.findName(), // Ricardo Lang
                        email: faker.internet.email() // Lupe.Kunze@yahoo.com
                    };

                    requester
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
        });

        describe("DELETE route /users/:id", () => {
            // NOTE: it works when server is turned on
            it("Deleting a user", (done) => {
                let data = {
                    name: faker.name.findName(), // Rowan Nikolaus
                    email: faker.internet.email() // Kassandra.Haley@erich.biz
                };

                let user = new User(data);
                user.save((err, newUser) => {
                    requester
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


