import axios from 'axios';
import { MOCK_FAMILIES, MOCK_MEMBERS, MOCK_SCHEMES, MOCK_ENROLLMENTS, MOCK_AUDIT_LOGS } from '../data/mockData';
import { checkEligibility } from '../utils/eligibilityEngine';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Local storage state initialization for seamless mock persistence during demo
const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`ekp_state_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveState = (key, data) => {
  try {
    localStorage.setItem(`ekp_state_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save local state:", e);
  }
};

let localFamilies = loadState('families', MOCK_FAMILIES);
let localMembers = loadState('members', MOCK_MEMBERS);
let localSchemes = loadState('schemes', MOCK_SCHEMES);
let localEnrollments = loadState('enrollments', MOCK_ENROLLMENTS);
let localAuditLogs = loadState('auditLogs', MOCK_AUDIT_LOGS);

// Create Axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 4000
});

// Attach JWT Bearer token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ekparivar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const apiService = {
  // Authentication
  login: async (role, mobile, otp) => {
    try {
      const res = await apiClient.post('/auth/login', { role, mobile, otp });
      return res.data;
    } catch (err) {
      // Mock fallback: resolve family by mobile
      let familyMatch = localFamilies.find(f => f.mobile === mobile);
      if (!familyMatch && role === 'family') {
        // Auto-generate family for new mobile
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.floor(1000 + Math.random() * 9000);
        const autoFamId = `EKP-${todayStr}-${rand}`;
        familyMatch = {
          _id: `fam_${Date.now()}`,
          familyId: autoFamId,
          headOfFamilyName: "Citizen HOF",
          address: {
            houseNo: "House 101",
            street: "Station Road",
            village: "Gandhinagar",
            taluka: "Gandhinagar",
            district: "Gandhinagar",
            state: "Gujarat",
            pincode: "382010"
          },
          rationCardNo: "RC-GUJ-9900123",
          rationCardType: "BPL",
          totalIncome: 120000,
          incomeSource: "Labor & Agriculture",
          category: "OBC",
          religion: "Hinduism",
          mobile: mobile,
          email: "",
          bankDetails: { linkedToAadhaar: true },
          documents: [],
          status: "verified"
        };
        localFamilies.push(familyMatch);
        saveState('families', localFamilies);

        // Create initial HOF member
        const hofMember = {
          _id: `mem_${Date.now()}`,
          familyId: autoFamId,
          name: "Citizen HOF",
          aadhaarNumber: "998811223344",
          aadhaarVerified: false,
          aadhaarVerificationMethod: "mock",
          dob: "1985-05-15",
          gender: "M",
          relationToHOF: "Self",
          maritalStatus: "Married",
          occupation: "Self Employed",
          monthlyIncome: 10000,
          mobile: mobile,
          documents: [{ documentType: "aadhaar_card", verified: false }]
        };
        localMembers.push(hofMember);
        saveState('members', localMembers);
      }

      // Generate a mock JWT-like token for offline/fallback mode
      const mockToken = `mock.${btoa(JSON.stringify({ role, mobile, familyId: familyMatch ? familyMatch.familyId : 'EKP-20260920-0001' }))}.mockSig`;

      return {
        success: true,
        role,
        mobile,
        familyId: familyMatch ? familyMatch.familyId : 'EKP-20260920-0001',
        token: mockToken,
        message: "Mock login successful"
      };
    }
  },

  // Create New Family Application (4-Step Wizard -> Pending Officer Approval)
  submitFamilyApplication: async (applicationData) => {
    try {
      const res = await apiClient.post('/family/apply', applicationData);
      return res.data;
    } catch (err) {
      const currentYear = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const appRef = `APP-GUJ-${currentYear}-${rand}`;

      const newApp = {
        _id: `app_${Date.now()}`,
        applicationRefNo: appRef,
        ...applicationData,
        status: "pending_approval",
        createdAt: new Date().toISOString()
      };

      let localApps = loadState('applications', []);
      localApps.unshift(newApp);
      saveState('applications', localApps);

      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Member",
        actorName: applicationData.headOfFamilyName,
        action: "submitted_family_application",
        targetType: "FamilyApplication",
        targetId: appRef,
        timestamp: new Date().toISOString(),
        details: { applicationRefNo: appRef, mobile: applicationData.mobile }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        applicationRefNo: appRef,
        application: newApp,
        status: "pending_approval",
        message: `Application ${appRef} submitted successfully. Pending Government Officer Approval.`
      };
    }
  },

  // Officer Pending Applications Queue
  getPendingApplications: async () => {
    try {
      const res = await apiClient.get('/family/applications/pending');
      return res.data;
    } catch (err) {
      let localApps = loadState('applications', [
        {
          _id: "app_demo_01",
          applicationRefNo: "APP-GUJ-2026-0001",
          headOfFamilyName: "Jayeshbhai Parmar",
          dob: "1984-08-10",
          gender: "M",
          category: "OBC",
          mobile: "9712998877",
          address: { district: "Ahmedabad", village: "Sanand", houseNo: "Plot 45" },
          totalIncome: 140000,
          rationCardType: "BPL",
          aadhaarDetails: { aadhaarNumber: "778899001122", verified: true, method: "mock" },
          documents: [
            { documentType: "income_cert", fileName: "Income_Certificate_Jayesh.pdf" },
            { documentType: "ration_card", fileName: "BPL_Ration_Card.pdf" }
          ],
          status: "pending_approval"
        }
      ]);
      return {
        success: true,
        pendingApplications: localApps.filter(a => a.status === 'pending_approval')
      };
    }
  },

  // Check Citizen Application Status by Mobile
  checkApplicationStatus: async (mobile) => {
    try {
      const res = await apiClient.get(`/family/application/check/${mobile}`);
      return res.data;
    } catch (err) {
      let localApps = loadState('applications', []);
      const app = localApps.find(a => a.mobile === mobile);
      const family = localFamilies.find(f => f.mobile === mobile);

      return {
        success: true,
        hasApplication: !!app,
        application: app,
        family
      };
    }
  },

  // Officer Approve Application -> Issue Family ID
  approveApplication: async (id, officerName) => {
    try {
      const res = await apiClient.post(`/family/applications/${id}/approve`, { officerName });
      return res.data;
    } catch (err) {
      let localApps = loadState('applications', []);
      const app = localApps.find(a => a._id === id);
      if (app) {
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.floor(1000 + Math.random() * 9000);
        const issuedFamilyId = `EKP-${todayStr}-${rand}`;

        app.status = 'approved';
        app.issuedFamilyId = issuedFamilyId;
        saveState('applications', localApps);

        // Also add to localFamilies
        const newFam = {
          _id: `fam_${Date.now()}`,
          familyId: issuedFamilyId,
          headOfFamilyName: app.headOfFamilyName,
          address: app.address || { district: "Gandhinagar" },
          rationCardType: app.rationCardType || "BPL",
          totalIncome: app.totalIncome || 150000,
          category: app.category || "OBC",
          mobile: app.mobile,
          status: "verified"
        };
        localFamilies.push(newFam);
        saveState('families', localFamilies);

        return {
          success: true,
          familyId: issuedFamilyId,
          message: `Application ${app.applicationRefNo} approved! Family ID ${issuedFamilyId} issued.`
        };
      }
      return { success: false, message: "Application approval failed." };
    }
  },

  // Officer Reject Application
  rejectApplication: async (id, reason, officerName) => {
    try {
      const res = await apiClient.post(`/family/applications/${id}/reject`, { reason, officerName });
      return res.data;
    } catch (err) {
      let localApps = loadState('applications', []);
      const app = localApps.find(a => a._id === id);
      if (app) {
        app.status = 'rejected';
        app.rejectionReason = reason;
        saveState('applications', localApps);
        return {
          success: true,
          message: `Application ${app.applicationRefNo} rejected.`
        };
      }
      return { success: false, message: "Rejection failed." };
    }
  },

  // Create Family directly
  createFamily: async (familyData) => {
    try {
      const res = await apiClient.post('/family', familyData);
      return res.data;
    } catch (err) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const autoFamilyId = `EKP-${todayStr}-${rand}`;

      const newFamily = {
        _id: `fam_${Date.now()}`,
        familyId: autoFamilyId,
        headOfFamilyName: familyData.headOfFamilyName,
        address: {
          houseNo: familyData.houseNo || "Plot 1",
          street: familyData.street || "Main Road",
          village: familyData.village || "District Village",
          taluka: familyData.taluka || familyData.district,
          district: familyData.district || "Gandhinagar",
          state: "Gujarat",
          pincode: familyData.pincode || "380001"
        },
        rationCardNo: familyData.rationCardNo || `RC-GUJ-${Math.floor(1000000 + Math.random() * 9000000)}`,
        rationCardType: familyData.rationCardType || "BPL",
        totalIncome: Number(familyData.totalIncome) || 150000,
        incomeSource: familyData.incomeSource || "Agriculture",
        category: familyData.category || "OBC",
        religion: familyData.religion || "Hinduism",
        mobile: familyData.mobile,
        email: familyData.email || "",
        bankDetails: { linkedToAadhaar: true },
        documents: [
          { documentType: "income_cert", verified: true, name: "Income Certificate" },
          { documentType: "ration_card", verified: true, name: "Ration Card" }
        ],
        status: "verified"
      };

      localFamilies.push(newFamily);
      saveState('families', localFamilies);

      // Create Head of Family Member
      const hofMember = {
        _id: `mem_${Date.now()}`,
        familyId: autoFamilyId,
        name: familyData.headOfFamilyName,
        aadhaarNumber: familyData.aadhaarNumber || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        aadhaarVerified: true,
        aadhaarVerifiedAt: new Date().toISOString(),
        aadhaarVerificationMethod: "mock",
        dob: familyData.dob || "1982-04-10",
        gender: familyData.gender || "M",
        relationToHOF: "Self",
        maritalStatus: familyData.maritalStatus || "Married",
        occupation: familyData.incomeSource || "Agriculture",
        monthlyIncome: Math.round((Number(familyData.totalIncome) || 150000) / 12),
        educationLevel: "10th Pass",
        educationPercent: 60,
        mobile: familyData.mobile,
        documents: [{ documentType: "aadhaar_card", verified: true, name: "Aadhaar Card" }]
      };

      localMembers.push(hofMember);
      saveState('members', localMembers);

      // Log Audit
      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Member",
        actorName: familyData.headOfFamilyName,
        action: "created_family",
        targetType: "Family",
        targetId: autoFamilyId,
        timestamp: new Date().toISOString(),
        details: { familyId: autoFamilyId, mobile: familyData.mobile }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        family: newFamily,
        familyId: autoFamilyId,
        member: hofMember,
        message: `Family ID ${autoFamilyId} created successfully.`
      };
    }
  },

  // Family Services
  getFamily: async (familyId) => {
    try {
      const res = await apiClient.get(`/family/${familyId}`);
      return res.data;
    } catch (err) {
      const family = localFamilies.find(f => f.familyId === familyId) || localFamilies[0];
      const members = localMembers.filter(m => m.familyId === family.familyId);
      return {
        success: true,
        family,
        members
      };
    }
  },

  getAllFamilies: async () => {
    try {
      const res = await apiClient.get('/family');
      return res.data;
    } catch (err) {
      return {
        success: true,
        families: localFamilies.map(fam => ({
          ...fam,
          memberCount: localMembers.filter(m => m.familyId === fam.familyId).length
        }))
      };
    }
  },

  // Member Services
  addMember: async (familyId, memberData) => {
    try {
      const res = await apiClient.post(`/family/${familyId}/members`, memberData);
      return res.data;
    } catch (err) {
      const newMember = {
        _id: `mem_${Date.now()}`,
        familyId,
        ...memberData,
        status: "pending_approval",
        addedBy: "Citizen",
        aadhaarVerified: false,
        aadhaarVerificationMethod: "mock",
        documents: memberData.documents || [
          { documentType: "aadhaar_card", verified: false, name: "Aadhaar Card" }
        ]
      };
      localMembers.push(newMember);
      saveState('members', localMembers);

      // Audit Log
      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Member",
        actorName: memberData.name,
        action: "added_member_pending_approval",
        targetType: "Member",
        targetId: newMember._id,
        timestamp: new Date().toISOString(),
        details: { familyId, name: memberData.name }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        member: newMember,
        message: `Member "${memberData.name}" submitted for Government Officer approval.`
      };
    }
  },

  getPendingMembers: async () => {
    try {
      const res = await apiClient.get('/family/members/pending');
      return res.data;
    } catch (err) {
      const pending = localMembers.filter(m => m.status === 'pending_approval');
      const result = pending.map(m => {
        const fam = localFamilies.find(f => f.familyId === m.familyId);
        return {
          ...m,
          headOfFamilyName: fam ? fam.headOfFamilyName : 'Unknown HOF',
          familyAddress: fam ? fam.address : null,
          familyMobile: fam ? fam.mobile : null
        };
      });
      return { success: true, pendingMembers: result };
    }
  },

  approveMember: async (memberId, officerName) => {
    try {
      const res = await apiClient.post(`/family/members/${memberId}/approve`, { officerName });
      return res.data;
    } catch (err) {
      const mem = localMembers.find(m => m._id === memberId);
      if (mem) {
        mem.status = 'approved';
        mem.reviewedBy = officerName || 'Officer Sharma (EMP-8832)';
        mem.reviewedAt = new Date().toISOString();
        saveState('members', localMembers);
        return { success: true, message: `Member "${mem.name}" approved successfully.` };
      }
      return { success: false, message: 'Member not found.' };
    }
  },

  rejectMember: async (memberId, reason, officerName) => {
    try {
      const res = await apiClient.post(`/family/members/${memberId}/reject`, { reason, officerName });
      return res.data;
    } catch (err) {
      const mem = localMembers.find(m => m._id === memberId);
      if (mem) {
        mem.status = 'rejected';
        mem.rejectionReason = reason;
        mem.reviewedBy = officerName || 'Officer Sharma (EMP-8832)';
        mem.reviewedAt = new Date().toISOString();
        saveState('members', localMembers);
        return { success: true, message: `Member "${mem.name}" addition rejected.` };
      }
      return { success: false, message: 'Member not found.' };
    }
  },

  // Mock Aadhaar Verification Service
  verifyAadhaar: async (memberId, aadhaarNumber, mobile) => {
    try {
      const res = await apiClient.post('/aadhaar/verify', { memberId, aadhaarNumber, mobile });
      return res.data;
    } catch (err) {
      // Find and update local member
      const member = localMembers.find(m => m._id === memberId || m.aadhaarNumber === aadhaarNumber);
      if (member) {
        member.aadhaarVerified = true;
        member.aadhaarVerifiedAt = new Date().toISOString();
        member.aadhaarVerificationMethod = "mock";
        member.aadhaarNumber = aadhaarNumber;
        saveState('members', localMembers);
      }

      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Member",
        actorName: member ? member.name : "Citizen",
        action: "verified_aadhaar",
        targetType: "Member",
        targetId: memberId,
        timestamp: new Date().toISOString(),
        details: { method: "mock", aadhaarNumber: `XXXX-XXXX-${aadhaarNumber.slice(-4)}` }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        verified: true,
        verificationType: "MOCK",
        message: "Aadhaar verification successful (Demo)"
      };
    }
  },

  // Scheme Services
  getSchemes: async () => {
    try {
      const res = await apiClient.get('/scheme');
      return res.data;
    } catch (err) {
      return {
        success: true,
        schemes: localSchemes
      };
    }
  },

  createScheme: async (schemeData) => {
    try {
      const res = await apiClient.post('/scheme', schemeData);
      return res.data;
    } catch (err) {
      const newScheme = {
        _id: `sch_${Date.now()}`,
        ...schemeData,
        active: true
      };
      localSchemes.unshift(newScheme);
      saveState('schemes', localSchemes);

      // Recalculate eligible count
      let eligibleCount = 0;
      localMembers.forEach(mem => {
        const fam = localFamilies.find(f => f.familyId === mem.familyId);
        const match = checkEligibility(mem, fam, newScheme);
        if (match.isEligible) eligibleCount++;
      });

      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Officer",
        actorName: "Government Officer",
        action: "created_scheme",
        targetType: "Scheme",
        targetId: newScheme._id,
        timestamp: new Date().toISOString(),
        details: { schemeCode: newScheme.schemeCode, matchedCount: eligibleCount }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        scheme: newScheme,
        eligibleCount,
        message: `Scheme created successfully. ${eligibleCount} eligible members found.`
      };
    }
  },

  // Eligibility Services
  getEligibilityForFamily: async (familyId) => {
    try {
      const res = await apiClient.get(`/eligibility/${familyId}`);
      return res.data;
    } catch (err) {
      const family = localFamilies.find(f => f.familyId === familyId);
      const members = localMembers.filter(m => m.familyId === familyId);

      const results = [];
      members.forEach(member => {
        localSchemes.forEach(scheme => {
          const evalResult = checkEligibility(member, family, scheme);
          const isEnrolled = localEnrollments.some(
            e => e.memberId === member._id && e.schemeId === scheme._id && e.status !== 'revoked'
          );

          results.push({
            member,
            scheme,
            isEligible: evalResult.isEligible,
            isEnrolled,
            matchedCriteria: evalResult.matchedCriteria,
            missingCriteria: evalResult.missingCriteria,
            missingDocuments: evalResult.missingDocuments
          });
        });
      });

      return {
        success: true,
        familyId,
        eligibilityMatches: results
      };
    }
  },

  getAllEligibilityMatches: async () => {
    try {
      const res = await apiClient.get('/eligibility/all');
      return res.data;
    } catch (err) {
      const allMatches = [];
      localMembers.forEach(member => {
        const family = localFamilies.find(f => f.familyId === member.familyId);
        localSchemes.forEach(scheme => {
          const evalResult = checkEligibility(member, family, scheme);
          const enrollment = localEnrollments.find(
            e => e.memberId === member._id && e.schemeId === scheme._id
          );

          allMatches.push({
            memberId: member._id,
            memberName: member.name,
            familyId: member.familyId,
            schemeId: scheme._id,
            schemeName: scheme.schemeName,
            department: scheme.department,
            benefitAmount: scheme.benefitAmount,
            isEligible: evalResult.isEligible,
            isEnrolled: !!enrollment,
            enrollmentStatus: enrollment ? enrollment.status : 'unenrolled',
            matchedCriteria: evalResult.matchedCriteria,
            missingDocuments: evalResult.missingDocuments
          });
        });
      });

      return {
        success: true,
        eligibilityMatches: allMatches
      };
    }
  },

  // Enrollment & Duplicate Services
  enrollMember: async (memberId, schemeId, familyId) => {
    try {
      const res = await apiClient.post('/enrollment', { memberId, schemeId, familyId });
      return res.data;
    } catch (err) {
      const member = localMembers.find(m => m._id === memberId);
      const scheme = localSchemes.find(s => s._id === schemeId);

      // Check for existing active enrollments for same member & same department/category
      const existingEnrollments = localEnrollments.filter(
        e => e.memberId === memberId && e.status !== 'revoked'
      );

      const departmentConflict = existingEnrollments.find(
        e => e.department === scheme.department || e.schemeId === schemeId
      );

      let status = 'pending_approval';
      let message = "Scheme application submitted successfully (Pending Officer Approval)";
      let isDuplicate = false;

      if (departmentConflict) {
        status = 'flagged_duplicate';
        isDuplicate = true;
        message = `⚠ Warning: Enrollment flagged! Member already has an active benefit under '${departmentConflict.department}'.`;
      }

      const newEnrollment = {
        _id: `enr_${Date.now()}`,
        memberId,
        memberName: member ? member.name : 'Unknown Member',
        familyId: familyId || (member ? member.familyId : 'EKP-20260920-0001'),
        schemeId,
        schemeName: scheme ? scheme.schemeName : 'Scheme Benefit',
        department: scheme ? scheme.department : 'Government Department',
        benefitType: scheme ? scheme.benefitType : 'Cash',
        benefitAmount: scheme ? scheme.benefitAmount : 0,
        enrolledOn: new Date().toISOString().split('T')[0],
        status,
        flaggedReason: isDuplicate ? `Conflicting benefit under ${departmentConflict.department}` : null,
        benefitPaid: false
      };

      localEnrollments.unshift(newEnrollment);
      saveState('enrollments', localEnrollments);

      // Log Audit
      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: isDuplicate ? "System Automation" : "Member",
        actorName: member ? member.name : "Member",
        action: isDuplicate ? "flagged_duplicate" : "enrolled_member",
        targetType: "Enrollment",
        targetId: newEnrollment._id,
        timestamp: new Date().toISOString(),
        details: {
          member: member ? member.name : 'Member',
          scheme: scheme ? scheme.schemeName : 'Scheme',
          status
        }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        enrollment: newEnrollment,
        isDuplicate,
        message
      };
    }
  },

  getDuplicateAlerts: async () => {
    try {
      const res = await apiClient.get('/enrollment/duplicates');
      return res.data;
    } catch (err) {
      const duplicates = localEnrollments.filter(e => e.status === 'flagged_duplicate');
      return {
        success: true,
        duplicates
      };
    }
  },

  // Get all pending enrollment applications (for Officer queue)
  getPendingEnrollments: async () => {
    try {
      const res = await apiClient.get('/enrollment/pending');
      return res.data;
    } catch (err) {
      const pending = localEnrollments.filter(e => e.status === 'pending_approval');
      return { success: true, pendingEnrollments: pending };
    }
  },

  // Get all approved/active enrollments (for Officer & Family)
  getApprovedEnrollments: async () => {
    try {
      const res = await apiClient.get('/enrollment/approved');
      return res.data;
    } catch (err) {
      const approved = localEnrollments.filter(e => e.status === 'active' || e.status === 'approved');
      return { success: true, approvedEnrollments: approved };
    }
  },


  // Officer approves an enrollment application
  approveEnrollment: async (enrollmentId, officerName) => {
    try {
      const res = await apiClient.post(`/enrollment/${enrollmentId}/approve`, { officerName });
      return res.data;
    } catch (err) {
      const enr = localEnrollments.find(e => e._id === enrollmentId);
      if (enr) {
        enr.status = 'active';
        enr.approvedBy = officerName || 'Government Officer';
        saveState('enrollments', localEnrollments);
        return { success: true, message: `Enrollment for "${enr.memberName}" approved.` };
      }
      return { success: false, message: 'Enrollment not found.' };
    }
  },

  // Officer rejects an enrollment application
  rejectEnrollment: async (enrollmentId, reason, officerName) => {
    try {
      const res = await apiClient.post(`/enrollment/${enrollmentId}/reject`, { reason, officerName });
      return res.data;
    } catch (err) {
      const enr = localEnrollments.find(e => e._id === enrollmentId);
      if (enr) {
        enr.status = 'rejected';
        enr.flaggedReason = reason;
        saveState('enrollments', localEnrollments);
        return { success: true, message: 'Enrollment rejected.' };
      }
      return { success: false, message: 'Enrollment not found.' };
    }
  },

  // Document Management Services
  ensureDefaultDocuments: () => {
    let localDocs = loadState('documents', []);
    let localFamList = loadState('families', MOCK_FAMILIES);
    let localMemList = loadState('members', MOCK_MEMBERS);
    let modified = false;

    // Ensure mock documents exist for demo families if not present
    localFamList.forEach(fam => {
      const existing = localDocs.filter(d => d.familyId === fam.familyId || (fam.mobile && d.mobile === fam.mobile));
      if (existing.length === 0) {
        localDocs.push({
          _id: `doc_fam_${fam.familyId}_inc`,
          familyId: fam.familyId,
          mobile: fam.mobile,
          documentType: 'Income Certificate',
          fileName: `Income_Certificate_${fam.headOfFamilyName.replace(/\s+/g, '_')}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: 'pdf',
          uploadedAt: new Date().toISOString(),
          status: 'pending'
        });
        localDocs.push({
          _id: `doc_fam_${fam.familyId}_rc`,
          familyId: fam.familyId,
          mobile: fam.mobile,
          documentType: 'Ration Card',
          fileName: `Ration_Card_${fam.rationCardNo || fam.familyId}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: 'pdf',
          uploadedAt: new Date().toISOString(),
          status: 'verified'
        });
        modified = true;
      }
    });

    // Ensure mock documents exist for demo members if not present
    localMemList.forEach(m => {
      const existingMemDoc = localDocs.find(d =>
        (d.familyId === m.familyId || (m.mobile && d.mobile === m.mobile)) &&
        (d.memberId === m._id || (d.documentType === 'Aadhaar Card' && d.memberName === m.name))
      );
      if (!existingMemDoc) {
        localDocs.push({
          _id: `doc_mem_${m._id}_adh`,
          familyId: m.familyId,
          mobile: m.mobile,
          memberId: m._id,
          memberName: m.name,
          documentType: 'Aadhaar Card',
          fileName: `${m.name.replace(/\s+/g, '_')}_Aadhaar.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileType: 'pdf',
          uploadedAt: new Date().toISOString(),
          status: m.aadhaarVerified ? 'verified' : 'pending'
        });
        modified = true;
      }
    });

    if (modified) {
      saveState('documents', localDocs);
    }
    return localDocs;
  },

  uploadDocument: async (formData) => {
    try {
      const res = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } catch (err) {
      console.warn("Backend upload failed, using local fallback");
      const familyId = formData.get('familyId');
      const mobile = formData.get('mobile');
      const documentType = formData.get('documentType');
      const file = formData.get('file');

      if (!familyId && !mobile) {
        return { success: false, message: "familyId or mobile is required for document upload" };
      }
      if (!documentType) {
        return { success: false, message: "documentType is required" };
      }

      let localDocs = loadState('documents', []);
      let localFamList = loadState('families', MOCK_FAMILIES);
      let localApps = loadState('applications', []);

      const matchingFam = localFamList.find(f => f.familyId === familyId || f.mobile === familyId || (mobile && f.mobile === mobile));
      const matchingApp = localApps.find(a => a.applicationRefNo === familyId || a.mobile === familyId || (mobile && a.mobile === mobile));

      const canonicalFamId = matchingFam?.familyId || matchingApp?.issuedFamilyId || familyId || 'EKP-2026-UNKNOWN';
      const canonicalMobile = matchingFam?.mobile || matchingApp?.mobile || mobile || '';
      const canonicalAppRef = matchingApp?.applicationRefNo || '';

      // Convert file to Base64 Data URL for persistent offline previewing
      let fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      let fileType = file && file.type ? file.type : 'pdf';

      if (file && typeof file === 'object') {
        try {
          fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            reader.readAsDataURL(file);
          });
        } catch (e) {
          console.error("Failed to read file as Data URL:", e);
        }
      } else if (typeof file === 'string') {
        fileUrl = file;
      }

      const newDoc = {
        _id: `doc_upload_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        familyId: canonicalFamId,
        mobile: canonicalMobile,
        applicationRefNo: canonicalAppRef,
        documentType,
        fileName: file && file.name ? file.name : `${documentType.replace(/\s+/g, '_')}_Proof.pdf`,
        fileUrl: fileUrl,
        fileType: fileType,
        uploadedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Unshift so newly uploaded documents appear first
      localDocs.unshift(newDoc);
      saveState('documents', localDocs);

      // Log Audit Log
      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Member",
        actorName: matchingFam ? matchingFam.headOfFamilyName : "Citizen Household",
        action: "uploaded_document",
        targetType: "Document",
        targetId: newDoc._id,
        timestamp: new Date().toISOString(),
        details: { familyId: canonicalFamId, documentType, fileName: newDoc.fileName }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        document: newDoc,
        message: `Document "${documentType}" uploaded successfully. Pending Officer Verification.`
      };
    }
  },

  getFamilyDocuments: async (identifier) => {
    try {
      const res = await apiClient.get(`/documents/family/${identifier}`);
      if (res.data && res.data.documents && res.data.documents.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend fetch error, building local family documents fallback:", err);
    }

    let localDocs = apiService.ensureDefaultDocuments();
    let localFamList = loadState('families', MOCK_FAMILIES);
    let localApps = loadState('applications', []);

    const matchingFam = localFamList.find(f => f.familyId === identifier || f.mobile === identifier);
    const matchingApp = localApps.find(a => a.applicationRefNo === identifier || a.mobile === identifier);

    const targetFamId = matchingFam?.familyId || matchingApp?.issuedFamilyId || identifier;
    const targetMobile = matchingFam?.mobile || matchingApp?.mobile;
    const targetAppRef = matchingApp?.applicationRefNo;

    let famDocs = localDocs.filter(d =>
      d.familyId === identifier ||
      (targetFamId && d.familyId === targetFamId) ||
      (targetMobile && d.mobile === targetMobile) ||
      (targetAppRef && d.applicationRefNo === targetAppRef)
    );

    return { success: true, documents: famDocs };
  },

  verifyDocument: async (documentId, officerName) => {
    try {
      const res = await apiClient.post(`/documents/${documentId}/verify`, { officerName });
      return res.data;
    } catch (err) {
      let localDocs = loadState('documents', []);
      const doc = localDocs.find(d => d._id === documentId);
      if (doc) {
        doc.status = 'verified';
        doc.verifiedBy = officerName || 'Officer Sharma (EMP-8832)';
        doc.verifiedAt = new Date().toISOString();
        saveState('documents', localDocs);
        return { success: true, message: `Document "${doc.documentType}" verified successfully.` };
      }
      return { success: true, message: "Document verified (demo)." };
    }
  },

  rejectDocument: async (documentId, reason, officerName) => {
    try {
      const res = await apiClient.post(`/documents/${documentId}/reject`, { reason, officerName });
      return res.data;
    } catch (err) {
      let localDocs = loadState('documents', []);
      const doc = localDocs.find(d => d._id === documentId);
      if (doc) {
        doc.status = 'rejected';
        doc.rejectionReason = reason;
        doc.verifiedBy = officerName || 'Officer Sharma (EMP-8832)';
        doc.verifiedAt = new Date().toISOString();
        saveState('documents', localDocs);
        return { success: true, message: `Document "${doc.documentType}" rejected.` };
      }
      return { success: true, message: "Document rejected (demo)." };
    }
  },

  getAllDocuments: async (status) => {
    try {
      const url = status && status !== 'All' ? `/documents/all?status=${status}` : '/documents/all';
      const res = await apiClient.get(url);
      if (res.data && res.data.documents && res.data.documents.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn("Backend fetch error, building all local documents fallback:", err);
    }

    let localDocs = apiService.ensureDefaultDocuments();

    let filtered = localDocs;
    if (status && status !== 'All') {
      filtered = filtered.filter(d => d.status === status);
    }

    return { success: true, documents: filtered };
  },


  // Audit Logs
  getAuditLogs: async () => {
    try {
      const res = await apiClient.get('/audit');
      return res.data;
    } catch (err) {
      return {
        success: true,
        auditLogs: localAuditLogs
      };
    }
  },

  // ─── TWO-TIER FAMILY EDIT ───────────────────────────────────────────────────

  // Free edits (no approval needed): mobile, email, bank details, name/address corrections
  updateFamilyFreeFields: async (familyId, updates) => {
    try {
      const res = await apiClient.put(`/edit/free/${familyId}`, updates);
      return res.data;
    } catch (err) {
      const family = localFamilies.find(f => f.familyId === familyId);
      if (family) {
        if (updates.mobile) family.mobile = updates.mobile;
        if (updates.email) family.email = updates.email;
        if (updates.bankDetails) family.bankDetails = { ...family.bankDetails, ...updates.bankDetails };
        if (updates.nameCorrection) family.headOfFamilyName = updates.nameCorrection;
        if (updates.addressCorrection) {
          family.address = { ...family.address, ...updates.addressCorrection };
        }
        saveState('families', localFamilies);

        const audit = {
          _id: `aud_${Date.now()}`,
          actorType: "Member",
          actorName: family.headOfFamilyName,
          action: "free_edit_family",
          targetType: "Family",
          targetId: familyId,
          timestamp: new Date().toISOString(),
          details: { fieldsEdited: Object.keys(updates).join(', ') }
        };
        localAuditLogs.unshift(audit);
        saveState('auditLogs', localAuditLogs);

        return {
          success: true,
          family,
          message: "Family profile updated successfully (no approval needed)."
        };
      }
      return { success: false, message: "Family not found." };
    }
  },

  // Restricted edits (require officer approval): income, category, ration card, remove member
  submitRestrictedEditRequest: async (editData) => {
    try {
      const res = await apiClient.post('/edit/restricted', editData);
      return res.data;
    } catch (err) {
      const newEditReq = {
        _id: `edr_${Date.now()}`,
        ...editData,
        status: 'pending_review',
        createdAt: new Date().toISOString()
      };

      let localEditRequests = loadState('editRequests', []);
      localEditRequests.unshift(newEditReq);
      saveState('editRequests', localEditRequests);

      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Member",
        actorName: editData.requestedBy,
        action: "submitted_edit_request",
        targetType: "EditRequest",
        targetId: newEditReq._id,
        timestamp: new Date().toISOString(),
        details: { familyId: editData.familyId, editType: editData.editType, fieldName: editData.fieldName }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        editRequest: newEditReq,
        message: `Edit request for ${editData.fieldName} submitted. Pending Officer review.`
      };
    }
  },

  // Officer: get pending edit requests
  getPendingEditRequests: async () => {
    try {
      const res = await apiClient.get('/edit/restricted/pending');
      return res.data;
    } catch (err) {
      let localEditRequests = loadState('editRequests', []);
      return {
        success: true,
        pendingEditRequests: localEditRequests.filter(r => r.status === 'pending_review')
      };
    }
  },

  // Officer: approve edit request
  approveEditRequest: async (id, officerName) => {
    try {
      const res = await apiClient.post(`/edit/restricted/${id}/approve`, { officerName });
      return res.data;
    } catch (err) {
      let localEditRequests = loadState('editRequests', []);
      const editReq = localEditRequests.find(r => r._id === id);
      if (editReq) {
        const family = localFamilies.find(f => f.familyId === editReq.familyId);
        if (family) {
          if (editReq.editType === 'income_change') family.totalIncome = editReq.requestedValue;
          if (editReq.editType === 'category_change') family.category = editReq.requestedValue;
          if (editReq.editType === 'ration_card_change') family.rationCardType = editReq.requestedValue;
          if (editReq.editType === 'name_correction') {
            const mem = localMembers.find(m => m._id === editReq.targetMemberId);
            if (mem) mem.name = editReq.requestedValue;
            if (!editReq.targetMemberId || editReq.targetMemberName === family.headOfFamilyName) {
              family.headOfFamilyName = editReq.requestedValue;
            }
            saveState('members', localMembers);
          }
          if (editReq.editType === 'address_correction') {
            if (typeof editReq.requestedValue === 'object') {
              family.address = { ...family.address, ...editReq.requestedValue };
            } else {
              family.address = { ...family.address, street: editReq.requestedValue };
            }
          }
          if (editReq.editType === 'remove_member') {
            const idx = localMembers.findIndex(m => m._id === editReq.targetMemberId);
            if (idx > -1) localMembers.splice(idx, 1);
            saveState('members', localMembers);
          }
          saveState('families', localFamilies);
        }

        editReq.status = 'approved';
        editReq.reviewedBy = officerName || "Officer Sharma (EMP-8832)";
        editReq.reviewedAt = new Date().toISOString();
        saveState('editRequests', localEditRequests);

        const audit = {
          _id: `aud_${Date.now()}`,
          actorType: "Officer",
          actorName: editReq.reviewedBy,
          action: "approved_edit_request",
          targetType: "Family",
          targetId: editReq.familyId,
          timestamp: new Date().toISOString(),
          details: { editType: editReq.editType, fieldName: editReq.fieldName, newValue: editReq.requestedValue }
        };
        localAuditLogs.unshift(audit);
        saveState('auditLogs', localAuditLogs);

        return {
          success: true,
          editRequest: editReq,
          message: `Edit approved. ${editReq.fieldName} updated to ${editReq.requestedValue}.`
        };
      }
      return { success: false, message: "Edit request not found." };
    }
  },

  // Officer: reject edit request
  rejectEditRequest: async (id, reason, officerName) => {
    try {
      const res = await apiClient.post(`/edit/restricted/${id}/reject`, { reason, officerName });
      return res.data;
    } catch (err) {
      let localEditRequests = loadState('editRequests', []);
      const editReq = localEditRequests.find(r => r._id === id);
      if (editReq) {
        editReq.status = 'rejected';
        editReq.rejectionReason = reason;
        editReq.reviewedBy = officerName || "Officer Sharma (EMP-8832)";
        saveState('editRequests', localEditRequests);
        return { success: true, message: `Edit request rejected: ${reason}` };
      }
      return { success: false, message: "Edit request not found." };
    }
  },

  // ─── FAMILY SPLITTING ──────────────────────────────────────────────────────

  // Citizen: request family split
  requestFamilySplit: async (splitData) => {
    try {
      const res = await apiClient.post('/split', splitData);
      return res.data;
    } catch (err) {
      const newSplitReq = {
        _id: `spl_${Date.now()}`,
        ...splitData,
        status: 'pending_review',
        createdAt: new Date().toISOString()
      };

      let localSplitRequests = loadState('splitRequests', []);
      localSplitRequests.unshift(newSplitReq);
      saveState('splitRequests', localSplitRequests);

      const audit = {
        _id: `aud_${Date.now()}`,
        actorType: "Member",
        actorName: splitData.requestedBy,
        action: "requested_family_split",
        targetType: "SplitRequest",
        targetId: newSplitReq._id,
        timestamp: new Date().toISOString(),
        details: {
          sourceFamilyId: splitData.sourceFamilyId,
          splitReason: splitData.splitReason,
          newHead: splitData.newHeadMemberName,
          memberCount: splitData.membersToSplit.length
        }
      };
      localAuditLogs.unshift(audit);
      saveState('auditLogs', localAuditLogs);

      return {
        success: true,
        splitRequest: newSplitReq,
        message: `Split request submitted. ${splitData.membersToSplit.length} member(s) proposed to form new household under ${splitData.newHeadMemberName}. Pending Officer review.`
      };
    }
  },

  // Officer: get pending split requests
  getPendingSplitRequests: async () => {
    try {
      const res = await apiClient.get('/split/pending');
      return res.data;
    } catch (err) {
      let localSplitRequests = loadState('splitRequests', []);
      return {
        success: true,
        pendingSplitRequests: localSplitRequests.filter(r => r.status === 'pending_review')
      };
    }
  },

  // Officer: approve split → generate new Family ID
  approveSplitRequest: async (id, officerName) => {
    try {
      const res = await apiClient.post(`/split/${id}/approve`, { officerName });
      return res.data;
    } catch (err) {
      let localSplitRequests = loadState('splitRequests', []);
      const splitReq = localSplitRequests.find(r => r._id === id);
      if (splitReq) {
        const sourceFamily = localFamilies.find(f => f.familyId === splitReq.sourceFamilyId);

        // Generate new Family ID
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.floor(1000 + Math.random() * 9000);
        const newFamilyId = `EKP-${todayStr}-${rand}`;

        // Create new family
        const newFamily = {
          _id: `fam_${Date.now()}`,
          familyId: newFamilyId,
          headOfFamilyName: splitReq.newHeadMemberName,
          address: sourceFamily ? { ...sourceFamily.address } : { district: "Gandhinagar" },
          rationCardType: splitReq.newFamilyRationCardType || 'BPL',
          totalIncome: splitReq.newFamilyIncome || 0,
          category: splitReq.newFamilyCategory || 'General',
          mobile: splitReq.mobile,
          status: 'verified'
        };
        localFamilies.push(newFamily);
        saveState('families', localFamilies);

        // Move members
        for (const memberInfo of splitReq.membersToSplit) {
          const member = localMembers.find(m => m._id === memberInfo.memberId);
          if (member) {
            member.familyId = newFamilyId;
            if (member._id === splitReq.newHeadMemberId) {
              member.relationToHOF = 'Self';
            }
          }
        }
        saveState('members', localMembers);

        splitReq.status = 'approved';
        splitReq.newFamilyId = newFamilyId;
        splitReq.reviewedBy = officerName || "Officer Sharma (EMP-8832)";
        splitReq.reviewedAt = new Date().toISOString();
        saveState('splitRequests', localSplitRequests);

        const audit = {
          _id: `aud_${Date.now()}`,
          actorType: "Officer",
          actorName: splitReq.reviewedBy,
          action: "approved_family_split",
          targetType: "Family",
          targetId: newFamilyId,
          timestamp: new Date().toISOString(),
          details: {
            sourceFamilyId: splitReq.sourceFamilyId,
            newFamilyId,
            newHead: splitReq.newHeadMemberName,
            movedMembers: splitReq.membersToSplit.map(m => m.memberName).join(', ')
          }
        };
        localAuditLogs.unshift(audit);
        saveState('auditLogs', localAuditLogs);

        return {
          success: true,
          splitRequest: splitReq,
          newFamily,
          newFamilyId,
          message: `Family split approved! New Family ID ${newFamilyId} issued for ${splitReq.newHeadMemberName}.`
        };
      }
      return { success: false, message: "Split request not found." };
    }
  },

  // Officer: reject split
  rejectSplitRequest: async (id, reason, officerName) => {
    try {
      const res = await apiClient.post(`/split/${id}/reject`, { reason, officerName });
      return res.data;
    } catch (err) {
      let localSplitRequests = loadState('splitRequests', []);
      const splitReq = localSplitRequests.find(r => r._id === id);
      if (splitReq) {
        splitReq.status = 'rejected';
        splitReq.rejectionReason = reason;
        splitReq.reviewedBy = officerName || "Officer Sharma (EMP-8832)";
        saveState('splitRequests', localSplitRequests);
        return { success: true, message: `Split request rejected: ${reason}` };
      }
      return { success: false, message: "Split request not found." };
    }
  }
};

