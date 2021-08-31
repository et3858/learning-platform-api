const dotenv = require("dotenv");
dotenv.config(); // Read the '.env' file

const env = process.env.NODE_ENV || "development";

const config = {
    development: {
        // url to be used in link generation
        // url: 'http://my.site.com',
        // mongodb connection settings
        database: {
            connection: process.env.DB_CONNECTION,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            db: process.env.DB_NAME
        },
        // server details
        server: {
            host: "127.0.0.1",
            port: process.env.PORT
        }
    },
    production: {
        // url to be used in link generation
        // url: 'http://my.site.com',
        // mongodb connection settings
        database: {
            connection: process.env.DB_CONNECTION,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            db: process.env.DB_NAME
        },
        // server details
        server: {
            host: "127.0.0.1",
            port: process.env.PORT
        }
    },
    test: {
        // url to be used in link generation
        // url: 'http://my.site.com',
        // mongodb connection settings
        database: {
            connection: process.env.DB_CONNECTION,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            db: process.env.DB_NAME
        },
        // server details
        server: {
            host: "127.0.0.1",
            port: process.env.PORT
        }
    }
};

module.exports = config[env];
