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
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Note", CommentSchema);
