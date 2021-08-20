var mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        max: 100
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: "Course"
    }],
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }],
    created_at: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

/**
 * Convert the user's password into a hash
 * @param   object   user [Model's instance]
 * @param   function next
 * @returns function
 */
function hashPassword(user, next) {
    // Only hash the password if it has been modified (or is new)
    // Help source: https://stackoverflow.com/a/14595363
    if (!user.isModified("password")) return next();

    bcrypt
        .hash(user.password, 10)
        .then(hash => {
            user.password = hash;
            next();
        })
        .catch(err => {
            console.log(`Error in hashing password: ${err.message}`);
            next(err);
        });
}

UserSchema.pre("findOneAndUpdate", function (next) {
    if (typeof this._update !== "undefined") {
        // Update to current datetime before saving
        // Help source: https://stackoverflow.com/a/44616254
        this._update.updated_at = new Date();
    }
    next();
});

UserSchema.pre("save", function (next) {
    let user = this;

    // Update to current datetime before saving
    user.updated_at = new Date();
    hashPassword(user, next);
});

/**
 * Returns a Promise function
 * @param   string   inputPassword
 * @returns function
 */
UserSchema.methods.passwordComparison = function(inputPassword, cb) {
    let user = this;

    bcrypt.compare(inputPassword, user.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

/**
 * Hide some fields of the instance before returning to the client as a JSON format.
 * Help source: https://contactsunny.medium.com/hide-properties-of-mongoose-objects-in-node-js-json-responses-a5437a5dbec2
 * @returns object
 */
UserSchema.methods.toJSON = function () {
    let user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model("User", UserSchema);
