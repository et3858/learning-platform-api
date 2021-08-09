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
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Note", NoteSchema);
