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

module.exports = mongoose.model("Category", CategorySchema);
