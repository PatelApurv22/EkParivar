const mongoose = require('mongoose');

const eligibilityMatchSchema = new mongoose.Schema({
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
  matchedOn: {
    type: Date,
    default: Date.now
  },
  isEligible: {
    type: Boolean,
    required: true
  },
  isEnrolled: {
    type: Boolean,
    default: false
  },
  matchedCriteria: [String],
  missingCriteria: [String],
  missingDocuments: [String]
}, { timestamps: true });

module.exports = mongoose.model('EligibilityMatch', eligibilityMatchSchema);
