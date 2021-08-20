var mongoose = require("mongoose");
var deepPopulate = require("mongoose-deep-populate")(mongoose);
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: String,
    courses: [{
        type: Schema.Types.ObjectId,
        ref: "Course"
    }],
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
CategorySchema.plugin(deepPopulate);

CategorySchema.pre("save", function (next) {
    // This code prevents of adding an arbitrary value to the 'created_at' field when creating a new document
    if (this.isModified("created_at")) {
        this.created_at = new Date();
    }

    // Update to current datetime before saving
    this.updated_at = new Date();
    next();
});

module.exports = mongoose.model("Category", CategorySchema);
