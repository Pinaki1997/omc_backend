const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const bookDetailsMasterSchema = mongoose.Schema({
    bookID: {
        type: mongoose.Schema.ObjectId,
        ref: "BookMaster",
        required: true,
    },
    bookReferenceNumber: {
        type: Number,
        required: true,
    },
    qrCodePath: {
        type: String,
        required: true,
    },
    bookStatus: {
        type: Number,
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

bookDetailsMasterSchema.plugin(uniqueValidator);

module.exports = mongoose.model("BookDetailsMaster", bookDetailsMasterSchema);