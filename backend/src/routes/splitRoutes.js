const express = require('express');
const router = express.Router();
const SplitRequest = require('../models/SplitRequest');
const Family = require('../models/Family');
const Member = require('../models/Member');
const { logAudit } = require('../services/auditService');

// POST /api/split - Citizen request family split
router.post('/', async (req, res) => {
  try {
    const {
      sourceFamilyId, requestedBy, mobile,
      splitReason, reasonDetails,
      membersToSplit, newHeadMemberId, newHeadMemberName,
      newFamilyIncome, newFamilyCategory, newFamilyRationCardType
    } = req.body;

    const splitReq = new SplitRequest({
      sourceFamilyId,
      requestedBy,
      mobile,
      splitReason,
      reasonDetails: reasonDetails || '',
      membersToSplit: membersToSplit || [],
      newHeadMemberId,
      newHeadMemberName,
      newFamilyIncome: newFamilyIncome || 0,
      newFamilyCategory: newFamilyCategory || 'General',
      newFamilyRationCardType: newFamilyRationCardType || 'BPL',
      status: 'pending_review'
    });

    await splitReq.save();

    await logAudit({
      actorType: "Member",
      actorName: requestedBy,
      action: "requested_family_split",
      targetType: "SplitRequest",
      targetId: splitReq._id.toString(),
      details: {
        sourceFamilyId,
        splitReason,
        membersToSplit: membersToSplit.map(m => m.memberName).join(', '),
        newHead: newHeadMemberName
      }
    });

    res.status(201).json({
      success: true,
      splitRequest: splitReq,
      message: `Family split request submitted. ${membersToSplit.length} member(s) proposed to form new household under ${newHeadMemberName}. Pending Officer review.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/split/pending - Officer fetch pending split requests
router.get('/pending', async (req, res) => {
  try {
    const pendingSplits = await SplitRequest.find({ status: 'pending_review' }).sort({ createdAt: -1 });
    res.json({ success: true, pendingSplitRequests: pendingSplits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/split/:id/approve - Officer approve split → create new Family ID
router.post('/:id/approve', async (req, res) => {
  try {
    const splitReq = await SplitRequest.findById(req.params.id);
    if (!splitReq) {
      return res.status(404).json({ success: false, message: "Split request not found" });
    }

    const sourceFamily = await Family.findOne({ familyId: splitReq.sourceFamilyId });
    if (!sourceFamily) {
      return res.status(404).json({ success: false, message: "Source family not found" });
    }

    // Generate new Family ID
    const count = await Family.countDocuments();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newFamilyId = `EKP-${todayStr}-${String(count + 1).padStart(4, '0')}`;

    // Create new family record
    const newFamily = new Family({
      familyId: newFamilyId,
      headOfFamilyName: splitReq.newHeadMemberName,
      address: sourceFamily.address, // Initially same address
      rationCardType: splitReq.newFamilyRationCardType || sourceFamily.rationCardType,
      totalIncome: splitReq.newFamilyIncome || 0,
      category: splitReq.newFamilyCategory || sourceFamily.category,
      religion: sourceFamily.religion || 'Hinduism',
      mobile: splitReq.mobile,
      status: 'verified'
    });

    await newFamily.save();

    // Move members to new family
    for (const memberInfo of splitReq.membersToSplit) {
      const member = await Member.findById(memberInfo.memberId);
      if (member) {
        member.familyId = newFamilyId;
        // If this member is the new head, set relationToHOF = 'Self'
        if (member._id.toString() === splitReq.newHeadMemberId) {
          member.relationToHOF = 'Self';
        }
        await member.save();
      }
    }

    // Update split request
    splitReq.status = 'approved';
    splitReq.newFamilyId = newFamilyId;
    splitReq.reviewedBy = req.body.officerName || "Officer Sharma (EMP-8832)";
    splitReq.reviewedAt = new Date();
    await splitReq.save();

    await logAudit({
      actorType: "Officer",
      actorName: splitReq.reviewedBy,
      action: "approved_family_split",
      targetType: "Family",
      targetId: newFamilyId,
      details: {
        sourceFamilyId: splitReq.sourceFamilyId,
        newFamilyId,
        newHead: splitReq.newHeadMemberName,
        movedMembers: splitReq.membersToSplit.map(m => m.memberName).join(', ')
      }
    });

    res.json({
      success: true,
      splitRequest: splitReq,
      newFamily,
      newFamilyId,
      message: `Family split approved! New Family ID ${newFamilyId} issued for ${splitReq.newHeadMemberName}. ${splitReq.membersToSplit.length} member(s) moved.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/split/:id/reject - Officer reject split
router.post('/:id/reject', async (req, res) => {
  try {
    const splitReq = await SplitRequest.findById(req.params.id);
    if (!splitReq) {
      return res.status(404).json({ success: false, message: "Split request not found" });
    }

    splitReq.status = 'rejected';
    splitReq.rejectionReason = req.body.reason || "Split request does not meet criteria.";
    splitReq.reviewedBy = req.body.officerName || "Officer Sharma (EMP-8832)";
    splitReq.reviewedAt = new Date();
    await splitReq.save();

    await logAudit({
      actorType: "Officer",
      actorName: splitReq.reviewedBy,
      action: "rejected_family_split",
      targetType: "SplitRequest",
      targetId: splitReq._id.toString(),
      details: {
        sourceFamilyId: splitReq.sourceFamilyId,
        reason: splitReq.rejectionReason
      }
    });

    res.json({
      success: true,
      splitRequest: splitReq,
      message: `Split request rejected: ${splitReq.rejectionReason}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
