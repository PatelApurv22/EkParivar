const mongoose = require('mongoose');

const eligibilityRuleSchema = new mongoose.Schema({
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  },
  maxIncome: { type: Number, default: 0 },
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 120 },
  requiredGender: { type: String, default: "Any" },
  requiredCategory: { type: [String], default: ["General", "OBC", "SC", "ST", "SEBC", "EWS"] },
  requiresBPL: { type: Boolean, default: false },
  requiresWidow: { type: Boolean, default: false },
  requiresDisabled: { type: Boolean, default: false },
  minDisabilityPercent: { type: Number, default: 0 },
  requiresPregnantOrLactating: { type: Boolean, default: false },
  requiredOccupation: { type: String, default: "" },
  minEducationPercent: { type: Number, default: 0 },
  requiredClassRange: String,
  requiredMaritalStatus: String
}, { timestamps: true });

module.exports = mongoose.model('EligibilityRule', eligibilityRuleSchema);
