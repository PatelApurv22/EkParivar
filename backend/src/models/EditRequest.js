const mongoose = require('mongoose');

const editRequestSchema = new mongoose.Schema({
  familyId: { type: String, required: true },
  requestedBy: { type: String, required: true }, // HOF name
  mobile: { type: String, required: true },
  editType: {
    type: String,
    enum: ['income_change', 'category_change', 'ration_card_change', 'remove_member', 'name_correction', 'address_correction'],
    required: true
  },
  fieldName: { type: String, required: true }, // e.g. 'totalIncome', 'category', 'rationCardType', 'headOfFamilyName', 'address'
  currentValue: { type: mongoose.Schema.Types.Mixed },
  requestedValue: { type: mongoose.Schema.Types.Mixed },
  reason: { type: String, default: '' },
  documentName: { type: String },
  documentUrl: { type: String },
  // For remove_member or name_correction type
  targetMemberId: { type: String },
  targetMemberName: { type: String },
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review'
  },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('EditRequest', editRequestSchema);
