const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    authorID: [{
        type: mongoose.Schema.ObjectId,
        ref: "AuthorMaster",
    }],
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
    publisherID: [{
        type: mongoose.Schema.ObjectId,
        ref: "PublisherMaster",
    }],
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
    quantity: {
        type: Number,
        default: null,
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

bookSchema.plugin(uniqueValidator);

module.exports = mongoose.model("BookMaster", bookSchema);