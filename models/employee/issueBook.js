const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const issueBookSchema = mongoose.Schema({
    libraryID: {
        type: mongoose.Schema.ObjectId,
        ref: "LibraryMaster",
        required: true
    },
    isbn: {
        type: String,
        unique: true,
        default: null
    },
    authorID: {
        type: mongoose.Schema.ObjectId,
        ref: "AuthorMaster",
        required: true,
    },
    genreID: {
        type: mongoose.Schema.ObjectId,
        ref: "GenreMaster",
        required: true,
    },
    edition: {
        type: String,
        required: true,
    },
    pages: {
        type: Number,
        required: true,
    },
    publisherID: {
        type: mongoose.Schema.ObjectId,
        ref: "PublisherMaster",
        required: true,
    },
    publishedYear: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    front_image: {
        type: String,
        required: true,
    },
    back_image: {
        type: String,
        required: true,
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

issueBookSchema.plugin(uniqueValidator);

module.exports = mongoose.model("BookMaster", issueBookSchema);
