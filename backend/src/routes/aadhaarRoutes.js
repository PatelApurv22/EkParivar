const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { logAudit } = require('../services/auditService');

// POST /api/aadhaar/verify - Mock Aadhaar Verification (Demo Flow)
router.post('/verify', async (req, res) => {
  try {
    const { memberId, aadhaarNumber, mobile } = req.body;

    if (!aadhaarNumber || aadhaarNumber.replace(/\s/g, '').length !== 12) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Invalid 12-digit mock Aadhaar format."
      });
    }

    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');

    const member = await Member.findById(memberId);
    if (member) {
      member.aadhaarVerified = true;
      member.aadhaarVerifiedAt = new Date();
      member.aadhaarVerificationMethod = "mock";
      member.aadhaarNumber = cleanAadhaar;
      if (mobile) member.aadhaarLinkedMobile = mobile;
      await member.save();
    }

    await logAudit({
      actorType: "Member",
      actorName: member ? member.name : "Citizen",
      action: "verified_aadhaar",
      targetType: "Member",
      targetId: memberId,
      details: {
        method: "mock",
        maskedAadhaar: `XXXX-XXXX-${cleanAadhaar.slice(-4)}`
      }
    });

    res.json({
      success: true,
      verified: true,
      verificationType: "MOCK",
      message: "Aadhaar verification successful (Demo)"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
