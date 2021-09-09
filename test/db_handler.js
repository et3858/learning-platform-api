// Help source: https://dev.to/paulasantamaria/testing-node-js-mongoose-with-an-in-memory-database-32np

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

// Connect to DB
module.exports.connect = async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoose.connect(uri, (err) => {
        if (err) console.log(err);
    });
};

// Disconnect and close connection
module.exports.closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
};

// Clear the DB and remove all data
module.exports.clearDatabase = async () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Attempt to clear non testing database!");
    }

    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};
