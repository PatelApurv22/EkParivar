const Enrollment = require('../models/Enrollment');

/**
 * Duplicate Detector Engine
 * Checks existing active enrollments for conflicting benefits under same department or category.
 */
async function checkDuplicateEnrollment(memberId, scheme) {
  // Find all active/pending enrollments for member
  const existingEnrollments = await Enrollment.find({
    memberId,
    status: { $in: ["active", "pending_approval", "approved", "benefit_received"] }
  }).populate('schemeId');

  const conflict = existingEnrollments.find(e => {
    // Check same scheme or same department
    if (e.schemeId && e.schemeId._id.toString() === scheme._id.toString()) {
      return true;
    }
    if (e.department === scheme.department) {
      return true;
    }
    return false;
  });

  if (conflict) {
    return {
      isDuplicate: true,
      existingEnrollment: conflict,
      reason: `Conflicting active benefit '${conflict.schemeName}' under '${conflict.department}'`
    };
  }

  return {
    isDuplicate: false,
    existingEnrollment: null,
    reason: null
  };
}

module.exports = {
  checkDuplicateEnrollment
};
