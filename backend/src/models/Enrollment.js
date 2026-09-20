const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true
  },
  familyId: String,
  memberName: String,
  schemeName: String,
  department: String,
  benefitType: String,
  benefitAmount: Number,
  enrolledOn: {
    type: Date,
    default: Date.now
  },
  approvedBy: String,
  benefitPaid: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["active", "flagged_duplicate", "revoked", "pending_approval", "approved", "rejected", "benefit_received"],
    default: "pending_approval"
  },
  flaggedReason: String
}, { timestamps: true });

// Compound unique index for memberId + schemeId
enrollmentSchema.index({ memberId: 1, schemeId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
