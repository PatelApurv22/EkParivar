const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Member = require('../models/Member');
const Scheme = require('../models/Scheme');
const { checkDuplicateEnrollment } = require('../services/duplicateDetector');
const { logAudit } = require('../services/auditService');

// POST /api/enrollment - Enroll member into scheme
router.post('/', async (req, res) => {
  try {
    const { memberId, schemeId, familyId } = req.body;

    const member = await Member.findById(memberId);
    const scheme = await Scheme.findById(schemeId);

    if (!member || !scheme) {
      return res.status(404).json({ success: false, message: "Member or Scheme not found" });
    }

    // Check duplicate conflict
    const dupCheck = await checkDuplicateEnrollment(memberId, scheme);

    let status = 'pending_approval';
    let flaggedReason = null;
    let message = "Scheme application submitted successfully (Pending Officer Approval)";

    if (dupCheck.isDuplicate) {
      status = 'flagged_duplicate';
      flaggedReason = dupCheck.reason;
      message = `⚠ Warning: Duplicate enrollment flagged! ${dupCheck.reason}`;
    }

    const enrollment = new Enrollment({
      memberId: member._id,
      schemeId: scheme._id,
      familyId: familyId || member.familyId,
      memberName: member.name,
      schemeName: scheme.schemeName,
      department: scheme.department,
      benefitType: scheme.benefitType,
      benefitAmount: scheme.benefitAmount,
      enrolledOn: new Date(),
      status,
      flaggedReason,
      benefitPaid: false
    });

    await enrollment.save();

    await logAudit({
      actorType: dupCheck.isDuplicate ? "System Automation" : "Member",
      actorName: member.name,
      action: dupCheck.isDuplicate ? "flagged_duplicate" : "enrolled_member",
      targetType: "Enrollment",
      targetId: enrollment._id.toString(),
      details: {
        memberName: member.name,
        schemeName: scheme.schemeName,
        department: scheme.department,
        status,
        reason: flaggedReason
      }
    });

    res.status(201).json({
      success: true,
      enrollment,
      isDuplicate: dupCheck.isDuplicate,
      message
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Member is already enrolled in this scheme."
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/enrollment/duplicates - Get flagged duplicates
router.get('/duplicates', async (req, res) => {
  try {
    const duplicates = await Enrollment.find({ status: 'flagged_duplicate' }).sort({ createdAt: -1 });
    res.json({
      success: true,
      duplicates
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/enrollment/pending - Get all pending_approval enrollments (for Officer queue)
router.get('/pending', async (req, res) => {
  try {
    const pending = await Enrollment.find({ status: 'pending_approval' })
      .sort({ createdAt: -1 })
      .populate('memberId', 'name dob gender relationToHOF familyId')
      .populate('schemeId', 'schemeName department benefitAmount benefitType');
    res.json({ success: true, pendingEnrollments: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/enrollment/approved - Get all active/approved enrollments (for Officer & Family view)
router.get('/approved', async (req, res) => {
  try {
    const approved = await Enrollment.find({ status: { $in: ['active', 'approved'] } })
      .sort({ updatedAt: -1 })
      .populate('memberId', 'name dob gender relationToHOF familyId')
      .populate('schemeId', 'schemeName department benefitAmount benefitType');
    res.json({ success: true, approvedEnrollments: approved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST /api/enrollment/:id/approve - Officer approves a pending enrollment
router.post('/:id/approve', async (req, res) => {
  try {
    const { officerName } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    enrollment.status = 'active';
    enrollment.approvedBy = officerName || 'Government Officer';
    await enrollment.save();

    await logAudit({
      actorType: 'Officer',
      actorName: officerName || 'Government Officer',
      action: 'approved_enrollment',
      targetType: 'Enrollment',
      targetId: enrollment._id.toString(),
      details: {
        memberName: enrollment.memberName,
        schemeName: enrollment.schemeName,
        department: enrollment.department
      }
    });

    res.json({
      success: true,
      enrollment,
      message: `Enrollment for "${enrollment.memberName}" in "${enrollment.schemeName}" approved.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/enrollment/:id/reject - Officer rejects a pending enrollment
router.post('/:id/reject', async (req, res) => {
  try {
    const { reason, officerName } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    enrollment.status = 'rejected';
    enrollment.flaggedReason = reason || 'Rejected by officer';
    await enrollment.save();

    await logAudit({
      actorType: 'Officer',
      actorName: officerName || 'Government Officer',
      action: 'rejected_enrollment',
      targetType: 'Enrollment',
      targetId: enrollment._id.toString(),
      details: {
        memberName: enrollment.memberName,
        schemeName: enrollment.schemeName,
        reason: enrollment.flaggedReason
      }
    });

    res.json({
      success: true,
      enrollment,
      message: `Enrollment rejected.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
