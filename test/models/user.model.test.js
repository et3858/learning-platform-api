// Set environment to "test" for avoiding clear the database for development or production
process.env.NODE_ENV = "test";

const assert = require("assert");
const faker = require("faker");
const chai = require("chai");
const expect = chai.expect;
const dbHandler = require("../db_handler");
const User = require("../../src/models/user.model");


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


// Connect to a new in-memory database before running any tests.
before(async () => await dbHandler.connect());

// Clear all test data after every test.
afterEach(async () => await dbHandler.clearDatabase());

// Remove and close the db and server.
after(async () => await dbHandler.closeDatabase());


describe("User Model", () => {
    let body;

    beforeEach(() => body = getUserBody());

    it("Get all users", async () => {
        const user = new User(body);
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

            const newPassword = faker.internet.password();
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
        const user = new User(body);
        await user.save();

        User.findById(user._id, (err, searchedUser) => {
            if (err) assert(false);
            expect(searchedUser).to.not.be.a("null");
            expect(searchedUser).to.be.an("object");
            expect(searchedUser._id.toString()).to.equal(user._id.toString());
        });
    });

    it("Change the user's name and email", async () => {
        const user = new User(body);
        await user.save();

        const newName = faker.name.findName();
        const newEmail = faker.internet.email();

        user.name = newName;
        user.email = newEmail;

        user.save((err, updatedUser) => {
            if (err) assert(false);
            expect(updatedUser).to.be.an("object");
            expect(updatedUser.name).to.equal(newName).not.equal(body.name);
            expect(updatedUser.email).to.equal(newEmail).not.equal(body.email);
            expect(updatedUser.updated_at.valueOf()).to.be.above(updatedUser.created_at.valueOf());
        });
    });

    it("Remove a user", async () => {
        const user = new User(body);

        // Save the new user, then remove it
        await user.save();
        await user.delete();

        User.findById(user._id, (err, searchedUser) => {
            if (err) assert(false);

            expect(searchedUser).to.be.a("null");
            expect(searchedUser).to.not.be.an("object");
        });
    });

    describe("Soft deleting", () => {
        it("Soft deleting a user", async () => {
            const user = new User(body);

            // Save the new user, then remove it
            await user.save();
            const userID = user._id;
            await user.delete();

            const searchedUser = await User.findById({ _id: userID });
            const deletedUser = await User.findOneDeleted({ _id: userID });

            expect(searchedUser).to.be.a("null");
            expect(deletedUser).to.be.an("object").and.not.a("null");
            expect(deletedUser).to.have.property("deleted", true);
        });

        it("Soft deleting all users", async () => {
            const user1 = new User(getUserBody());
            const user2 = new User(getUserBody());

            // Save the new users, then remove them
            await user1.save();
            await user2.save();
            await user1.delete();
            await user2.delete();

            const users = await User.find({});
            const deletedUsers = await User.findDeleted({});

            expect(users).to.be.an("array").that.have.lengthOf(0);
            expect(deletedUsers).to.be.an("array").that.have.lengthOf(2);
        });

        it("Soft deleting some users", async () => {
            const user1 = new User(getUserBody());
            const user2 = new User(getUserBody());
            const user3 = new User(getUserBody());

            // Save the new users, then remove some of them
            await user1.save();
            await user2.save();
            await user3.save();
            await user1.delete();
            await user3.delete();

            const users = await User.find({});
            const deletedUsers = await User.findDeleted({});

            expect(users).to.be.an("array").that.have.lengthOf(1);
            expect(users[0]._id.toString()).to.be.equal(user2._id.toString());
            expect(deletedUsers).to.be.an("array").that.have.lengthOf(2);
            deletedUsers.forEach((u) => {
                expect(u._id.toString()).to.have.oneOf([user1._id.toString(), user3._id.toString()]);
                expect(u).to.have.property("deleted", true);
            });
        });
    });
});
