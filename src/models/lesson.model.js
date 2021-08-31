const durations = require("../services/durations");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
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
}, {
    toJSON: { virtuals: true }
});

LessonSchema.virtual("time_duration").get(function () {
    return durations(this.duration, "seconds");
});

LessonSchema.pre("save", function (next) {
    // This code prevents of adding an arbitrary value to the 'created_at' field when creating a new document
    if (this.isModified("created_at")) {
        this.created_at = new Date();
    }

    // Update to current datetime before saving
    this.updated_at = new Date();
    next();
});

module.exports = mongoose.model("Lesson", LessonSchema);
