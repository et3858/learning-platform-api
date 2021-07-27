var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: String,
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

module.exports = mongoose.model("Category", CategorySchema);
