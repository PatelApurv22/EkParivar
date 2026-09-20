const mongoose = require('mongoose');

const familyApplicationSchema = new mongoose.Schema({
  applicationRefNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  headOfFamilyName: {
    type: String,
    required: true
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
  category: {
    type: String,
    enum: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
    default: "General"
  },
  mobile: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    default: ''
  },
  address: {
    houseNo: String,
    street: String,
    village: String,
    taluka: String,
    district: String,
    state: { type: String, default: "Gujarat" },
    pincode: String
  },
  totalIncome: {
    type: Number,
    required: true,
    default: 0
  },
  incomeSource: String,
  rationCardType: {
    type: String,
    enum: ["APL", "BPL", "AAY", "None"],
    default: "BPL"
  },
  aadhaarDetails: {
    aadhaarNumber: String,
    verified: { type: Boolean, default: true },
    verifiedAt: Date,
    method: { type: String, default: "mock" }
  },
  documents: [{
    documentType: String,
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ["pending_approval", "approved", "rejected"],
    default: "pending_approval"
  },
  rejectionReason: String,
  issuedFamilyId: String,
  reviewedBy: String,
  reviewedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('FamilyApplication', familyApplicationSchema);
