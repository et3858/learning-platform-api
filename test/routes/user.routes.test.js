// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

require("../db_helper");

const faker = require("faker");
const chai = require("chai");
const chaiDT = require("chai-datetime");
const chaiHttp = require("chai-http");
chai.should();
const User = require("../../src/models/user.model");

const server = require("../../src/app");
chai.use(chaiDT);
chai.use(chaiHttp);

// Help source: https://stackoverflow.com/a/65223900
// const requester = chai.request(server).keepOpen();


/**
 * Returns fake data to create or update a user
 * @return {object}
 */
function getUserBody() {
    return {
        name: faker.name.findName(), // Rowan Nikolaus
        username: faker.internet.userName(), // afuentes
        password: faker.internet.password(), // 123abc
        email: faker.internet.email() // Kassandra.Haley@erich.biz
    };
}


describe("User Routes", () => {
    const endpoint = "/api/v1/users";
    let body;

    beforeEach(() => body = getUserBody());

    describe("GET route /users", () => {
        it("Get no users", (done) => {
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

        it("Get all users", (done) => {
            const user = new User(body);
            user.save((err) => {
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
                        res.body.data.every(user => (
                            user
                                .should.include.all.keys("name", "username", "email")
                                .but.not.have.all.keys("password")
                        ));
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
            const notEmptyMsg = "email must not be empty";
            const notValidMsg = "not a valid email";

            const tests = [
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
                    if (err) done(err);

                    res.should.have.status(201);
                    res.body.should.have.property("data");
                    res.body.data.should.be.a("object");
                    res.body.data.should.not.have.property("errors");
                    res.body.data.should.have.property("name");
                    res.body.data.should.have.property("email");
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
                    if (err) done(err);

                    res.should.have.status(201);
                    res.body.should.have.property("data");
                    res.body.data.should.be.a("object");
                    res.body.data.should.not.have.property("errors");
                    done();
                });
        });

        it("Creating a user but it prevents adding arbitrary datetime values to the timestamps", (done) => {
            const dt = new Date(2010, 1, 1);
            body.created_at = dt;
            body.updated_at = dt;

            // requester
            chai
                .request(server)
                .post(endpoint)
                .send(body)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(201);
                    res.body.should.not.have.property("errors");
                    res.body.should.have.property("data");
                    res.body.data.should.be.a("object");
                    res.body.data.should.have.property("created_at");
                    res.body.data.should.have.property("updated_at");
                    new Date(res.body.data.created_at).should.not.equalDate(body.created_at);
                    new Date(res.body.data.updated_at).should.not.equalDate(body.updated_at);
                    done();
                });
        });

        it("SHOULD get error 404 when adding a parameter", (done) => {
            // requester
            chai
                .request(server)
                .post(endpoint + "/lorem")
                .send(body)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(404);
                    res.text.should.include("Not Found");
                    done();
                });
        });

        it("SHOULD get error 422 when sending an '_id' field inside the request", (done) => {
            const fakeID = "0123456789abcdef01234567";

            // requester
            chai
                .request(server)
                .post(endpoint)
                .send({ _id: fakeID })
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(422);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([{
                        value: fakeID,
                        msg: "id field must not be included",
                        param: "_id",
                        location: "body"
                    }]);
                    done();
                });
        });

        it("SHOULD get error 422 if there aren't all required parameters", (done) => {
            // requester
            chai
                .request(server)
                .post(endpoint)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(422);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([
                        { msg: "name is required", param: "name", location: "body" },
                        { msg: "email is required", param: "email", location: "body" },
                        { msg: "username is required", param: "username", location: "body" },
                        { msg: "password is required", param: "password", location: "body" },
                    ]);
                    done();
                });
        });

        it("SHOULD get error 422 if username and/or email are already in use", (done) => {
            const user = new User(body);
            user.save((err) => {
                if (err) done(err);

                const updatedBody = {
                    email: user.email,
                    username: user.username,
                };

                // requester
                chai
                    .request(server)
                    .post(endpoint)
                    .send(updatedBody)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(422);
                        res.body.should.have.property("errors");
                        res.body.errors.should.be.an("array");
                        res.body.errors.should.include.deep.members([
                            {
                                value: updatedBody.email,
                                msg: "email already in use",
                                param: "email",
                                location: "body"
                            },
                            {
                                value: updatedBody.username,
                                msg: "username already in use",
                                param: "username",
                                location: "body"
                            },
                        ]);
                        done();
                    });
            });
        });
    });

    describe("GET route /users/:id", () => {
        it("Getting an existing user", (done) => {
            const user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .get(endpoint + "/" + newUser._id)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        res.body.should.have.property("data");
                        res.body.data.should.not.be.a("null");
                        res.body.data.should.be.an("object");
                        res.body.data
                            .should.include.all.keys("_id", "name", "username", "email")
                            .but.not.have.all.keys("password");
                        res.body.data._id.toString().should.equal(newUser._id.toString());
                        done();
                    });
            });
        });

        it("Getting a non existing user", (done) => {
            const fakeID = "0123456789abcdef01234567";

            // requester
            chai
                .request(server)
                .get(endpoint + "/" + fakeID)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    (res.body.data === null).should.be.true;
                    done();
                });
        });

        describe("Bad ID params", () => {
            const tests = [
                "a",
                "1",
                "abc",
                "xyz",
                "123",
                "0123456789abcdef0123456g",
                "0123456789abcdef0123456",
                "0123456789abcdef0123456 ",
                " 0123456789abcdef0123456",
                "0123456789abcdefghijklmn",
                "ghijklmnopqrstuvwxyz0123",
                "0123456789abcdef012345678",
                "0123456789abcdef0123456",
            ];

            tests.forEach((fakeID) => {
                it(`SHOULD have error 422 if 'id' param is not valid: "${fakeID}"`, (done) => {
                    // requester
                    chai
                        .request(server)
                        .get(endpoint + "/" + fakeID)
                        .end((err, res) => {
                            if (err) done(err);

                            res.should.have.status(422);
                            res.body.should.have.property("errors");
                            res.body.errors.should.be.an("array");
                            res.body.errors.should.include.deep.members([{
                                value: fakeID.trimEnd(),
                                msg: "not a valid id",
                                param: "id",
                                location: "params"
                            }]);
                            done();
                        });
                });
            });
        });
    });

    describe("PUT route /users/:id", () => {
        it("Updating a user", (done) => {
            const user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                const updatedBody = {
                    name: faker.name.findName(), // Ricardo Lang
                    username: faker.internet.userName(), // Ricardo Lang
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
                        res.body.should.have.property("data");
                        res.body.data
                            .should.include.all.keys("_id", "name", "username", "email")
                            .but.not.have.all.keys("password");
                        res.body.data.name.should.equal(updatedBody.name).not.equal(newUser.name);
                        res.body.data.username.should.equal(updatedBody.username).not.equal(newUser.username);
                        res.body.data.email.should.equal(updatedBody.email.toLowerCase()).not.equal(newUser.email);
                        done();
                    });
            });
        });

        it("Updating a user's password using whitespace(s)", (done) => {
            // Source: https://www.infosecmatter.com/spaces-in-passwords-good-or-a-bad-idea/

            const user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                const updatedBody = {
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
                        res.body.should.not.have.property("errors");
                        res.body.should.have.property("data");
                        res.body.data.should.be.a("object");
                        done();
                    });
            });
        });

        it("Updating a user but it prevents adding arbitrary datetime values to the timestamps", (done) => {
            const user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                const dt = new Date(2010, 1, 1);
                const updatedBody = {
                    created_at: dt,
                    updated_at: dt
                };

                // requester
                chai
                    .request(server)
                    .put(endpoint + "/" + newUser._id)
                    .send(updatedBody)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        res.body.should.not.have.property("errors");
                        res.body.should.have.property("data");
                        res.body.data.should.be.a("object");
                        res.body.data.should.have.property("created_at");
                        res.body.data.should.have.property("updated_at");
                        new Date(res.body.data.created_at).should.equalDate(newUser.created_at);
                        new Date(res.body.data.created_at).should.not.equalDate(updatedBody.created_at);
                        new Date(res.body.data.updated_at).should.not.equalDate(updatedBody.updated_at);
                        done();
                    });
            });
        });

        it("SHOULD get error 404 when not adding a parameter", (done) => {
            // requester
            chai
                .request(server)
                .put(endpoint)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(404);
                    res.text.should.include("Not Found");
                    done();
                });
        });

        it("SHOULD get 'null' when updating a non existing user", (done) => {
            const fakeID = "0123456789abcdef01234567";

            // requester
            chai
                .request(server)
                .put(endpoint + "/" + fakeID)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(200);
                    res.body.should.have.property("data");
                    (res.body.data === null).should.be.true;
                    done();
                });
        });

        it("SHOULD get error 422 when sending an '_id' field inside the request", (done) => {
            const user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .put(endpoint + "/" + newUser._id)
                    .send({ _id: newUser._id })
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(422);
                        res.body.should.have.property("errors");
                        res.body.errors.should.be.an("array");
                        res.body.errors.should.include.deep.members([{
                            value: newUser._id.toString(),
                            msg: "id field must not be included",
                            param: "_id",
                            location: "body"
                        }]);
                        done();
                    });
            });
        });

        it("SHOULD get error 422 if username and/or email are already in use", (done) => {
            User.insertMany([getUserBody(), getUserBody()], (err, users) => {
                if (err) done(err);

                const user1 = users[0];
                const user2 = users[1];

                const updatedBody = {
                    username: user1.username,
                    email: user1.email
                };

                // requester
                chai
                    .request(server)
                    .put(endpoint + "/" + user2._id)
                    .send(updatedBody)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(422);
                        res.body.should.have.property("errors");
                        res.body.errors.should.be.an("array");
                        res.body.errors.should.include.deep.members([
                            {
                                value: updatedBody.email,
                                msg: "email already in use",
                                param: "email",
                                location: "body"
                            },
                            {
                                value: updatedBody.username,
                                msg: "username already in use",
                                param: "username",
                                location: "body"
                            },
                        ]);
                        done();
                    });
            });
        });
    });

    describe("DELETE route /users/:id", () => {
        it("Deleting a user", (done) => {
            const user = new User(body);
            user.save((err, newUser) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .delete(endpoint + "/" + newUser._id)
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(204);
                        res.body.should.be.empty;
                        done();
                    });
            });
        });

        it("SHOULD get error 404 when not adding a parameter", (done) => {
            // requester
            chai
                .request(server)
                .delete(endpoint)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(404);
                    res.text.should.include("Not Found");
                    done();
                });
        });
    });
});


