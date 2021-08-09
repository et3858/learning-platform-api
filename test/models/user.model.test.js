// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

var assert = require('assert');
let faker = require("faker");
var chai = require("chai");
let should = chai.should();
let expect = chai.expect;
const dbHandler = require("../db_handler");
const User = require("../../src/models/user.model");

// Connect to a new in-memory database before running any tests.
before(async () => await dbHandler.connect());

// Clear all test data after every test.
afterEach(async () => await dbHandler.clearDatabase());

// Remove and close the db and server.
after(async () => await dbHandler.closeDatabase());



describe("User Model", () => {
    let body;

    beforeEach(() => {
        body = {
            name: faker.name.findName(), // Rowan Nikolaus
            username: faker.internet.userName(), // afuentes
            password: faker.internet.password(), // 123abc
            email: faker.internet.email() // Kassandra.Haley@erich.biz
        };
    });

    it("Get all users", async () => {
        let user = new User(body);
        await user.save();

        User.find({}, (err, users) => {
            expect(users).to.be.an("array");
            expect(users.length).to.be.above(0);
        });
    });

    it("Add a new user without any errors", (done) => {
        User.create(body, (err, user) => {
            if (err) done(err);
            expect(user).to.not.be.a("null");
            expect(user).to.be.an("object");
            done();
        });
    });

    it("Add a new user and compare password successfully", (done) => {
        User.create(body, (err, user) => {
            if (err) done(err);

            user.passwordComparison(body.password, (err, res) => {
                if (err) done(err);
                expect(user).to.not.be.a("null");
                expect(user).to.be.an("object");
                expect(res).to.be.true;
                done();
            });
        });
    });

    it("Add a new user and fail to compare password", (done) => {
        User.create(body, (err, user) => {
            if (err) done(err);

            let newPassword = faker.internet.password();
            user.passwordComparison(newPassword, (err, res) => {
                if (err) done(err);
                expect(user).to.not.be.a("null");
                expect(user).to.be.an("object");
                expect(res).to.be.false;
                done();
            });
        });
    });

    it("Get the existing user", async () => {
        let user = new User(body);
        await user.save();

        User.findById(user._id, (err, searchedUser) => {
            if (err) assert(false);
            expect(searchedUser).to.not.be.a("null");
            expect(searchedUser).to.be.an("object");
            expect(searchedUser._id.toString()).to.equal(user._id.toString());
        });
    });

    it("Change the user's name and email", async () => {
        let user = new User(body);
        await user.save();

        let newName = faker.name.findName();
        let newEmail = faker.internet.email();

        user.name = newName;
        user.email = newEmail;

        user.save((err, updatedUser) => {
            if (err) assert(false);
            expect(updatedUser).to.be.an("object");
            expect(updatedUser.name).to.equal(newName).not.equal(body.name);
            expect(updatedUser.email).to.equal(newEmail).not.equal(body.email);
        });
    });

    it("Remove a user", async () => {
        let user = new User(body);

        // Save the new user, then remove it
        await user.save();
        await user.delete();

        User.findById(user._id, (err, searchedUser) => {
            if (err) assert(false);

            expect(searchedUser).to.be.a("null");
            expect(searchedUser).to.not.be.an("object");
        });
    });
});


