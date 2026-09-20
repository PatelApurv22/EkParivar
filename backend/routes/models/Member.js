const mongoose = require("mongoose");
const { Schema } = mongoose;

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

const memberSchema = new Schema(
    {
        familyId: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        // =====================================================
        // MOCK AADHAAR VERIFICATION
        // =====================================================

        aadhaarNumber: {
            type: String,
            unique: true,
            sparse: true
        },

        aadhaarVerified: {
            type: Boolean,
            default: false
        },

        aadhaarLinkedMobile: String,

        aadhaarVerifiedAt: Date,

        aadhaarVerificationMethod: {
            type: String,
            enum: ["mock", "uidai"],
            default: "mock"
        },

        // =====================================================
        // PERSONAL INFORMATION
        // =====================================================

        dob: Date,

        gender: {
            type: String,
            enum: ["M", "F", "O"]
        },

        relationToHOF: String,

        maritalStatus: {
            type: String,
            enum: [
                "Single",
                "Married",
                "Widow",
                "Widower",
                "Divorced"
            ]
        },

        occupation: String,

        monthlyIncome: Number,

        educationLevel: String,

        educationPercent: Number,

        currentlyEnrolled: {
            type: Boolean,
            default: false
        },

        currentClassOrCourse: String,

        // =====================================================
        // ELIGIBILITY INFORMATION
        // =====================================================

        isDisabled: {
            type: Boolean,
            default: false
        },

        disabilityPercent: Number,

        disabilityType: String,

        isWidow: {
            type: Boolean,
            default: false
        },

        isPregnantOrLactating: {
            type: Boolean,
            default: false
        },

        isSeniorCitizen: {
            type: Boolean,
            default: false
        },

        // =====================================================
        // BANK / DOCUMENTS
        // =====================================================

        bankDetails: bankDetailsSchema,

        documents: [documentSchema],

        // =====================================================
        // CONTACT
        // =====================================================

        mobile: String,

        email: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Member", memberSchema);