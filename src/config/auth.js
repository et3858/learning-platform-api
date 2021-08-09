const dotenv = require("dotenv");
dotenv.config(); // Read the '.env' file

const auth = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expires_in: process.env.JWT_EXPIRES_IN || 0
    }
};

module.exports = auth;
