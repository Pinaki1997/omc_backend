const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        //   select: false,
    },
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    employee_id: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    created_by: {
        type: String,
    },
    updated_by: {
        type: String,
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
    otp_value: {
        type: Number,
        default: null,
    },
    otp_created_time: {
        type: Date,
        default: null,
    },
    verified: {
        type: Boolean,
        default: false,
    },

    user_role: {
        type: Number,
        required: true,
    },
    token: {
        type: String,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
