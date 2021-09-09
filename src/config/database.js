const mongoose = require("mongoose");
const config = require("./config");
const isTestEnv = process.env.NODE_ENV === "test";

// Connect to DB
module.exports.connect = async () => {
    let uri = [
        config.database.connection + "://",
        config.database.host + ":",
        config.database.port + "/",
        config.database.db
    ].join("");

    if (isTestEnv) uri += "-" + process.env.NODE_ENV;

    mongoose
        .connect(uri)
        .then(() => {
            mongoose.Promise = global.Promise;
            const db = mongoose.connection;
            db.on("error", console.error.bind(console, "MongoDB connection error:"));
        })
        .catch(err => console.log(err));
};

// Disconnect and close connection
module.exports.closeDatabase = async () => {
    if (isTestEnv) {
        await mongoose.connection.dropDatabase();
    }
    await mongoose.connection.close();
};

// Clear the DB and remove all data
module.exports.clearDatabase = async () => {
    if (!isTestEnv) {
        throw new Error("Attempt to clear non testing database!");
    }

    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};
