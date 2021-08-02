var assert = require('assert');
const dbHandler = require("./db_handler");
const User = require("../models/user.model");

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
        before(() => {
            let user = new User();
            user.name = "foo";
            user.email = "bar@baz.com";
            user.save();
        });

        it("Get all users", () => {
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
});


