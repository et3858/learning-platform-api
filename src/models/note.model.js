var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    description: String,
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

NoteSchema.pre("validate", function (next) {
    // This hook prevents of adding an arbitrary value to the 'created_at' field when creating a new document
    if (this.isModified("created_at")) {
        this.created_at = new Date();
    }
    next();
});

module.exports = mongoose.model("Note", NoteSchema);
