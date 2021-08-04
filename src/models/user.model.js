var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        max: 100
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
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre("findOneAndUpdate", function (next) {
    // Help source: https://stackoverflow.com/a/44616254

    // Update to current datetime before saving
    this._update.updated_at = new Date();
    next();
});

module.exports = mongoose.model("User", UserSchema);
