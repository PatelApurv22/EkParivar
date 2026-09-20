const mongoose = require("mongoose");
const { Schema } = mongoose;

const officerSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },

        employeeId: {
            type: String,
            unique: true,
            sparse: true
        },

        department: String,

        designation: String,

        mobile: {
            type: String,
            unique: true,
            sparse: true
        },

        email: String,

        password: String,

        role: {
            type: String,
            enum: ["officer", "admin"],
            default: "officer"
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Officer", officerSchema);