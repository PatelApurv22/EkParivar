const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema(
    {
        documentType: {
            type: String,
            required: true
        },
        documentNumber: String,
        fileUrl: String,
        fileName: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        verified: {
            type: Boolean,
            default: false
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "Officer"
        },
        verifiedAt: Date
    },
    { _id: false }
);

const bankDetailsSchema = new Schema(
    {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        branch: String,
        linkedToAadhaar: {
            type: Boolean,
            default: false
        }
    },
    { _id: false }
);

const addressSchema = new Schema(
    {
        houseNo: String,
        street: String,
        village: String,
        taluka: String,
        district: String,
        state: {
            type: String,
            default: "Gujarat"
        },
        pincode: String
    },
    { _id: false }
);

const familySchema = new Schema(
    {
        familyId: {
            type: String,
            unique: true,
            required: true
        },

        headOfFamily: {
            type: Schema.Types.ObjectId,
            ref: "Member"
        },

        address: addressSchema,

        rationCardNo: String,

        rationCardType: {
            type: String,
            enum: ["APL", "BPL", "AAY", "None"],
            default: "None"
        },

        totalIncome: Number,

        incomeSource: String,

        category: {
            type: String,
            enum: [
                "General",
                "OBC",
                "SC",
                "ST",
                "SEBC",
                "EWS"
            ]
        },

        religion: String,

        mobile: {
            type: String,
            unique: true,
            sparse: true
        },

        email: String,

        bankDetails: bankDetailsSchema,

        documents: [documentSchema],

        status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending"
        },

        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: "Officer"
        },

        verifiedAt: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Family", familySchema);