const mongoose = require('mongoose');

const splitRequestSchema = new mongoose.Schema({
  sourceFamilyId: { type: String, required: true }, // Original family
  requestedBy: { type: String, required: true }, // HOF name who requests
  mobile: { type: String, required: true },
  splitReason: {
    type: String,
    enum: ['marriage', 'separation', 'adult_child_independence', 'other'],
    required: true
  },
  reasonDetails: { type: String, default: '' },
  // Members to move to new family
  membersToSplit: [{
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    relationToHOF: { type: String }
  }],
  // New family head from split members
  newHeadMemberId: { type: String, required: true },
  newHeadMemberName: { type: String, required: true },
  // New family details (pre-populated, officer can review)
  newFamilyIncome: { type: Number, default: 0 },
  newFamilyCategory: { type: String, default: 'General' },
  newFamilyRationCardType: { type: String, default: 'BPL' },
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review'
  },
  // Result after approval
  newFamilyId: { type: String }, // Populated on approval
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SplitRequest', splitRequestSchema);
