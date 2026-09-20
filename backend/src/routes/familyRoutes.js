const express = require('express');
const router = express.Router();
const Family = require('../models/Family');
const Member = require('../models/Member');
const FamilyApplication = require('../models/FamilyApplication');
const Scheme = require('../models/Scheme');
const EligibilityRule = require('../models/EligibilityRule');
const EligibilityMatch = require('../models/EligibilityMatch');
const { checkEligibility } = require('../services/eligibilityEngine');
const { logAudit } = require('../services/auditService');

// POST /api/family/apply - Citizen Submit Family ID Application (4-Step Wizard)
router.post('/apply', async (req, res) => {
  try {
    const {
      headOfFamilyName, dob, gender, category, mobile,
      address, totalIncome, incomeSource, rationCardType,
      aadhaarDetails, documents
    } = req.body;

    const count = await FamilyApplication.countDocuments();
    const currentYear = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const applicationRefNo = `APP-GUJ-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const application = new FamilyApplication({
      applicationRefNo,
      headOfFamilyName,
      dob: dob || new Date(1985, 5, 15),
      gender: gender || 'M',
      category: category || 'OBC',
      mobile,
      address: address || {},
      totalIncome: Number(totalIncome) || 150000,
      incomeSource: incomeSource || 'Agriculture & Labor',
      rationCardType: rationCardType || 'BPL',
      aadhaarDetails: aadhaarDetails || { aadhaarNumber: "453289011234", verified: true, method: "mock" },
      documents: documents || [
        { documentType: "income_cert", fileName: "Income_Certificate.pdf" },
        { documentType: "ration_card", fileName: "Ration_Card.pdf" },
        { documentType: "aadhaar_card", fileName: "Aadhaar_Card.pdf" }
      ],
      status: 'pending_approval'
    });

    await application.save();

    await logAudit({
      actorType: "Member",
      actorName: headOfFamilyName,
      action: "submitted_family_application",
      targetType: "FamilyApplication",
      targetId: applicationRefNo,
      details: { applicationRefNo, mobile }
    });

    res.status(201).json({
      success: true,
      applicationRefNo,
      application,
      status: 'pending_approval',
      message: `Application ${applicationRefNo} submitted successfully. Pending Government Officer Approval.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/family/applications/pending - Officer Review Queue
router.get('/applications/pending', async (req, res) => {
  try {
    const pendingApps = await FamilyApplication.find({ status: 'pending_approval' }).sort({ createdAt: -1 });
    res.json({
      success: true,
      pendingApplications: pendingApps
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/family/application/check/:mobile - Check citizen application status by mobile
router.get('/application/check/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const application = await FamilyApplication.findOne({ mobile }).sort({ createdAt: -1 });
    const family = await Family.findOne({ mobile });

    res.json({
      success: true,
      hasApplication: !!application,
      application,
      family
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/family/applications/:id/approve - Officer Approve & Issue Family ID
router.post('/applications/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const application = await FamilyApplication.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status === 'approved') {
      return res.status(400).json({ success: false, message: "Application already approved", familyId: application.issuedFamilyId });
    }

    // Generate Official Family ID: EKP-YYYYMMDD-XXXX
    const count = await Family.countDocuments();
    const todayStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const issuedFamilyId = `EKP-${todayStr}-${String(count + 1).padStart(4, '0')}`;

    // 1. Create Family Record
    const family = new Family({
      familyId: issuedFamilyId,
      headOfFamilyName: application.headOfFamilyName,
      address: application.address || {
        houseNo: "Plot 12",
        street: "Main Road",
        village: "Gandhinagar",
        taluka: "Gandhinagar",
        district: application.address?.district || "Gandhinagar",
        state: "Gujarat",
        pincode: "382010"
      },
      rationCardNo: `RC-GUJ-${Math.floor(1000000 + Math.random() * 9000000)}`,
      rationCardType: application.rationCardType || "BPL",
      totalIncome: application.totalIncome || 150000,
      incomeSource: application.incomeSource || "Agriculture",
      category: application.category || "OBC",
      religion: "Hinduism",
      mobile: application.mobile,
      documents: application.documents.map(d => ({ documentType: d.documentType, verified: true, fileName: d.fileName })),
      status: "verified"
    });

    await family.save();

    // 2. Create Head of Family Member Record
    const hofMember = new Member({
      familyId: issuedFamilyId,
      name: application.headOfFamilyName,
      aadhaarNumber: application.aadhaarDetails?.aadhaarNumber || "453289011234",
      aadhaarVerified: true,
      aadhaarVerifiedAt: new Date(),
      aadhaarVerificationMethod: "mock",
      dob: application.dob || new Date(1985, 5, 15),
      gender: application.gender || "M",
      relationToHOF: "Self",
      maritalStatus: "Married",
      occupation: application.incomeSource || "Self Employed",
      monthlyIncome: Math.round((application.totalIncome || 150000) / 12),
      educationLevel: "10th Pass",
      educationPercent: 60,
      mobile: application.mobile,
      documents: [{ documentType: "aadhaar_card", verified: true, name: "Aadhaar Card" }]
    });

    await hofMember.save();

    // 3. Update Application Status
    application.status = 'approved';
    application.issuedFamilyId = issuedFamilyId;
    application.reviewedBy = (req.body && req.body.officerName) ? req.body.officerName : "Officer Sharma (EMP-8832)";
    application.reviewedAt = new Date();
    await application.save();

    // 4. Trigger Eligibility Engine for new HOF Member across active schemes
    const activeSchemes = await Scheme.find({ active: true });
    for (const scheme of activeSchemes) {
      const rule = await EligibilityRule.findOne({ schemeId: scheme._id }) || {};
      const evalResult = checkEligibility(hofMember, family, rule, scheme);

      await EligibilityMatch.create({
        memberId: hofMember._id,
        schemeId: scheme._id,
        matchedOn: new Date(),
        isEligible: evalResult.isEligible,
        matchedCriteria: evalResult.matchedCriteria,
        missingCriteria: evalResult.missingCriteria,
        missingDocuments: evalResult.missingDocuments
      });
    }

    // 5. Audit Log
    await logAudit({
      actorType: "Officer",
      actorName: application.reviewedBy,
      action: "approved_family_application",
      targetType: "Family",
      targetId: issuedFamilyId,
      details: {
        applicationRefNo: application.applicationRefNo,
        issuedFamilyId,
        headOfFamilyName: application.headOfFamilyName
      }
    });

    res.json({
      success: true,
      familyId: issuedFamilyId,
      application,
      family,
      member: hofMember,
      message: `Application ${application.applicationRefNo} approved! Family ID ${issuedFamilyId} issued successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/family/applications/:id/reject - Officer Reject Application
router.post('/applications/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, officerName } = req.body || {};

    const application = await FamilyApplication.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    application.status = 'rejected';
    application.rejectionReason = reason || "Application documents or income declaration mismatch.";
    application.reviewedBy = officerName || "Officer Sharma (EMP-8832)";
    application.reviewedAt = new Date();
    await application.save();

    await logAudit({
      actorType: "Officer",
      actorName: application.reviewedBy,
      action: "rejected_family_application",
      targetType: "FamilyApplication",
      targetId: application.applicationRefNo,
      details: {
        applicationRefNo: application.applicationRefNo,
        reason: application.rejectionReason
      }
    });

    res.json({
      success: true,
      application,
      message: `Application ${application.applicationRefNo} has been rejected.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/family - Create family directly (Officer/System)
router.post('/', async (req, res) => {
  try {
    const { headOfFamilyName, address, rationCardNo, rationCardType, totalIncome, category, mobile, email } = req.body;
    
    const count = await Family.countDocuments();
    const todayStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const familyId = `EKP-${todayStr}-${String(count + 1).padStart(4, '0')}`;

    const family = new Family({
      familyId,
      headOfFamilyName,
      address,
      rationCardNo,
      rationCardType: rationCardType || 'BPL',
      totalIncome: totalIncome || 0,
      category: category || 'General',
      mobile,
      email,
      status: 'verified'
    });

    await family.save();

    const hofMember = new Member({
      familyId: family.familyId,
      name: headOfFamilyName,
      dob: req.body.hofDob || new Date(1980, 0, 1),
      gender: req.body.hofGender || 'M',
      relationToHOF: 'Self',
      maritalStatus: req.body.hofMaritalStatus || 'Married',
      occupation: req.body.hofOccupation || 'Working Adult',
      monthlyIncome: Math.round((totalIncome || 0) / 12),
      mobile,
      email,
      documents: [{ documentType: 'aadhaar_card', verified: true }]
    });

    await hofMember.save();

    await logAudit({
      actorType: "Member",
      actorName: headOfFamilyName,
      action: "created_family",
      targetType: "Family",
      targetId: family.familyId,
      details: { familyId: family.familyId, headOfFamilyName }
    });

    res.status(201).json({
      success: true,
      family,
      member: hofMember,
      message: "Family created successfully."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/family - Get all approved families
router.get('/', async (req, res) => {
  try {
    const families = await Family.find().sort({ createdAt: -1 });
    const result = [];
    for (const fam of families) {
      const memberCount = await Member.countDocuments({ familyId: fam.familyId });
      result.push({
        ...fam.toObject(),
        memberCount
      });
    }
    res.json({ success: true, families: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/family/:familyId - Get single family and members
router.get('/:familyId', async (req, res) => {
  try {
    const family = await Family.findOne({ familyId: req.params.familyId });
    if (!family) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }
    const members = await Member.find({ familyId: family.familyId });
    res.json({ success: true, family, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/family/members/pending - Officer Review Queue for Member Additions
router.get('/members/pending', async (req, res) => {
  try {
    const pendingMembers = await Member.find({ status: 'pending_approval' }).sort({ createdAt: -1 });
    const result = [];

    for (const mem of pendingMembers) {
      const family = await Family.findOne({ familyId: mem.familyId });
      result.push({
        ...mem.toObject(),
        headOfFamilyName: family ? family.headOfFamilyName : 'Unknown',
        familyAddress: family ? family.address : null,
        familyMobile: family ? family.mobile : null
      });
    }

    res.json({
      success: true,
      pendingMembers: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/family/members/:id/approve - Officer Approve Member Addition
router.post('/members/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { officerName } = req.body || {};

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    member.status = 'approved';
    member.reviewedBy = officerName || "Officer Sharma (EMP-8832)";
    member.reviewedAt = new Date();
    await member.save();

    // Trigger Eligibility Engine for newly approved member
    const family = await Family.findOne({ familyId: member.familyId });
    if (family) {
      const activeSchemes = await Scheme.find({ active: true });
      for (const scheme of activeSchemes) {
        const rule = await EligibilityRule.findOne({ schemeId: scheme._id }) || {};
        const evalResult = checkEligibility(member, family, rule, scheme);

        await EligibilityMatch.create({
          memberId: member._id,
          schemeId: scheme._id,
          matchedOn: new Date(),
          isEligible: evalResult.isEligible,
          matchedCriteria: evalResult.matchedCriteria,
          missingCriteria: evalResult.missingCriteria,
          missingDocuments: evalResult.missingDocuments
        });
      }
    }

    await logAudit({
      actorType: "Officer",
      actorName: member.reviewedBy,
      action: "approved_member_addition",
      targetType: "Member",
      targetId: member._id.toString(),
      details: { familyId: member.familyId, memberName: member.name }
    });

    res.json({
      success: true,
      member,
      message: `Member "${member.name}" approved successfully and added to Family ID ${member.familyId}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/family/members/:id/reject - Officer Reject Member Addition
router.post('/members/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, officerName } = req.body || {};

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    member.status = 'rejected';
    member.rejectionReason = reason || "Member details or documents verification failed.";
    member.reviewedBy = officerName || "Officer Sharma (EMP-8832)";
    member.reviewedAt = new Date();
    await member.save();

    await logAudit({
      actorType: "Officer",
      actorName: member.reviewedBy,
      action: "rejected_member_addition",
      targetType: "Member",
      targetId: member._id.toString(),
      details: { familyId: member.familyId, memberName: member.name, reason: member.rejectionReason }
    });

    res.json({
      success: true,
      member,
      message: `Member "${member.name}" addition rejected.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/family/:familyId/members - Add member to family (Requires Officer Approval)
router.post('/:familyId/members', async (req, res) => {
  try {
    const { familyId } = req.params;
    const memberData = req.body;

    const member = new Member({
      familyId,
      ...memberData,
      status: 'pending_approval',
      addedBy: 'Citizen',
      aadhaarVerified: false,
      aadhaarVerificationMethod: "mock",
      documents: memberData.documents || [
        { documentType: "aadhaar_card", verified: false }
      ]
    });

    await member.save();

    await logAudit({
      actorType: "Member",
      actorName: member.name,
      action: "added_member_pending_approval",
      targetType: "Member",
      targetId: member._id.toString(),
      details: { familyId, name: member.name }
    });

    res.status(201).json({
      success: true,
      member,
      message: `Member "${member.name}" added and submitted for Government Officer approval.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/family/:familyId/members - Get family members
router.get('/:familyId/members', async (req, res) => {
  try {
    const members = await Member.find({ familyId: req.params.familyId });
    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
