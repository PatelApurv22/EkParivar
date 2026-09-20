const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  familyId: {
    type: String,
    required: true,
    index: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  documentType: {
    type: String,
    enum: [
      'Aadhaar Card',
      'Ration Card',
      'Income Certificate',
      'Caste Certificate',
      'Disability Certificate',
      'Birth Certificate',
      'Education/Marksheet',
      'Address Proof',
      'Other'
    ],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    default: 'image'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
