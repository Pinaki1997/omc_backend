const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const shelfSchema = mongoose.Schema({
    shelfName: {
        type: String,
        required: true,
    },
    rackID: {
        type: mongoose.Schema.ObjectId,
        ref: "RackMaster",
        required: true
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

shelfSchema.plugin(uniqueValidator);

module.exports = mongoose.model("ShelfMaster", shelfSchema);
