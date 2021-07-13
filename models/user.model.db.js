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
    }
});

module.exports = mongoose.model("User", UserSchema);
