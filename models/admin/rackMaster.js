const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const rackSchema = mongoose.Schema({
    rackName: {
        type: String,
        required: true,
    },
    libraryID: {
        type: mongoose.Schema.ObjectId,
        ref: "LibraryMaster",
        required: true
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: null
    },
    updated_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: null
    },
    status: {
        type: Number,
        required: true,
        default: "1",
    },
    deleted: {
        type: Number,
        required: true,
        default: "0",
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

rackSchema.plugin(uniqueValidator);

module.exports = mongoose.model("RackMaster", rackSchema);
