const bcrypt = require("bcrypt");

/**
 * Convert a string into a hash
 * @param   string   str
 * @param   function callback
 * @returns function
 */
exports.make = (str, callback) => {
    bcrypt.hash(str, 10, (err, hash) => {
        if (err) return callback(err);
        callback(null, hash);
    });
};

/**
 * Compares if a string matches with a hash
 * @param   string   str
 * @param   string   hash
 * @param   function callback
 * @returns function
 */
exports.compare = (str, hash, callback) => {
    bcrypt.compare(str, hash, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};
