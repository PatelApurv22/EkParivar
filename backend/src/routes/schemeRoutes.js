const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const EligibilityRule = require('../models/EligibilityRule');
const Member = require('../models/Member');
const Family = require('../models/Family');
const EligibilityMatch = require('../models/EligibilityMatch');
const { checkEligibility } = require('../services/eligibilityEngine');
const { logAudit } = require('../services/auditService');

// POST /api/scheme - Create Scheme + Rules + Trigger Engine
router.post('/', async (req, res) => {
  try {
    const { schemeName, schemeCode, department, description, benefitType, benefitAmount, applicationUrl, requiredDocuments, rule } = req.body;

    const code = schemeCode || `GUJ-${Date.now().toString().slice(-4)}`;

    const scheme = new Scheme({
      schemeName,
      schemeCode: code,
      department,
      description,
      benefitType: benefitType || 'Cash',
      benefitAmount: Number(benefitAmount) || 0,
      applicationUrl: applicationUrl || 'https://digitalgujarat.gov.in',
      requiredDocuments: requiredDocuments || ["aadhaar_card", "income_cert"],
      active: true
    });

    await scheme.save();

    // Create Rule
    const ruleObj = new EligibilityRule({
      schemeId: scheme._id,
      maxIncome: rule ? (Number(rule.maxIncome) || 0) : 0,
      minAge: rule ? (Number(rule.minAge) || 0) : 0,
      maxAge: rule ? (Number(rule.maxAge) || 120) : 120,
      requiredGender: rule ? (rule.requiredGender || 'Any') : 'Any',
      requiredCategory: rule ? (rule.requiredCategory || ["General", "OBC", "SC", "ST", "SEBC", "EWS"]) : ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiresBPL: rule ? !!rule.requiresBPL : false,
      requiresWidow: rule ? !!rule.requiresWidow : false,
      requiresDisabled: rule ? !!rule.requiresDisabled : false,
      minDisabilityPercent: rule ? (Number(rule.minDisabilityPercent) || 0) : 0,
      requiresPregnantOrLactating: rule ? !!rule.requiresPregnantOrLactating : false,
      requiredOccupation: rule ? (rule.requiredOccupation || '') : '',
      minEducationPercent: rule ? (Number(rule.minEducationPercent) || 0) : 0
    });

    await ruleObj.save();

    // Trigger matching engine
    const members = await Member.find();
    let eligibleCount = 0;

    for (const member of members) {
      const family = await Family.findOne({ familyId: member.familyId });
      const evalResult = checkEligibility(member, family, ruleObj, scheme);

      if (evalResult.isEligible) eligibleCount++;

      await EligibilityMatch.findOneAndUpdate(
        { memberId: member._id, schemeId: scheme._id },
        {
          memberId: member._id,
          schemeId: scheme._id,
          matchedOn: new Date(),
          isEligible: evalResult.isEligible,
          matchedCriteria: evalResult.matchedCriteria,
          missingCriteria: evalResult.missingCriteria,
          missingDocuments: evalResult.missingDocuments
        },
        { upsert: true, new: true }
      );
    }

    await logAudit({
      actorType: "Officer",
      actorName: "Government Officer",
      action: "created_scheme",
      targetType: "Scheme",
      targetId: scheme._id.toString(),
      details: { schemeCode: code, eligibleCount }
    });

    res.status(201).json({
      success: true,
      scheme,
      rule: ruleObj,
      eligibleCount,
      message: `Scheme created successfully. ${eligibleCount} eligible members found.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/scheme - Get all active schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find({ active: true }).sort({ createdAt: -1 });
    const result = [];
    for (const sch of schemes) {
      const rule = await EligibilityRule.findOne({ schemeId: sch._id });
      result.push({
        ...sch.toObject(),
        rule: rule ? rule.toObject() : {}
      });
    }
    res.json({ success: true, schemes: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
