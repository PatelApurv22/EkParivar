const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  familyId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  headOfFamilyName: {
    type: String,
    required: true
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
  rationCardNo: String,
  rationCardType: {
    type: String,
    enum: ["APL", "BPL", "AAY", "None"],
    default: "BPL"
  },
  totalIncome: {
    type: Number,
    required: true,
    default: 0
  },
  incomeSource: String,
  category: {
    type: String,
    enum: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
    required: true,
    default: "General"
  },
  religion: String,
  mobile: {
    type: String,
    required: true
  },
  email: String,
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branch: String,
    linkedToAadhaar: { type: Boolean, default: true }
  },
  documents: [{
    documentType: String,
    documentNumber: String,
    fileUrl: String,
    fileName: String,
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true },
    verifiedBy: String,
    verifiedAt: Date
  }],
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "verified"
  }
}, { timestamps: true });

module.exports = mongoose.model('Family', familySchema);
