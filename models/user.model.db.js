var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        max: 100
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre("save", function (next) {
    // Update to current datetime before saving
    this.updated_at = new Date();
    next();
});

module.exports = mongoose.model("User", UserSchema);
