const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Family = require('../models/Family');
const Scheme = require('../models/Scheme');
const EligibilityRule = require('../models/EligibilityRule');
const EligibilityMatch = require('../models/EligibilityMatch');
const Enrollment = require('../models/Enrollment');
const { checkEligibility } = require('../services/eligibilityEngine');
const { logAudit } = require('../services/auditService');

// POST /api/eligibility/run - Run full matching engine
router.post('/run', async (req, res) => {
  try {
    const members = await Member.find();
    const schemes = await Scheme.find({ active: true });
    let totalProcessed = 0;
    let totalEligible = 0;

    for (const member of members) {
      const family = await Family.findOne({ familyId: member.familyId });
      for (const scheme of schemes) {
        const rule = await EligibilityRule.findOne({ schemeId: scheme._id }) || {};
        const evalResult = checkEligibility(member, family, rule, scheme);
        totalProcessed++;

        const isEnrolled = await Enrollment.exists({
          memberId: member._id,
          schemeId: scheme._id,
          status: { $ne: 'revoked' }
        });

        if (evalResult.isEligible) totalEligible++;

        await EligibilityMatch.findOneAndUpdate(
          { memberId: member._id, schemeId: scheme._id },
          {
            memberId: member._id,
            schemeId: scheme._id,
            matchedOn: new Date(),
            isEligible: evalResult.isEligible,
            isEnrolled: !!isEnrolled,
            matchedCriteria: evalResult.matchedCriteria,
            missingCriteria: evalResult.missingCriteria,
            missingDocuments: evalResult.missingDocuments
          },
          { upsert: true, new: true }
        );
      }
    }

    await logAudit({
      actorType: "System Automation",
      actorName: "Matching Engine",
      action: "eligibility_match",
      targetType: "EligibilityMatch",
      targetId: "global_run",
      details: { totalProcessed, totalEligible }
    });

    res.json({
      success: true,
      totalProcessed,
      totalEligible,
      message: `Eligibility matching completed. ${totalEligible} eligible combinations found.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/eligibility/all - Officer matrix of all matches
router.get('/all', async (req, res) => {
  try {
    const members = await Member.find();
    const schemes = await Scheme.find({ active: true });
    const results = [];

    for (const member of members) {
      const family = await Family.findOne({ familyId: member.familyId });
      for (const scheme of schemes) {
        const rule = await EligibilityRule.findOne({ schemeId: scheme._id }) || {};
        const evalResult = checkEligibility(member, family, rule, scheme);

        const enrollment = await Enrollment.findOne({
          memberId: member._id,
          schemeId: scheme._id
        });

        results.push({
          memberId: member._id,
          memberName: member.name,
          familyId: member.familyId,
          schemeId: scheme._id,
          schemeName: scheme.schemeName,
          schemeCode: scheme.schemeCode,
          department: scheme.department,
          benefitAmount: scheme.benefitAmount,
          isEligible: evalResult.isEligible,
          isEnrolled: !!enrollment,
          enrollmentStatus: enrollment ? enrollment.status : 'unenrolled',
          matchedCriteria: evalResult.matchedCriteria,
          missingDocuments: evalResult.missingDocuments
        });
      }
    }

    res.json({
      success: true,
      eligibilityMatches: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/eligibility/:familyId - Get eligibility matches for a family
router.get('/:familyId', async (req, res) => {
  try {
    const family = await Family.findOne({ familyId: req.params.familyId });
    if (!family) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    const members = await Member.find({ familyId: family.familyId });
    const schemes = await Scheme.find({ active: true });
    const results = [];

    for (const member of members) {
      for (const scheme of schemes) {
        const rule = await EligibilityRule.findOne({ schemeId: scheme._id }) || {};
        const evalResult = checkEligibility(member, family, rule, scheme);

        const enrollment = await Enrollment.findOne({
          memberId: member._id,
          schemeId: scheme._id
        });

        results.push({
          member,
          scheme,
          isEligible: evalResult.isEligible,
          isEnrolled: !!enrollment,
          enrollmentStatus: enrollment ? enrollment.status : 'unenrolled',
          matchedCriteria: evalResult.matchedCriteria,
          missingCriteria: evalResult.missingCriteria,
          missingDocuments: evalResult.missingDocuments
        });
      }
    }

    res.json({
      success: true,
      familyId: req.params.familyId,
      eligibilityMatches: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
