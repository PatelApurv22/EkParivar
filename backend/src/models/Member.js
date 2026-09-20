const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  familyId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  aadhaarNumber: {
    type: String,
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
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ["M", "F", "O"],
    required: true
  },
  relationToHOF: {
    type: String,
    required: true
  },
  maritalStatus: {
    type: String,
    enum: ["Single", "Married", "Widow", "Widower", "Divorced"],
    default: "Single"
  },
  occupation: String,
  monthlyIncome: { type: Number, default: 0 },
  educationRecords: [{
    level: {
      type: String,
      enum: ['Class 8', 'Class 10', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD']
    },
    percentage: { type: Number, min: 0, max: 100 },
    yearOfPassing: Number,
    boardOrUniversity: String
  }],
  currentlyEnrolled: { type: Boolean, default: false },
  currentClassOrCourse: String,
  isDisabled: { type: Boolean, default: false },
  disabilityPercent: { type: Number, default: 0 },
  disabilityType: String,
  isWidow: { type: Boolean, default: false },
  isPregnantOrLactating: { type: Boolean, default: false },
  isSeniorCitizen: { type: Boolean, default: false },
  mobile: String,
  email: String,
  status: {
    type: String,
    enum: ["pending_approval", "approved", "rejected"],
    default: "approved"
  },
  addedBy: {
    type: String,
    default: "Citizen"
  },
  rejectionReason: String,
  reviewedBy: String,
  reviewedAt: Date,
  documents: [{
    documentType: String,
    verified: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
