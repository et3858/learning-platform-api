var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LessonSchema = new Schema({
    name: String,
    description: String,
    slug: String,
    position: Number,
    duration: Number,
    is_free: {
        type: Boolean,
        default: false
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course"
    },
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

module.exports = mongoose.model("Lesson", LessonSchema);
