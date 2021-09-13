// Help source: https://dev.to/paulasantamaria/testing-node-js-mongoose-with-an-in-memory-database-32np

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

/**
 * Connect to DB
 */
async function connect () {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoose.connect(uri, (err) => {
        if (err) console.log(err);
        mongoose.Promise = global.Promise;
    });
};

/**
 * Disconnect and close connection
 */
async function closeDatabase () {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
};

/**
 * Clear the DB and remove all data
 */
async function clearDatabase () {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Attempt to clear non testing database!");
    }

    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};


// Connect to a new in-memory database before running any tests.
before(async () => await connect());

// Clear all test data after every test.
afterEach(async () => await clearDatabase());

// Remove and close the db and server.
after(async () => await closeDatabase());
