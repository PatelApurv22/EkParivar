const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  schemeName: {
    type: String,
    required: true
  },
  schemeCode: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  description: String,
  benefitType: {
    type: String,
    enum: ["Cash", "Insurance", "Subsidy", "Kind", "Service"],
    default: "Cash"
  },
  benefitAmount: {
    type: Number,
    required: true,
    default: 0
  },
  applicationUrl: String,
  requiredDocuments: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
