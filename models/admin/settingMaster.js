const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const settingSchema = mongoose.Schema({
    bookReturnDays: {
        type: String,
        default: null
    },
    maximumBookIssued: {
        type: String,
        default: null
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

settingSchema.plugin(uniqueValidator);

module.exports = mongoose.model("SettingMaster", settingSchema);
