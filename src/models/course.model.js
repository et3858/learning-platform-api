var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CourseSchema = new Schema({
    name: String,
    excerpt: String,
    content: String,
    slug: String,
    release_date: Date,
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    lessons: [{
        type: Schema.Types.ObjectId,
        ref: "Lesson"
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
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

CourseSchema.pre("validate", function (next) {
    // This hook prevents of adding an arbitrary value to the 'created_at' field when creating a new document
    if (this.isModified("created_at")) {
        this.created_at = new Date();
    }
    next();
});

module.exports = mongoose.model("Course", CourseSchema);

// Creation of relations
// Source: https://vegibit.com/mongoose-relationships-tutorial/
