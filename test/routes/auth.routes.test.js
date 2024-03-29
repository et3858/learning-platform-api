// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

require("../db_helper");

const faker = require("faker");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
const User = require("../../src/models/user.model");

const server = require("../../src/app");
chai.use(chaiHttp);

// Help source: https://stackoverflow.com/a/65223900
// const requester = chai.request(server).keepOpen();


describe("Auth Routes", () => {
    const endpoint = "/api/auth";
    let body;

    beforeEach(() => {
        body = {
            name: faker.name.findName(), // Rowan Nikolaus
            username: faker.internet.userName(), // afuentes
            password: faker.internet.password(), // 123abc
            email: faker.internet.email() // Kassandra.Haley@erich.biz
        };
    });

    describe("POST route /login", () => {
        it("SHOULD NOT validate a missing username", (done) => {
            // requester
            chai
                .request(server)
                .post(`${endpoint}/login`)
                .send({ password: body.password })
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(422);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([{
                        msg: "username is required",
                        param: "username",
                        location: "body"
                    }]);
                    done();
                });
        });

        it("SHOULD NOT validate a missing password", (done) => {
            // requester
            chai
                .request(server)
                .post(`${endpoint}/login`)
                .send({ username: body.username })
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(422);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([{
                        msg: "password is required",
                        param: "password",
                        location: "body"
                    }]);
                    done();
                });
        });

        it("SHOULD NOT validate empty username and/or password", (done) => {
            // requester
            chai
                .request(server)
                .post(`${endpoint}/login`)
                .send({
                    username: "",
                    password: ""
                })
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(422);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([
                        {
                            value: "",
                            msg: "username must not be empty",
                            param: "username",
                            location: "body"
                        },
                        {
                            value: "",
                            msg: "password must not be empty",
                            param: "password",
                            location: "body"
                        }
                    ]);

                    done();
                });
        });

        it("SHOULD NOT login by a missing username", (done) => {
            // requester
            chai
                .request(server)
                .post(`${endpoint}/login`)
                .send({
                    username: body.username,
                    password: body.password
                })
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(401);
                    res.text.should.equal("unauthenticated user or password");
                    done();
                });
        });

        it("SHOULD NOT the new user login by an incorrect password", (done) => {
            const user = new User(body);
            user.save((err) => {
                if (err) done(err);

                const newPassword = faker.internet.password();

                // requester
                chai
                    .request(server)
                    .post(`${endpoint}/login`)
                    .send({
                        username: user.username,
                        password: newPassword
                    })
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(401);
                        res.text.should.equal("unauthenticated user or password");
                        done();
                    });
            });
        });

        it("SHOULD the new user login successfully", (done) => {
            const user = new User(body);
            user.save((err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .post(`${endpoint}/login`)
                    .send({
                        username: user.username,
                        password: body.password
                    })
                    .end((err, res) => {
                        if (err) done(err);

                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.not.have.property("errors");
                        res.body.should.have.property("token");
                        done();
                    });
            });
        });
    });

    describe("GET route /show", () => {
        let user;
        let token;

        beforeEach((done) => {
            body = {
                name: faker.name.findName(), // Rowan Nikolaus
                username: faker.internet.userName(), // afuentes
                password: faker.internet.password(), // 123abc
                email: faker.internet.email() // Kassandra.Haley@erich.biz
            };

            user = new User(body);
            user.save((err) => {
                if (err) done(err);

                // requester
                chai
                    .request(server)
                    .post(`${endpoint}/login`)
                    .send({
                        username: user.username,
                        password: body.password
                    })
                    .end((err, res) => {
                        if (err) done(err);
                        token = res.body.token;

                        // res.should.have.status(200);
                        done();
                    });
            });
        });

        it("Verify authenticated user", (done) => {
            const newToken = `Bearer ${token}`;

            // requester
            chai
                .request(server)
                .get(`${endpoint}/show`)
                .set("authorization", newToken)
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(200);
                    done();
                });
        });

        it("SHOULD NOT pass user without a token", (done) => {
            // requester
            chai
                .request(server)
                .get(`${endpoint}/show`)
                .end((err, res) => {
                    if (err) done(err);
                    res.should.have.status(403);
                    res.body.should.have.property("errors");
                    res.body.errors.should.be.an("array");
                    res.body.errors.should.include.deep.members([{
                        msg: "a token is required for authentication",
                        param: "authorization",
                        location: "headers"
                    }]);
                    done();
                });
        });

        describe("Bad tokens", () => {
            const tokenRequiredMsg = "a token is required for authentication";
            const invalidTokenMsg = "invalid token";
            const tests = [
                {
                    token: "",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: " foobar ",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: "Bearer",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: "BEARER",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: "bearer",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: "BeArEr",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: "Bearer ",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: " Bearer",
                    status: 403,
                    msg: tokenRequiredMsg
                },
                {
                    token: "Bearer foobar",
                    status: 401,
                    msg: invalidTokenMsg
                },
                {
                    token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
                        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
                        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                    status: 401,
                    msg: invalidTokenMsg
                }
            ];

            tests.forEach(({ token, status, msg }) => {
                it(`SHOULD NOT pass user with a bad or invalid token format: "${token}"`, (done) => {
                    // requester
                    chai
                        .request(server)
                        .get(`${endpoint}/show`)
                        .set("authorization", token)
                        .end((err, res) => {
                            if (err) done(err);

                            res.should.have.status(status);
                            res.body.should.have.property("errors");
                            res.body.errors.should.be.an("array");
                            res.body.errors.should.include.deep.members([{
                                value: token.trim(),
                                msg,
                                param: "authorization",
                                location: "headers"
                            }]);
                            done();
                        });
                });
            });
        });
    });
});


