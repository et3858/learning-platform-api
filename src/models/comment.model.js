var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    description: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    lesson: {
        type: Schema.Types.ObjectId,
        ref: "Lesson"
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

CommentSchema.pre("validate", function (next) {
    // This hook prevents of adding an arbitrary value to the 'created_at' field when creating a new document
    if (this.isModified("created_at")) {
        this.created_at = new Date();
    }
    next();
});

module.exports = mongoose.model("Note", CommentSchema);
