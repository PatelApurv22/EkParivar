const express = require('express');
const router = express.Router();
const Family = require('../models/Family');
const Member = require('../models/Member');
const Scheme = require('../models/Scheme');
const EligibilityRule = require('../models/EligibilityRule');
const Enrollment = require('../models/Enrollment');
const AuditLog = require('../models/AuditLog');
const EligibilityMatch = require('../models/EligibilityMatch');
const { checkEligibility } = require('../services/eligibilityEngine');

const FamilyApplication = require('../models/FamilyApplication');

router.post('/', async (req, res) => {
  try {
    // Clear existing data
    await Family.deleteMany({});
    await Member.deleteMany({});
    await Scheme.deleteMany({});
    await EligibilityRule.deleteMany({});
    await Enrollment.deleteMany({});
    await AuditLog.deleteMany({});
    await EligibilityMatch.deleteMany({});
    await FamilyApplication.deleteMany({});

    // 1. Seed Families
    const f1 = await Family.create({
      familyId: "EKP-20260920-0001",
      headOfFamilyName: "Rameshchandra Patel",
      address: {
        houseNo: "B-402, Shivam Enclave",
        street: "Ashram Road",
        village: "Navrangpura",
        taluka: "Ahmedabad City",
        district: "Ahmedabad",
        state: "Gujarat",
        pincode: "380009"
      },
      rationCardNo: "RC-GUJ-8827491",
      rationCardType: "BPL",
      totalIncome: 180000,
      incomeSource: "Agriculture & Daily Wage",
      category: "OBC",
      religion: "Hinduism",
      mobile: "9876543210",
      email: "ramesh.patel@example.com",
      status: "verified"
    });

    const f2 = await Family.create({
      familyId: "EKP-20260920-0002",
      headOfFamilyName: "Savitaben Solanki",
      address: {
        houseNo: "12, Gram Panchayat Vistar",
        street: "Main Station Road",
        village: "Kalol",
        taluka: "Kalol",
        district: "Gandhinagar",
        state: "Gujarat",
        pincode: "382721"
      },
      rationCardNo: "RC-GUJ-9912043",
      rationCardType: "AAY",
      totalIncome: 72000,
      incomeSource: "Handicrafts & Tailoring",
      category: "SC",
      religion: "Hinduism",
      mobile: "9825012345",
      email: "savitaben.solanki@example.com",
      status: "verified"
    });

    const f3 = await Family.create({
      familyId: "EKP-20260920-0003",
      headOfFamilyName: "Vikramsinh Vaghela",
      address: {
        houseNo: "Plot 88, Sector 11",
        street: "CH Road",
        village: "Gandhinagar",
        taluka: "Gandhinagar",
        district: "Gandhinagar",
        state: "Gujarat",
        pincode: "382011"
      },
      rationCardNo: "RC-GUJ-1188392",
      rationCardType: "APL",
      totalIncome: 450000,
      incomeSource: "Small Retail Business",
      category: "General",
      religion: "Hinduism",
      mobile: "9426098765",
      email: "vikram.vaghela@example.com",
      status: "verified"
    });

    // 2. Seed Members
    const m1 = await Member.create({
      familyId: f1.familyId,
      name: "Rameshchandra Patel",
      aadhaarNumber: "453289011234",
      aadhaarVerified: true,
      aadhaarVerifiedAt: new Date("2026-01-15"),
      aadhaarVerificationMethod: "mock",
      dob: new Date("1975-06-14"),
      gender: "M",
      relationToHOF: "Self",
      maritalStatus: "Married",
      occupation: "Farmer / Daily Wage",
      monthlyIncome: 15000,
      educationLevel: "10th Pass",
      educationPercent: 55,
      mobile: "9876543210"
    });

    const m2 = await Member.create({
      familyId: f1.familyId,
      name: "Pooja Patel",
      aadhaarNumber: "889911223344",
      aadhaarVerified: true,
      aadhaarVerifiedAt: new Date("2026-02-10"),
      aadhaarVerificationMethod: "mock",
      dob: new Date("2005-08-20"),
      gender: "F",
      relationToHOF: "Daughter",
      maritalStatus: "Single",
      occupation: "Student",
      monthlyIncome: 0,
      educationLevel: "B.Tech Computer Science",
      educationPercent: 82.5,
      currentlyEnrolled: true,
      mobile: "9876543211"
    });

    const m3 = await Member.create({
      familyId: f1.familyId,
      name: "Manjula Patel",
      aadhaarNumber: "776655443322",
      aadhaarVerified: false,
      aadhaarVerificationMethod: "mock",
      dob: new Date("1952-11-03"),
      gender: "F",
      relationToHOF: "Mother",
      maritalStatus: "Widow",
      occupation: "Homemaker",
      isWidow: true,
      isSeniorCitizen: true,
      mobile: "9876543212"
    });

    const m4 = await Member.create({
      familyId: f2.familyId,
      name: "Savitaben Solanki",
      aadhaarNumber: "112233445566",
      aadhaarVerified: true,
      aadhaarVerifiedAt: new Date("2026-01-20"),
      aadhaarVerificationMethod: "mock",
      dob: new Date("1980-04-12"),
      gender: "F",
      relationToHOF: "Self",
      maritalStatus: "Widow",
      occupation: "Tailor",
      monthlyIncome: 6000,
      isWidow: true,
      mobile: "9825012345"
    });

    const m5 = await Member.create({
      familyId: f2.familyId,
      name: "Karan Solanki",
      aadhaarNumber: "998877665544",
      aadhaarVerified: true,
      aadhaarVerifiedAt: new Date("2026-03-01"),
      aadhaarVerificationMethod: "mock",
      dob: new Date("2007-01-15"),
      gender: "M",
      relationToHOF: "Son",
      maritalStatus: "Single",
      occupation: "Student",
      educationLevel: "12th Science",
      educationPercent: 76.0,
      isDisabled: true,
      disabilityPercent: 45,
      disabilityType: "Locomotor Disability",
      mobile: "9825012346"
    });

    // 3. Seed Schemes & Rules
    const s1 = await Scheme.create({
      schemeName: "Mukhyamantri Yuva Swavalamban Yojana (MYSY)",
      schemeCode: "GUJ-MYSY-2026",
      department: "Higher & Technical Education Department",
      description: "Financial scholarship assistance for higher education of bright students belonging to economically weaker sections.",
      benefitType: "Cash",
      benefitAmount: 25000,
      applicationUrl: "https://mysy.guj.nic.in",
      requiredDocuments: ["aadhaar_card", "income_cert", "mark_sheet"]
    });

    await EligibilityRule.create({
      schemeId: s1._id,
      maxIncome: 600000,
      minAge: 16,
      maxAge: 25,
      requiredGender: "Any",
      requiredCategory: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiredOccupation: "Student",
      minEducationPercent: 60
    });

    const s2 = await Scheme.create({
      schemeName: "Ganga Swaroopa Yojana (Vidhwa Sahay)",
      schemeCode: "GUJ-GSY-2026",
      department: "Women and Child Development Department",
      description: "Monthly financial pension support to widowed women to foster financial independence and dignity.",
      benefitType: "Cash",
      benefitAmount: 12500,
      applicationUrl: "https://digitalgujarat.gov.in",
      requiredDocuments: ["aadhaar_card", "income_cert", "widow_cert"]
    });

    await EligibilityRule.create({
      schemeId: s2._id,
      maxIncome: 150000,
      minAge: 18,
      maxAge: 75,
      requiredGender: "F",
      requiredCategory: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiresWidow: true
    });

    const s3 = await Scheme.create({
      schemeName: "Divyang Swavalamban Yojana",
      schemeCode: "GUJ-DSY-2026",
      department: "Social Justice and Empowerment Department",
      description: "Financial assistance and assistive equipment subsidy for persons with physical disabilities.",
      benefitType: "Subsidy",
      benefitAmount: 20000,
      applicationUrl: "https://sjebd.gujarat.gov.in",
      requiredDocuments: ["aadhaar_card", "disability_cert"]
    });

    await EligibilityRule.create({
      schemeId: s3._id,
      maxIncome: 500000,
      minAge: 5,
      maxAge: 70,
      requiredGender: "Any",
      requiresDisabled: true,
      minDisabilityPercent: 40
    });

    // 4. Seed Enrollments
    await Enrollment.create({
      memberId: m2._id,
      schemeId: s1._id,
      familyId: f1.familyId,
      memberName: m2.name,
      schemeName: s1.schemeName,
      department: s1.department,
      benefitType: s1.benefitType,
      benefitAmount: s1.benefitAmount,
      status: "active",
      benefitPaid: true
    });

    await Enrollment.create({
      memberId: m4._id,
      schemeId: s2._id,
      familyId: f2.familyId,
      memberName: m4.name,
      schemeName: s2.schemeName,
      department: s2.department,
      benefitType: s2.benefitType,
      benefitAmount: s2.benefitAmount,
      status: "active",
      benefitPaid: true
    });

    const s2_dup = await Scheme.create({
      schemeName: "Nari Sahay Pension Scheme B",
      schemeCode: "GUJ-NSPB-2026",
      department: "Women and Child Development Department",
      description: "Parallel pension support scheme for women.",
      benefitType: "Cash",
      benefitAmount: 10000,
      applicationUrl: "https://digitalgujarat.gov.in"
    });

    // Duplicate enrollment flag
    await Enrollment.create({
      memberId: m4._id,
      schemeId: s2_dup._id,
      familyId: f2.familyId,
      memberName: m4.name,
      schemeName: s2_dup.schemeName,
      department: "Women and Child Development Department",
      benefitType: "Cash",
      benefitAmount: 10000,
      status: "flagged_duplicate",
      flaggedReason: "Conflicting active benefit under Women and Child Development Department",
      benefitPaid: false
    });

    // 5. Run matching engine
    const members = await Member.find();
    const schemes = await Scheme.find();
    for (const member of members) {
      const family = await Family.findOne({ familyId: member.familyId });
      for (const scheme of schemes) {
        const rule = await EligibilityRule.findOne({ schemeId: scheme._id }) || {};
        const evalResult = checkEligibility(member, family, rule, scheme);

        const isEnrolled = await Enrollment.exists({
          memberId: member._id,
          schemeId: scheme._id,
          status: { $ne: 'revoked' }
        });

        await EligibilityMatch.create({
          memberId: member._id,
          schemeId: scheme._id,
          matchedOn: new Date(),
          isEligible: evalResult.isEligible,
          isEnrolled: !!isEnrolled,
          matchedCriteria: evalResult.matchedCriteria,
          missingCriteria: evalResult.missingCriteria,
          missingDocuments: evalResult.missingDocuments
        });
      }
    }

    // 6. Seed Audit Logs
    await AuditLog.create({
      actorType: "Member",
      actorName: "Rameshchandra Patel",
      action: "created_family",
      targetType: "Family",
      targetId: f1.familyId,
      details: { familyId: f1.familyId }
    });

    await AuditLog.create({
      actorType: "System Automation",
      actorName: "Duplicate Detector",
      action: "flagged_duplicate",
      targetType: "Enrollment",
      targetId: m4._id.toString(),
      details: { memberName: m4.name, department: "Women and Child Development Department" }
    });

    // Seed Pending Applications for Officer Review
    await FamilyApplication.create({
      applicationRefNo: "APP-GUJ-2026-0001",
      headOfFamilyName: "Jayeshbhai Parmar",
      dob: new Date("1984-08-10"),
      gender: "M",
      category: "OBC",
      mobile: "9712998877",
      address: {
        houseNo: "Plot 45",
        street: "GIDC Industrial Colony",
        village: "Sanand",
        taluka: "Sanand",
        district: "Ahmedabad",
        state: "Gujarat",
        pincode: "382110"
      },
      totalIncome: 140000,
      incomeSource: "Factory Work",
      rationCardType: "BPL",
      aadhaarDetails: { aadhaarNumber: "778899001122", verified: true, method: "mock" },
      documents: [
        { documentType: "income_cert", fileName: "Income_Certificate_Jayesh.pdf" },
        { documentType: "ration_card", fileName: "BPL_Ration_Card.pdf" },
        { documentType: "aadhaar_card", fileName: "Aadhaar_Jayesh.pdf" }
      ],
      status: "pending_approval"
    });

    await FamilyApplication.create({
      applicationRefNo: "APP-GUJ-2026-0002",
      headOfFamilyName: "Kirtida Chaudhari",
      dob: new Date("1991-03-22"),
      gender: "F",
      category: "ST",
      mobile: "9825998811",
      address: {
        houseNo: "House 88",
        street: "Tribal Colony",
        village: "Vyara",
        taluka: "Vyara",
        district: "Tapi",
        state: "Gujarat",
        pincode: "394650"
      },
      totalIncome: 95000,
      incomeSource: "Handicrafts & Agriculture",
      rationCardType: "AAY",
      aadhaarDetails: { aadhaarNumber: "334411225566", verified: true, method: "mock" },
      documents: [
        { documentType: "income_cert", fileName: "Income_Certificate_Kirtida.pdf" },
        { documentType: "caste_cert", fileName: "ST_Caste_Certificate.pdf" },
        { documentType: "aadhaar_card", fileName: "Aadhaar_Kirtida.pdf" }
      ],
      status: "pending_approval"
    });

    res.json({
      success: true,
      message: "Database seeded successfully with households, members, schemes, rules, pending applications, and audit logs."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
