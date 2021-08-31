const bcrypt = require("bcrypt");

/**
 * Convert a string into a hash
 * @param  {string}   str
 * @return {function}          [Returns a Promise]
 */
exports.make = (str) => {
    return new Promise((resolve, reject) => {
        bcrypt
            .hash(str, 10)
            .then(hash => resolve(hash))
            .catch(err => reject(err));
    });
};

/**
 * Compares if a string matches with a hash
 * @param {string}   str
 * @param {string}   hash
 * @param {function} callback
 */
exports.compare = (str, hash, callback) => {
    bcrypt.compare(str, hash, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};
