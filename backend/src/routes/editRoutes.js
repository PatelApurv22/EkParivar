const express = require('express');
const router = express.Router();
const EditRequest = require('../models/EditRequest');
const Family = require('../models/Family');
const Member = require('../models/Member');
const { logAudit } = require('../services/auditService');

// ─── FREE EDITS (HOF can do directly, no approval needed) ─────────────────────

// PUT /api/edit/free/:familyId - Citizen directly edits freely-editable fields
router.put('/free/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    const { mobile, email, bankDetails, nameCorrection, addressCorrection } = req.body;

    const family = await Family.findOne({ familyId });
    if (!family) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    // Apply free edits
    if (mobile) family.mobile = mobile;
    if (email) family.email = email;
    if (bankDetails) family.bankDetails = { ...family.bankDetails, ...bankDetails };
    if (nameCorrection) family.headOfFamilyName = nameCorrection;
    if (addressCorrection) {
      family.address = { ...family.address, ...addressCorrection };
    }

    await family.save();

    await logAudit({
      actorType: "Member",
      actorName: family.headOfFamilyName,
      action: "free_edit_family",
      targetType: "Family",
      targetId: familyId,
      details: { fieldsEdited: Object.keys(req.body).join(', ') }
    });

    res.json({
      success: true,
      family,
      message: "Family profile updated successfully (no approval needed)."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/edit/free/:familyId/add-newborn - Add newborn member (free, no approval)
router.post('/free/:familyId/add-newborn', async (req, res) => {
  try {
    const { familyId } = req.params;
    const { name, dob, gender } = req.body;

    const family = await Family.findOne({ familyId });
    if (!family) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    const newborn = new Member({
      familyId,
      name,
      dob: dob || new Date(),
      gender: gender || 'M',
      relationToHOF: 'Son',
      maritalStatus: 'Unmarried',
      occupation: 'Minor',
      monthlyIncome: 0,
      educationLevel: 'None',
      educationPercent: 0,
      aadhaarVerified: false,
      aadhaarVerificationMethod: 'mock',
      documents: []
    });

    await newborn.save();

    await logAudit({
      actorType: "Member",
      actorName: family.headOfFamilyName,
      action: "added_newborn",
      targetType: "Member",
      targetId: newborn._id.toString(),
      details: { familyId, name, dob }
    });

    res.status(201).json({
      success: true,
      member: newborn,
      message: `Newborn ${name} added to family ${familyId} successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── RESTRICTED EDITS (Require Officer Approval) ──────────────────────────────

// POST /api/edit/restricted - Submit a restricted edit request
router.post('/restricted', async (req, res) => {
  try {
    const {
      familyId, requestedBy, mobile, editType,
      fieldName, currentValue, requestedValue, reason,
      targetMemberId, targetMemberName, documentName, documentUrl
    } = req.body;

    const editReq = new EditRequest({
      familyId,
      requestedBy,
      mobile,
      editType,
      fieldName,
      currentValue,
      requestedValue,
      reason: reason || '',
      documentName: documentName || '',
      documentUrl: documentUrl || '',
      targetMemberId,
      targetMemberName,
      status: 'pending_review'
    });

    await editReq.save();

    await logAudit({
      actorType: "Member",
      actorName: requestedBy,
      action: "submitted_edit_request",
      targetType: "EditRequest",
      targetId: editReq._id.toString(),
      details: { familyId, editType, fieldName, requestedValue, documentName }
    });

    res.status(201).json({
      success: true,
      editRequest: editReq,
      message: `Edit request for ${fieldName} submitted with document proof. Pending Officer review.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/edit/restricted/pending - Officer fetch all pending edit requests
router.get('/restricted/pending', async (req, res) => {
  try {
    const pendingEdits = await EditRequest.find({ status: 'pending_review' }).sort({ createdAt: -1 });
    res.json({ success: true, pendingEditRequests: pendingEdits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/edit/restricted/:id/approve - Officer approve restricted edit
router.post('/restricted/:id/approve', async (req, res) => {
  try {
    const editReq = await EditRequest.findById(req.params.id);
    if (!editReq) {
      return res.status(404).json({ success: false, message: "Edit request not found" });
    }

    const family = await Family.findOne({ familyId: editReq.familyId });
    if (!family) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    // Apply the restricted edit
    if (editReq.editType === 'income_change') {
      family.totalIncome = editReq.requestedValue;
    } else if (editReq.editType === 'category_change') {
      family.category = editReq.requestedValue;
    } else if (editReq.editType === 'ration_card_change') {
      family.rationCardType = editReq.requestedValue;
    } else if (editReq.editType === 'name_correction') {
      if (editReq.targetMemberId) {
        await Member.findByIdAndUpdate(editReq.targetMemberId, { name: editReq.requestedValue });
      }
      if (!editReq.targetMemberId || editReq.targetMemberName === family.headOfFamilyName) {
        family.headOfFamilyName = editReq.requestedValue;
      }
    } else if (editReq.editType === 'address_correction') {
      if (typeof editReq.requestedValue === 'object') {
        family.address = { ...family.address, ...editReq.requestedValue };
      } else {
        family.address = { ...family.address, street: editReq.requestedValue };
      }
    } else if (editReq.editType === 'remove_member') {
      // Remove member from family
      if (editReq.targetMemberId) {
        await Member.findByIdAndDelete(editReq.targetMemberId);
      }
    }

    await family.save();

    editReq.status = 'approved';
    editReq.reviewedBy = req.body.officerName || "Officer Sharma (EMP-8832)";
    editReq.reviewedAt = new Date();
    await editReq.save();

    await logAudit({
      actorType: "Officer",
      actorName: editReq.reviewedBy,
      action: "approved_edit_request",
      targetType: "Family",
      targetId: editReq.familyId,
      details: {
        editType: editReq.editType,
        fieldName: editReq.fieldName,
        oldValue: editReq.currentValue,
        newValue: editReq.requestedValue
      }
    });

    res.json({
      success: true,
      editRequest: editReq,
      family,
      message: `Edit request approved. Family ${editReq.familyId} updated: ${editReq.fieldName} → ${editReq.requestedValue}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/edit/restricted/:id/reject - Officer reject restricted edit
router.post('/restricted/:id/reject', async (req, res) => {
  try {
    const editReq = await EditRequest.findById(req.params.id);
    if (!editReq) {
      return res.status(404).json({ success: false, message: "Edit request not found" });
    }

    editReq.status = 'rejected';
    editReq.rejectionReason = req.body.reason || "Edit request does not meet verification criteria.";
    editReq.reviewedBy = req.body.officerName || "Officer Sharma (EMP-8832)";
    editReq.reviewedAt = new Date();
    await editReq.save();

    await logAudit({
      actorType: "Officer",
      actorName: editReq.reviewedBy,
      action: "rejected_edit_request",
      targetType: "EditRequest",
      targetId: editReq._id.toString(),
      details: {
        editType: editReq.editType,
        reason: editReq.rejectionReason
      }
    });

    res.json({
      success: true,
      editRequest: editReq,
      message: `Edit request rejected: ${editReq.rejectionReason}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
