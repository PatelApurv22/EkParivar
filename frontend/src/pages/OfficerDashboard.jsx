import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { calculateAge } from '../utils/eligibilityEngine';
import {
  Users, Layers, ShieldAlert, Sparkles, PlusCircle, Search, Filter,
  CheckCircle2, FileText, AlertTriangle, Activity, Eye, Check, Clock, XCircle, FileCheck,
  Pencil, Scissors, ShieldCheck, FolderOpen, ExternalLink, Upload, UserPlus, UserCheck
} from 'lucide-react';

export const OfficerDashboard = () => {
  const [families, setFamilies] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pendingEditRequests, setPendingEditRequests] = useState([]);
  const [pendingSplitRequests, setPendingSplitRequests] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [approvedEnrollments, setApprovedEnrollments] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [eligibilityMatches, setEligibilityMatches] = useState([]);
  const [duplicateAlerts, setDuplicateAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document Vault State
  const [allVaultDocs, setAllVaultDocs] = useState([]);
  const [vaultDocStatusFilter, setVaultDocStatusFilter] = useState('All');

  // Officer Document Inspection & Verification State
  const [selectedFamilyForDocs, setSelectedFamilyForDocs] = useState(null); // { familyId, headName }
  const [officerFamilyDocs, setOfficerFamilyDocs] = useState([]);
  const [loadingOfficerDocs, setLoadingOfficerDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docActionId, setDocActionId] = useState(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState('pending_apps');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Add Scheme Form State
  const [schemeForm, setSchemeForm] = useState({
    schemeName: '',
    schemeCode: '',
    department: 'Higher & Technical Education Department',
    description: '',
    benefitType: 'Cash',
    benefitAmount: 20000,
    applicationUrl: 'https://digitalgujarat.gov.in',
    requiredDocuments: 'aadhaar_card, income_cert',
    maxIncome: 500000,
    minAge: 18,
    maxAge: 60,
    requiredGender: 'Any',
    requiredCategory: ['General', 'OBC', 'SC', 'ST', 'SEBC', 'EWS'],
    requiresBPL: false,
    requiresWidow: false,
    requiresDisabled: false,
    minDisabilityPercent: 40,
    requiresPregnantOrLactating: false,
    requiredOccupation: '',
    minEducationPercent: 0
  });

  const [formMsg, setFormMsg] = useState(null);
  const [submittingScheme, setSubmittingScheme] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const famRes = await apiService.getAllFamilies();
      if (famRes.success) setFamilies(famRes.families || []);

      const pendingRes = await apiService.getPendingApplications();
      if (pendingRes.success) setPendingApps(pendingRes.pendingApplications || []);

      const pendingMemRes = await apiService.getPendingMembers();
      if (pendingMemRes.success) setPendingMembers(pendingMemRes.pendingMembers || []);

      const docVaultRes = await apiService.getAllDocuments();
      if (docVaultRes.success) setAllVaultDocs(docVaultRes.documents || []);

      const editRes = await apiService.getPendingEditRequests();
      if (editRes.success) setPendingEditRequests(editRes.requests || []);

      const splitRes = await apiService.getPendingSplitRequests();
      if (splitRes.success) setPendingSplitRequests(splitRes.requests || []);

      const enrollRes = await apiService.getPendingEnrollments();
      if (enrollRes.success) setPendingEnrollments(enrollRes.pendingEnrollments || []);

      const apprRes = await apiService.getApprovedEnrollments();
      if (apprRes.success) setApprovedEnrollments(apprRes.approvedEnrollments || []);

      const schRes = await apiService.getSchemes();
      if (schRes.success) setSchemes(schRes.schemes || []);

      const eligRes = await apiService.getAllEligibilityMatches();
      if (eligRes.success) setEligibilityMatches(eligRes.eligibilityMatches || []);

      const dupRes = await apiService.getDuplicateAlerts();
      if (dupRes.success) setDuplicateAlerts(dupRes.duplicates || []);

      const audRes = await apiService.getAuditLogs();
      if (audRes.success) setAuditLogs(audRes.auditLogs || []);
    } catch (err) {
      console.error("Error loading officer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveMember = async (memberId) => {
    setActionLoadingId(memberId);
    try {
      const res = await apiService.approveMember(memberId, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to approve member addition.");
    }
  };

  const handleRejectMember = async (memberId) => {
    const reason = prompt("Enter Rejection Reason for Member Addition:", "Member details or documents verification failed.");
    if (!reason || !reason.trim()) return;

    setActionLoadingId(memberId);
    try {
      const res = await apiService.rejectMember(memberId, reason, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to reject member addition.");
    }
  };

  const handleApproveApplication = async (appId) => {
    setActionLoadingId(appId);
    try {
      const res = await apiService.approveApplication(appId, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to approve application.");
    }
  };

  const handleRejectApplication = async (appId) => {
    const reason = prompt("Enter Rejection Reason:", "Document verification failed or income declaration mismatch.");
    if (!reason) return;

    setActionLoadingId(appId);
    try {
      const res = await apiService.rejectApplication(appId, reason, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to reject application.");
    }
  };

  const openFamilyDocsModal = async (familyId, headName) => {
    setSelectedFamilyForDocs({ familyId, headName });
    setLoadingOfficerDocs(true);
    try {
      const res = await apiService.getFamilyDocuments(familyId);
      setOfficerFamilyDocs(res.documents || []);
    } catch (err) {
      console.error("Error fetching family documents:", err);
    } finally {
      setLoadingOfficerDocs(false);
    }
  };

  const handleVerifyDocument = async (docId) => {
    setDocActionId(docId);
    try {
      const res = await apiService.verifyDocument(docId, "Officer Sharma (EMP-8832)");
      setDocActionId(null);
      if (res.success) {
        alert(res.message);
        if (selectedFamilyForDocs) {
          const updatedDocs = await apiService.getFamilyDocuments(selectedFamilyForDocs.familyId);
          setOfficerFamilyDocs(updatedDocs.documents || []);
        }
      } else {
        alert(res.message || "Failed to verify document.");
      }
    } catch (err) {
      setDocActionId(null);
      alert("Error verifying document.");
    }
  };

  const handleRejectDocument = async (docId) => {
    const reason = prompt("Enter Rejection Reason for this document (Required):", "Document is blurred, illegible, or expired.");
    if (!reason || !reason.trim()) {
      alert("Rejection reason is required.");
      return;
    }

    setDocActionId(docId);
    try {
      const res = await apiService.rejectDocument(docId, reason, "Officer Sharma (EMP-8832)");
      setDocActionId(null);
      if (res.success) {
        alert(res.message);
        if (selectedFamilyForDocs) {
          const updatedDocs = await apiService.getFamilyDocuments(selectedFamilyForDocs.familyId);
          setOfficerFamilyDocs(updatedDocs.documents || []);
        }
      } else {
        alert(res.message || "Failed to reject document.");
      }
    } catch (err) {
      setDocActionId(null);
      alert("Error rejecting document.");
    }
  };

  const handleApproveEditRequest = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await apiService.approveEditRequest(id, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to approve edit request.");
    }
  };

  const handleRejectEditRequest = async (id) => {
    const reason = prompt("Enter Rejection Reason:", "Document verification mismatch.");
    if (!reason) return;
    setActionLoadingId(id);
    try {
      const res = await apiService.rejectEditRequest(id, reason, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to reject edit request.");
    }
  };

  const handleApproveSplitRequest = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await apiService.approveSplitRequest(id, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to approve split request.");
    }
  };

  const handleRejectSplitRequest = async (id) => {
    const reason = prompt("Enter Rejection Reason:", "Split conditions not satisfied.");
    if (!reason) return;
    setActionLoadingId(id);
    try {
      const res = await apiService.rejectSplitRequest(id, reason, "Officer Sharma (EMP-8832)");
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert("Failed to reject split request.");
    }
  };

  const handleSchemeFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSchemeForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryToggle = (cat) => {
    setSchemeForm(prev => {
      const current = prev.requiredCategory || [];
      if (current.includes(cat)) {
        return { ...prev, requiredCategory: current.filter(c => c !== cat) };
      } else {
        return { ...prev, requiredCategory: [...current, cat] };
      }
    });
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setSubmittingScheme(true);
    setFormMsg(null);

    try {
      const payload = {
        schemeName: schemeForm.schemeName,
        schemeCode: schemeForm.schemeCode || `GUJ-${Date.now().toString().slice(-4)}`,
        department: schemeForm.department,
        description: schemeForm.description,
        benefitType: schemeForm.benefitType,
        benefitAmount: Number(schemeForm.benefitAmount) || 0,
        applicationUrl: schemeForm.applicationUrl,
        requiredDocuments: schemeForm.requiredDocuments.split(',').map(s => s.trim()),
        rule: {
          maxIncome: Number(schemeForm.maxIncome) || 0,
          minAge: Number(schemeForm.minAge) || 0,
          maxAge: Number(schemeForm.maxAge) || 120,
          requiredGender: schemeForm.requiredGender,
          requiredCategory: schemeForm.requiredCategory,
          requiresBPL: schemeForm.requiresBPL,
          requiresWidow: schemeForm.requiresWidow,
          requiresDisabled: schemeForm.requiresDisabled,
          minDisabilityPercent: Number(schemeForm.minDisabilityPercent) || 0,
          requiresPregnantOrLactating: schemeForm.requiresPregnantOrLactating,
          requiredOccupation: schemeForm.requiredOccupation,
          minEducationPercent: Number(schemeForm.minEducationPercent) || 0
        }
      };

      const res = await apiService.createScheme(payload);
      setSubmittingScheme(false);
      setFormMsg(res);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      setSubmittingScheme(false);
      setFormMsg({ success: false, message: 'Failed to create scheme.' });
    }
  };

  const handleOfficerEnroll = async (memberId, schemeId, familyId) => {
    try {
      const res = await apiService.enrollMember(memberId, schemeId, familyId);
      alert(res.message);
      fetchData();
    } catch (err) {
      alert("Enrollment failed.");
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    setActionLoadingId(enrollmentId);
    try {
      const res = await apiService.approveEnrollment(enrollmentId, 'Officer Sharma (EMP-8832)');
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert('Failed to approve enrollment.');
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    const reason = prompt('Enter rejection reason:', 'Criteria verification failed.');
    if (!reason) return;
    setActionLoadingId(enrollmentId);
    try {
      const res = await apiService.rejectEnrollment(enrollmentId, reason, 'Officer Sharma (EMP-8832)');
      setActionLoadingId(null);
      alert(res.message);
      fetchData();
    } catch (err) {
      setActionLoadingId(null);
      alert('Failed to reject enrollment.');
    }
  };

  // Stats derived calculations
  const totalFamilies = families.length;
  const totalPendingApps = pendingApps.length;
  const totalActiveSchemes = schemes.length;
  const totalEligibleUnenrolled = eligibilityMatches.filter(m => m.isEligible && !m.isEnrolled).length;
  const totalFlaggedDuplicates = duplicateAlerts.length;

  const filteredFamilies = families.filter(fam => {
    const matchesSearch = fam.familyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fam.headOfFamilyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (fam.address && fam.address.district && fam.address.district.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || fam.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-600">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-medium text-sm">Loading Officer Command Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* OFFICER PORTAL HEADER BANNER */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 rounded">
              GOVERNMENT OFFICER PORTAL
            </span>
            <span className="text-slate-400 text-xs font-mono">Department of Social Justice & Empowerment</span>
          </div>
          <h2 className="text-2xl font-black text-white m-0 mt-2">
            Family Application Approvals & Beneficiary Control
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Review citizen applications, verify documents, issue Family IDs, and monitor duplicate benefits.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('add_scheme')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          + Define New Scheme & Rules
        </button>
      </div>

      {/* 1. EXECUTIVE STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Pending Applications</span>
            <strong className="text-xl font-extrabold text-amber-700">{totalPendingApps}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Pending Members</span>
            <strong className="text-xl font-extrabold text-indigo-700">{pendingMembers.length}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Pending Documents</span>
            <strong className="text-xl font-extrabold text-blue-700">
              {allVaultDocs.filter(d => d.status === 'pending').length}
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Families Registered</span>
            <strong className="text-xl font-extrabold text-slate-900">{totalFamilies}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-700 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Flagged Duplicates</span>
            <strong className="text-xl font-extrabold text-red-600">{totalFlaggedDuplicates}</strong>
          </div>
        </div>
      </div>

      {/* OFFICER TABS NAVIGATION — GROUPED */}
      <div className="bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        
        {/* GROUP 1: APPLICATIONS & APPROVALS QUEUE */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            1. Applications & Approvals Queue (Citizen-Initiated Actions)
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('pending_apps')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'pending_apps'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Family Applications ({pendingApps.length})
            </button>

            <button
              onClick={() => setActiveTab('member_requests')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'member_requests'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Member Addition Queue ({pendingMembers.length})
            </button>

            <button
              onClick={() => setActiveTab('edit_requests')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'edit_requests'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Requests ({pendingEditRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('split_requests')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'split_requests'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Split Requests ({pendingSplitRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('enrollment_queue')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'enrollment_queue'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Scheme Enrollment Queue ({pendingEnrollments.length})
            </button>
          </div>
        </div>

        {/* GROUP 2: DOCUMENT VERIFICATION VAULT */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            2. Document Verification Vault (Proof Inspection)
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('document_vault')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'document_vault'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Central Document Vault ({allVaultDocs.length})
            </button>
          </div>
        </div>

        {/* GROUP 3: SCHEMES & ELIGIBILITY */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            3. Schemes & Eligibility (Management & Rules)
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('add_scheme')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'add_scheme'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Scheme & Define Rules
            </button>

            <button
              onClick={() => setActiveTab('eligibility')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'eligibility'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Eligibility Matrix ({eligibilityMatches.length})
            </button>

            <button
              onClick={() => setActiveTab('approved_schemes')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'approved_schemes'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Approved Schemes ({approvedEnrollments.length})
            </button>
          </div>
        </div>

        {/* GROUP 4: REGISTRY & MONITORING */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            4. Registry & Monitoring (Oversight & Audit)
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('families')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'families'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Issued Family IDs ({families.length})
            </button>

            <button
              onClick={() => setActiveTab('duplicates')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'duplicates'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Duplicate Alerts ({duplicateAlerts.length})
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Audit Trail Log
            </button>
          </div>
        </div>

      </div>



      {/* TAB: MEMBER ADDITION QUEUE */}
      {activeTab === 'member_requests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Member Addition Requests — Pending Officer Approval
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Citizens have requested to add new family members. Review member details, academic history, special status, and inspect supporting documents to approve or reject.
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs">
              {pendingMembers.length} Pending Approval
            </span>
          </div>

          {pendingMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              ✓ No pending member addition requests. All member additions have been reviewed.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMembers.map((mem) => {
                const age = calculateAge(mem.dob);
                return (
                  <div key={mem._id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs space-y-4 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-amber-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                            Family ID: {mem.familyId}
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Officer Approval
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                          {mem.name}
                          <span className="text-xs font-semibold text-slate-500">({mem.relationToHOF} of HOF: {mem.headOfFamilyName})</span>
                        </h4>
                        <p className="text-slate-500 text-[11px] m-0">
                          District: <strong>{mem.familyAddress?.district || 'Gandhinagar'}</strong> | HOF Contact: <strong>{mem.familyMobile || mem.mobile || 'N/A'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openFamilyDocsModal(mem.familyId, mem.headOfFamilyName)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                        >
                          <FolderOpen className="w-4 h-4 text-indigo-600" />
                          Inspect Documents
                        </button>

                        <button
                          onClick={() => handleApproveMember(mem._id)}
                          disabled={actionLoadingId === mem._id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Member
                        </button>

                        <button
                          onClick={() => handleRejectMember(mem._id)}
                          disabled={actionLoadingId === mem._id}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Member Attribute Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Age / Gender</span>
                        <strong className="text-slate-900">{age} yrs / {mem.gender}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Aadhaar Number</span>
                        <strong className="font-mono text-slate-900">{mem.aadhaarNumber ? `XXXX-XXXX-${mem.aadhaarNumber.slice(-4)}` : 'Not Provided'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Marital Status</span>
                        <strong className="text-slate-900">{mem.maritalStatus || 'Single'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Occupation</span>
                        <strong className="text-slate-900">{mem.occupation || 'Student'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Monthly Income</span>
                        <strong className="text-slate-900">₹{Number(mem.monthlyIncome || 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Contact</span>
                        <strong className="text-slate-900">{mem.mobile || 'Same as HOF'}</strong>
                      </div>
                    </div>

                    {/* Academic History Records */}
                    {mem.educationRecords && mem.educationRecords.length > 0 && (
                      <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg space-y-1">
                        <span className="text-[10px] font-bold text-amber-900 block uppercase tracking-wider">Academic History Records:</span>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {mem.educationRecords.map((edu, eIdx) => (
                            <span key={eIdx} className="bg-white border border-amber-300 px-2.5 py-1 rounded-md text-amber-950 font-medium">
                              🎓 <strong>{edu.level}</strong>: {edu.percentage}% ({edu.yearOfPassing || 'Passed'}) - {edu.boardOrUniversity || 'Board'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special Status Indicators */}
                    <div className="flex flex-wrap items-center gap-2">
                      {mem.isDisabled && (
                        <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          ♿ Disabled ({mem.disabilityPercent}% - {mem.disabilityType || 'General'})
                        </span>
                      )}
                      {mem.isWidow && (
                        <span className="bg-purple-100 text-purple-900 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          🕊 Widow Status
                        </span>
                      )}
                      {mem.isPregnantOrLactating && (
                        <span className="bg-pink-100 text-pink-900 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          👶 Pregnant / Lactating Mother
                        </span>
                      )}
                      {mem.currentlyEnrolled && (
                        <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          📚 Enrolled in {mem.currentClassOrCourse || 'School/College'}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: DOCUMENT VERIFICATION VAULT */}
      {activeTab === 'document_vault' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                Document Verification Vault — Centralized Proof Repository
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect, verify, or reject all supporting documents uploaded by citizen households across Gujarat.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['All', 'pending', 'verified', 'rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => setVaultDocStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                    vaultDocStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'All' ? 'All Documents' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by Family ID, Document Type, or File Name..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Documents Table */}
          {(() => {
            const filteredDocs = allVaultDocs.filter(d => {
              const matchesStatus = vaultDocStatusFilter === 'All' || d.status === vaultDocStatusFilter;
              const matchesQuery = !searchQuery || 
                (d.familyId && d.familyId.toLowerCase().includes(searchQuery.toLowerCase())) || 
                (d.documentType && d.documentType.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (d.fileName && d.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
              return matchesStatus && matchesQuery;
            });

            if (filteredDocs.length === 0) {
              return (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No documents match the current filter or search criteria.
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3">Document Type</th>
                      <th className="p-3">Family ID</th>
                      <th className="p-3">File Name</th>
                      <th className="p-3">Uploaded Date</th>
                      <th className="p-3">Verification Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredDocs.map((doc) => (
                      <tr key={doc._id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900">
                          {doc.documentType}
                        </td>
                        <td className="p-3">
                          <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                            {doc.familyId}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          {doc.fileName}
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(doc.uploadedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3">
                          {doc.status === 'verified' && (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified ({doc.verifiedBy || 'Officer'})
                            </span>
                          )}
                          {doc.status === 'pending' && (
                            <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                            </span>
                          )}
                          {doc.status === 'rejected' && (
                            <span className="bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1 border border-red-300" title={doc.rejectionReason}>
                              <AlertTriangle className="w-3 h-3 text-red-600" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" /> Preview
                            </button>

                            {doc.status !== 'verified' && (
                              <button
                                onClick={async () => {
                                  await handleVerifyDocument(doc._id);
                                  const updated = await apiService.getAllDocuments();
                                  setAllVaultDocs(updated.documents || []);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition"
                              >
                                <Check className="w-3.5 h-3.5" /> Verify
                              </button>
                            )}

                            {doc.status !== 'rejected' && (
                              <button
                                onClick={async () => {
                                  await handleRejectDocument(doc._id);
                                  const updated = await apiService.getAllDocuments();
                                  setAllVaultDocs(updated.documents || []);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium px-2 py-1 rounded text-[11px] flex items-center gap-1 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: ENROLLMENT APPLICATIONS QUEUE */}
      {activeTab === 'enrollment_queue' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Scheme Enrollment Applications — Pending Approval
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Family members have applied to enroll in eligible schemes. Review and approve or reject each application.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full text-xs">
              {pendingEnrollments.length} Pending
            </span>
          </div>

          {pendingEnrollments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              ✓ No pending enrollment applications. All scheme enrollments have been reviewed.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEnrollments.map((enr) => (
                <div key={enr._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Scheme</span>
                      <strong className="text-slate-900 text-sm">{enr.schemeName || enr.schemeId?.schemeName}</strong>
                      <span className="text-slate-500 ml-2 text-[11px]">({enr.department || enr.schemeId?.department})</span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pending Approval
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                    <div><span className="text-slate-400 block text-[10px]">Beneficiary Name:</span><strong>{enr.memberName || enr.memberId?.name}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">Family ID:</span><strong className="font-mono">{enr.familyId}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">Benefit Amount:</span><strong className="text-emerald-700">₹{(enr.benefitAmount || enr.schemeId?.benefitAmount || 0).toLocaleString('en-IN')}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">Applied On:</span><strong>{enr.enrolledOn ? new Date(enr.enrolledOn).toLocaleDateString('en-IN') : 'Today'}</strong></div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleApproveEnrollment(enr._id)}
                      disabled={actionLoadingId === enr._id}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {actionLoadingId === enr._id ? 'Processing...' : 'Approve Enrollment'}
                    </button>
                    <button
                      onClick={() => handleRejectEnrollment(enr._id)}
                      disabled={actionLoadingId === enr._id}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: APPROVED SCHEMES */}
      {activeTab === 'approved_schemes' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Approved Scheme Beneficiaries ({approvedEnrollments.length})
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Official register of all active & approved scheme enrollments across families.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
                Total Active Benefits: ₹{approvedEnrollments.reduce((sum, e) => sum + (e.benefitAmount || e.schemeId?.benefitAmount || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Search filter for approved schemes */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Beneficiary Name, Family ID, or Scheme Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {approvedEnrollments.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">No Approved Scheme Applications Yet</p>
              <p className="text-xs">Approve pending applications from the "Enrollment Queue" tab to view them here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Beneficiary Name</th>
                    <th className="p-3">Family ID</th>
                    <th className="p-3">Scheme Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Benefit Amount</th>
                    <th className="p-3">Approval Status</th>
                    <th className="p-3">Approved By</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {approvedEnrollments
                    .filter(e => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        (e.memberName || e.memberId?.name || '').toLowerCase().includes(q) ||
                        (e.familyId || '').toLowerCase().includes(q) ||
                        (e.schemeName || e.schemeId?.schemeName || '').toLowerCase().includes(q) ||
                        (e.department || e.schemeId?.department || '').toLowerCase().includes(q)
                      );
                    })
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 font-medium">
                        <td className="p-3 text-slate-900 font-bold">
                          {item.memberName || item.memberId?.name || 'N/A'}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">
                          {item.familyId || item.memberId?.familyId || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-800 font-bold">
                          {item.schemeName || item.schemeId?.schemeName || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-500">
                          {item.department || item.schemeId?.department || 'N/A'}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          ₹{(item.benefitAmount || item.schemeId?.benefitAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved & Active
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          {item.approvedBy || 'Government Officer'}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN') : (item.enrolledOn ? new Date(item.enrolledOn).toLocaleDateString('en-IN') : 'Recent')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {/* TAB 0: PENDING APPLICATIONS REVIEW QUEUE */}
      {activeTab === 'pending_apps' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Citizen Family Applications Pending Officer Approval
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted details, inspect uploaded documents, and click Approve to generate the official Family ID.
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs">
              {pendingApps.length} Applications Awaiting Review
            </span>
          </div>

          {pendingApps.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              ✓ No pending applications in queue. All citizen submissions have been reviewed.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApps.map((app) => (
                <div key={app._id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
                  {/* Top Ref Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-900 text-amber-400 font-mono font-bold text-xs px-2.5 py-1 rounded">
                        Ref: {app.applicationRefNo}
                      </span>
                      <strong className="text-slate-900 text-sm">{app.headOfFamilyName}</strong>
                      <span className="text-slate-500 text-[11px] font-mono">Mobile: {app.mobile}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-bold text-[11px]">
                        ⏳ pending_approval
                      </span>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <div><span className="text-slate-400 block text-[10px]">District:</span><strong>{app.address?.district || 'Gandhinagar'}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">Category:</span><span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">{app.category}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Ration Card:</span><span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">{app.rationCardType}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Annual Income:</span><strong>₹{(app.totalIncome || 0).toLocaleString('en-IN')}</strong></div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Aadhaar Identity:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Mock Verified
                      </span>
                    </div>
                  </div>

                  {/* Uploaded Documents List & Verification Trigger */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-bold block text-[11px]">Supporting Family Documents:</span>
                      <span className="text-slate-400 text-[10px]">
                        Inspect uploaded PDFs / Images in Cloud Vault before approval.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openFamilyDocsModal(app.applicationRefNo || app.mobile, app.headOfFamilyName)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      View & Verify Documents
                    </button>
                  </div>

                  {/* Officer Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200/80">
                    <button
                      onClick={() => handleRejectApplication(app._id)}
                      disabled={actionLoadingId === app._id}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      Reject Application
                    </button>

                    <button
                      onClick={() => handleApproveApplication(app._id)}
                      disabled={actionLoadingId === app._id}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      {actionLoadingId === app._id ? 'Approving & Issuing ID...' : 'Approve & Issue Family ID'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: ALL FAMILIES */}
      {activeTab === 'families' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 m-0">All Approved & Issued Households</h3>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Family ID, Head Name..."
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-56 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="All">All Categories</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="SEBC">SEBC</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
          </div>

          {/* GRID OF FAMILY ID CARDS */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFamilies.map((fam) => (
              <div key={fam._id} className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded font-mono">
                      {fam.familyId}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {fam.status || 'Verified & Active'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[10px] font-mono">
                    Ration: {fam.rationCardType}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white m-0">
                    Head of Family: {fam.headOfFamilyName}
                  </h4>
                  <p className="text-xs text-slate-400 m-0">
                    District: <strong className="text-slate-200">{fam.address?.district || 'Gandhinagar'}</strong> • Mobile: {fam.mobile}
                  </p>
                </div>

                {/* Card Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <strong className="text-amber-300">{fam.category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Members</span>
                    <strong className="text-white">{fam.memberCount || 4} Members</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Approved Date</span>
                    <strong className="text-slate-200 text-[11px] font-mono">
                      {fam.approvalDate || fam.createdAt ? new Date(fam.approvalDate || fam.createdAt).toLocaleDateString('en-IN') : '2026-09-20'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Approved By</span>
                    <strong className="text-emerald-300 text-[11px]">{fam.approvedBy || 'Officer Sharma'}</strong>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => openFamilyDocsModal(fam.familyId, fam.headOfFamilyName)}
                    className="bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40 font-bold text-xs px-3.5 py-1 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                    Inspect Documents
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ADD NEW SCHEME & RULES */}
      {activeTab === 'add_scheme' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Add New Government Scheme & Define Eligibility Rules</h3>
            <p className="text-xs text-slate-500 mt-1">
              On submission, the system immediately triggers the matching engine across all registered households.
            </p>
          </div>

          {formMsg && (
            <div className={`p-4 rounded-lg text-xs font-bold ${formMsg.success ? 'bg-emerald-100 border border-emerald-300 text-emerald-900' : 'bg-red-100 border border-red-300 text-red-900'}`}>
              {formMsg.message}
            </div>
          )}

          <form onSubmit={handleCreateScheme} className="space-y-6 text-xs">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-slate-500">
                1. Basic Scheme Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Scheme Name *</label>
                  <input
                    type="text"
                    name="schemeName"
                    value={schemeForm.schemeName}
                    onChange={handleSchemeFormChange}
                    placeholder="e.g. Divyang Mahila Swavalamban Support"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Scheme Code</label>
                  <input
                    type="text"
                    name="schemeCode"
                    value={schemeForm.schemeCode}
                    onChange={handleSchemeFormChange}
                    placeholder="e.g. GUJ-DMSS-2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Government Department *</label>
                  <select
                    name="department"
                    value={schemeForm.department}
                    onChange={handleSchemeFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Higher & Technical Education Department">Higher & Technical Education Department</option>
                    <option value="Women and Child Development Department">Women and Child Development Department</option>
                    <option value="Social Justice and Empowerment Department">Social Justice and Empowerment Department</option>
                    <option value="Health and Family Welfare Department">Health and Family Welfare Department</option>
                    <option value="Agriculture and Farmers Welfare Department">Agriculture and Farmers Welfare Department</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Benefit Type & Amount (₹)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="benefitType"
                      value={schemeForm.benefitType}
                      onChange={handleSchemeFormChange}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Cash">Cash Transfer</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Subsidy">Subsidy</option>
                      <option value="Kind">Kind / Assistive Kit</option>
                      <option value="Service">Service</option>
                    </select>
                    <input
                      type="number"
                      name="benefitAmount"
                      value={schemeForm.benefitAmount}
                      onChange={handleSchemeFormChange}
                      placeholder="Amount ₹"
                      className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={schemeForm.description}
                  onChange={handleSchemeFormChange}
                  placeholder="Summary description of scheme benefits and targets..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                ></textarea>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-emerald-800">
                2. Eligibility Rules Configuration
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Maximum Household Annual Income (₹)</label>
                  <input
                    type="number"
                    name="maxIncome"
                    value={schemeForm.maxIncome}
                    onChange={handleSchemeFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Age Eligibility Range (Years)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="minAge"
                      value={schemeForm.minAge}
                      onChange={handleSchemeFormChange}
                      placeholder="Min Age"
                      className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                    <input
                      type="number"
                      name="maxAge"
                      value={schemeForm.maxAge}
                      onChange={handleSchemeFormChange}
                      placeholder="Max Age"
                      className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Required Gender</label>
                  <select
                    name="requiredGender"
                    value={schemeForm.requiredGender}
                    onChange={handleSchemeFormChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Any">Any Gender</option>
                    <option value="F">Female Only (F)</option>
                    <option value="M">Male Only (M)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Eligible Categories (Select all applicable):</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['General', 'OBC', 'SC', 'ST', 'SEBC', 'EWS'].map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-3 py-1.5 rounded-md font-bold text-xs border transition ${
                        schemeForm.requiredCategory.includes(cat)
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cat} {schemeForm.requiredCategory.includes(cat) ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded border border-slate-200">
                  <input
                    type="checkbox"
                    name="requiresBPL"
                    checked={schemeForm.requiresBPL}
                    onChange={handleSchemeFormChange}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Requires BPL / AAY Card</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded border border-slate-200">
                  <input
                    type="checkbox"
                    name="requiresWidow"
                    checked={schemeForm.requiresWidow}
                    onChange={handleSchemeFormChange}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Requires Widow Status</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded border border-slate-200">
                  <input
                    type="checkbox"
                    name="requiresDisabled"
                    checked={schemeForm.requiresDisabled}
                    onChange={handleSchemeFormChange}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Requires Disability</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded border border-slate-200">
                  <input
                    type="checkbox"
                    name="requiresPregnantOrLactating"
                    checked={schemeForm.requiresPregnantOrLactating}
                    onChange={handleSchemeFormChange}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Pregnant / Lactating</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingScheme}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                {submittingScheme ? 'Processing Matching Engine...' : 'Publish Scheme & Trigger Matching Engine'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ELIGIBILITY MATCHES MATRIX */}
      {activeTab === 'eligibility' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 m-0">Member Scheme Eligibility Matrix</h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Evaluated Combinations: {eligibilityMatches.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3">Family ID</th>
                  <th className="p-3">Member Name</th>
                  <th className="p-3">Target Scheme</th>
                  <th className="p-3">Eligibility Status</th>
                  <th className="p-3">Matched Criteria Summary</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {eligibilityMatches.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-800">{item.familyId}</td>
                    <td className="p-3 font-semibold text-slate-900">{item.memberName}</td>
                    <td className="p-3 font-medium text-slate-800">{item.schemeName}</td>
                    <td className="p-3">
                      {item.isEligible ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[11px] inline-flex items-center gap-1">
                          ✓ Eligible
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium text-[11px]">
                          Ineligible
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 max-w-xs">
                      {item.matchedCriteria && item.matchedCriteria.length > 0 ? (
                        <span className="text-emerald-700 font-medium">
                          ✓ {item.matchedCriteria[0]} (+{item.matchedCriteria.length - 1} criteria)
                        </span>
                      ) : (
                        <span className="text-slate-400">Demographics outside rule bounds</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {item.isEligible && !item.isEnrolled && (
                        <button
                          onClick={() => handleOfficerEnroll(item.memberId, item.schemeId, item.familyId)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded font-semibold text-[11px] shadow"
                        >
                          Direct Enroll Member
                        </button>
                      )}
                      {item.isEnrolled && (
                        <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-bold">
                          Already Enrolled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DUPLICATE BENEFIT ALERTS */}
      {activeTab === 'duplicates' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Duplicate Benefit Enrollment Alerts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically flagged when a member attempts enrollment in conflicting or duplicate schemes under the same department.
              </p>
            </div>
            <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full text-xs">
              {duplicateAlerts.length} Flagged Incidents
            </span>
          </div>

          {duplicateAlerts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              ✓ No duplicate enrollments detected across active schemes.
            </div>
          ) : (
            <div className="space-y-3">
              {duplicateAlerts.map((dup, idx) => (
                <div key={idx} className="bg-red-50/70 border border-red-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                        ⚠ FLAGGED DUPLICATE
                      </span>
                      <strong className="text-slate-900 text-sm">{dup.memberName}</strong>
                      <span className="text-slate-500 font-mono text-[11px]">({dup.familyId})</span>
                    </div>
                    
                    <p className="text-red-900 font-medium mt-1">
                      Attempted Scheme: <strong>{dup.schemeName}</strong>
                    </p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Conflict Reason: {dup.flaggedReason || 'Member holds existing benefit in same department.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => alert(`Reviewing duplicate claim for ${dup.memberName}. Application on hold.`)}
                      className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow"
                    >
                      Hold & Audit Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: RESTRICTED EDIT REQUESTS QUEUE */}
      {activeTab === 'edit_requests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-600" />
                Restricted Field Edit Requests Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Restricted edits (income, category, ration card type, member removal) require officer verification before updating the Family ID database.
              </p>
            </div>
            <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full text-xs">
              {pendingEditRequests.length} Pending
            </span>
          </div>

          {pendingEditRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              ✓ No pending edit requests found in verification queue.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEditRequests.map((req) => (
                <div key={req._id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                        {req.editType ? req.editType.replace('_', ' ') : 'Restricted Edit'}
                      </span>
                      <strong className="text-slate-900 font-mono text-sm">{req.familyId}</strong>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600">Field: <strong className="text-slate-800">{req.fieldName}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200 mt-2">
                      <div className="border-r border-slate-100 pr-2">
                        <span className="text-[11px] text-slate-500 block">Current Value</span>
                        <span className="font-semibold text-red-600 line-through">
                          {req.fieldName === 'totalIncome' ? `₹${Number(req.currentValue || 0).toLocaleString('en-IN')}` : String(req.currentValue || 'N/A')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Requested New Value</span>
                        <span className="font-bold text-emerald-700">
                          {req.fieldName === 'totalIncome' ? `₹${Number(req.requestedValue || 0).toLocaleString('en-IN')}` : String(req.requestedValue || 'N/A')}
                        </span>
                      </div>
                    </div>

                    {req.reason && (
                      <p className="text-slate-600 text-[11px] mt-1 bg-amber-50/70 text-amber-900 p-2 rounded border border-amber-200">
                        <strong>Citizen Reason:</strong> {req.reason}
                      </p>
                    )}

                    {req.documentName && (
                      <div className="bg-indigo-50/80 border border-indigo-200 p-2.5 rounded-lg flex items-center justify-between text-[11px] text-indigo-900 mt-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <FileText className="w-4 h-4 text-indigo-700" />
                          <span>Attached Document Proof: {req.documentName}</span>
                        </div>
                        <button
                          onClick={() => alert(`Opening attached proof document: ${req.documentName} for ${req.familyId}`)}
                          className="bg-indigo-700 hover:bg-indigo-800 text-white px-2.5 py-1 rounded font-bold text-[10px] transition"
                        >
                          Inspect Proof Document
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleRejectEditRequest(req._id)}
                      disabled={actionLoadingId === req._id}
                      className="bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold px-3.5 py-2 rounded-lg text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveEditRequest(req._id)}
                      disabled={actionLoadingId === req._id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: FAMILY SPLITTING REQUESTS QUEUE */}
      {activeTab === 'split_requests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-cyan-600" />
                Family Splitting Requests Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review requests to split members off an existing Family ID to issue a brand new Family ID (e.g. marriage, separation, adult child independence).
              </p>
            </div>
            <span className="bg-cyan-100 text-cyan-800 font-bold px-3 py-1 rounded-full text-xs">
              {pendingSplitRequests.length} Pending
            </span>
          </div>

          {pendingSplitRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              ✓ No pending family split requests found in queue.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSplitRequests.map((req) => (
                <div key={req._id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-700 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                        Split Request
                      </span>
                      <span className="text-slate-500">Source Family:</span>
                      <strong className="text-slate-900 font-mono text-sm">{req.sourceFamilyId}</strong>
                    </div>

                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded capitalize">
                      Reason: {req.splitReason}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 m-0">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Members Splitting Off ({req.memberIds?.length || 0})
                      </h4>
                      <ul className="space-y-1 text-slate-700 pl-4 list-disc text-[11px]">
                        {(req.memberDetails || req.memberIds || []).map((m, idx) => (
                          <li key={idx}>
                            {typeof m === 'object' ? `${m.name} (${m.gender}, Age: ${m.age || m.dob})` : `Member ID: ${m}`}
                          </li>
                        ))}
                      </ul>
                      {req.reasonDetails && (
                        <p className="text-slate-500 text-[11px] italic mt-1">
                          "{req.reasonDetails}"
                        </p>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-xs m-0">Proposed New Household Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-500 block">Proposed HOF ID</span>
                          <strong className="text-slate-800 font-mono">{req.newHeadMemberId || 'Selected Member'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Category</span>
                          <strong className="text-slate-800">{req.newFamilyDetails?.category || 'General'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Annual Income</span>
                          <strong className="text-emerald-700 font-bold">₹{Number(req.newFamilyDetails?.totalIncome || 0).toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Ration Card Type</span>
                          <strong className="text-slate-800">{req.newFamilyDetails?.rationCardType || 'BPL'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleRejectSplitRequest(req._id)}
                      disabled={actionLoadingId === req._id}
                      className="bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold px-3.5 py-2 rounded-lg text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Split
                    </button>
                    <button
                      onClick={() => handleApproveSplitRequest(req._id)}
                      disabled={actionLoadingId === req._id}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Create New Family ID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT LOG TIMELINE */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 m-0">System Audit Trail Log</h3>
          
          <div className="space-y-3 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3">
                <div className="p-1.5 bg-slate-200 rounded text-slate-700 font-bold shrink-0 text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-slate-800">
                    <strong className="text-blue-800">{log.actorName}</strong>
                    <span className="text-slate-400">({log.actorType})</span>
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-700">
                      {log.action}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-1">
                    Target: {log.targetType} ({log.targetId}) | {JSON.stringify(log.details)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OFFICER DOCUMENT INSPECTION & VERIFICATION MODAL */}
      {selectedFamilyForDocs && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 relative flex flex-col">
            <button
              onClick={() => setSelectedFamilyForDocs(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-extrabold uppercase text-blue-700 tracking-wider block">OFFICER DOCUMENT VAULT INSPECTION</span>
              <h3 className="text-lg font-black text-slate-900 m-0">Family Documents: {selectedFamilyForDocs.headName}</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Family Reference / ID: <strong className="font-mono text-slate-800">{selectedFamilyForDocs.familyId}</strong>
              </p>
            </div>

            {loadingOfficerDocs ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                Loading family documents from Cloud Vault...
              </div>
            ) : officerFamilyDocs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-1">
                <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold">No Uploaded Documents Found</p>
                <p>The citizen has not uploaded supporting files for this record yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {officerFamilyDocs.map((doc) => (
                  <div key={doc._id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{doc.documentType}</strong>
                        {doc.status === 'verified' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 🟢 Verified
                          </span>
                        )}
                        {doc.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> 🟡 Pending Verification
                          </span>
                        )}
                        {doc.status === 'rejected' && (
                          <span className="bg-red-100 text-red-900 border border-red-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> 🔴 Rejected
                          </span>
                        )}
                      </div>

                      <div className="text-slate-500 text-[11px] font-mono">
                        File: <strong>{doc.fileName}</strong> • Uploaded: {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN')}
                      </div>

                      {doc.rejectionReason && (
                        <div className="text-red-700 bg-red-50 p-2 rounded border border-red-200 text-[11px] font-medium">
                          <strong>Rejection Reason:</strong> {doc.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Document
                      </button>

                      {doc.status !== 'verified' && (
                        <button
                          onClick={() => handleVerifyDocument(doc._id)}
                          disabled={docActionId === doc._id}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs shadow transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Verify
                        </button>
                      )}

                      {doc.status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectDocument(doc._id)}
                          disabled={docActionId === doc._id}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedFamilyForDocs(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentViewerModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
};

