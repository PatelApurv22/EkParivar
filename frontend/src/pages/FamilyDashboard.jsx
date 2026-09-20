import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { AadhaarModal } from '../components/AadhaarModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { EditFamilyModal } from '../components/EditFamilyModal';
import { SplitFamilyModal } from '../components/SplitFamilyModal';
import { SchemeCard } from '../components/SchemeCard';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { calculateAge } from '../utils/eligibilityEngine';
import {
  ShieldCheck, UserPlus, FileCheck2, AlertCircle, Sparkles, Building,
  CreditCard, Phone, CheckCircle2, Clock, AlertTriangle, Layers, XCircle, ArrowRight,
  Pencil, Scissors, FileWarning, Upload, FolderOpen, RefreshCw, Eye
} from 'lucide-react';

export const FamilyDashboard = () => {
  const { familyId, setFamilyId, mobile } = useAuth();
  const navigate = useNavigate();

  const [appStatusData, setAppStatusData] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [members, setMembers] = useState([]);
  const [eligibilityMatches, setEligibilityMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedMemberForVerification, setSelectedMemberForVerification] = useState(null);
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'members' | 'enrolled' | 'documents'
  const [docToast, setDocToast] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('Aadhaar Card');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Check Citizen Application Status first
      const statusRes = await apiService.checkApplicationStatus(mobile);
      setAppStatusData(statusRes);

      let targetFamId = familyId;

      if (statusRes.success && statusRes.family) {
        targetFamId = statusRes.family.familyId;
        setFamilyId(targetFamId);
      }

      if (targetFamId) {
        const famRes = await apiService.getFamily(targetFamId);
        if (famRes.success) {
          setFamilyData(famRes.family);
          setMembers(famRes.members || []);
        }

        const matchRes = await apiService.getEligibilityForFamily(targetFamId);
        if (matchRes.success) {
          setEligibilityMatches(matchRes.eligibilityMatches || []);
        }

        const docsRes = await apiService.getFamilyDocuments(targetFamId);
        if (docsRes.success) {
          setDocuments(docsRes.documents || []);
        }
      }
    } catch (err) {
      console.error("Error loading family dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [familyId, mobile]);

  const handleMemberAdded = () => {
    fetchData();
  };

  const handleAadhaarVerified = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-600">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-medium text-sm">Loading Family Application & Status...</p>
      </div>
    );
  }

  const application = appStatusData?.application;
  const isPending = application && application.status === 'pending_approval' && !familyData;
  const isRejected = application && application.status === 'rejected' && !familyData;

  const eligibleSchemes = eligibilityMatches.filter(m => m.isEligible);
  const enrolledSchemes = eligibilityMatches.filter(m => m.isEnrolled || m.enrollmentStatus === 'pending_approval' || m.enrollmentStatus === 'active');
  const enrolledMatches = enrolledSchemes;
  const pendingEnrollments = eligibilityMatches.filter(m => m.enrollmentStatus === 'pending_approval');
  const approvedSchemes = eligibilityMatches.filter(m => m.enrollmentStatus === 'active' || (m.isEnrolled && m.enrollmentStatus !== 'pending_approval' && m.enrollmentStatus !== 'rejected'));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* CASE A: APPLICATION IS PENDING OFFICER APPROVAL */}
      {isPending && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden space-y-4">
          <div className="bg-amber-500 text-slate-950 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-950 text-amber-400 font-mono font-bold text-xs px-2.5 py-1 rounded">
                  Application Ref: {application.applicationRefNo}
                </span>
                <span className="bg-amber-950 text-amber-200 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Application Pending Officer Approval
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 mt-2 m-0">
                Application Pending Government Officer Review
              </h2>
              <p className="text-xs text-slate-900 font-medium mt-1">
                Submitted for Head of Family: <strong>{application.headOfFamilyName}</strong> | Registered Mobile: <strong>{application.mobile}</strong>
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                ⏳ Your Family ID will be generated upon Officer Approval
              </div>
              <p className="text-slate-700">
                Your registration application has been submitted to the Department of Social Justice & Empowerment. 
                A Government Officer is reviewing your income declaration and supporting documents. Once approved, your official <strong>EKP-YYYYMMDD-XXXX</strong> Family ID will be issued and unlocked below.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700">
              <div><span className="text-slate-400 block text-[10px]">Applicant Name:</span><strong>{application.headOfFamilyName}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">District:</span><strong>{application.address?.district || 'Gandhinagar'}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Category:</span><strong>{application.category}</strong></div>
              <div><span className="text-slate-400 block text-[10px]">Annual Income:</span><strong>₹{Number(application.totalIncome).toLocaleString('en-IN')}</strong></div>
            </div>

            <div className="pt-2 text-center text-slate-500">
              Check back soon! Refreshing page or logging in with mobile {mobile} will automatically open your approved Family ID dashboard.
            </div>
          </div>
        </div>
      )}

      {/* CASE B: APPLICATION REJECTED */}
      {isRejected && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden space-y-4 p-6 text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 m-0">
              Application Rejected by Government Officer
            </h2>
            <p className="text-xs text-slate-500">
              Application Reference: <strong>{application.applicationRefNo}</strong>
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-xl max-w-md mx-auto text-left text-xs text-red-900 space-y-1">
            <strong>Rejection Reason:</strong>
            <p className="m-0 text-red-800">{application.rejectionReason || "Documents or income declaration mismatch."}</p>
          </div>

          <div className="pt-2">
            <Link
              to="/create-family"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition inline-flex items-center gap-1.5"
            >
              Re-submit Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* CASE C: APPROVED FAMILY DASHBOARD (OR PRE-APPROVED HOUSEHOLD) */}
      {familyData && (
        <>
          {/* PROMINENT FAMILY ID CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-lg border border-slate-700/60 p-6 space-y-5 relative overflow-hidden">
            {/* Background Seal Watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
              <Building className="w-64 h-64 text-amber-400" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded shadow-xs tracking-wider font-mono">
                    Family ID: {familyData.familyId}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {familyData.status || 'Verified & Active Household'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white m-0 pt-1 tracking-tight">
                  Head of Family: {familyData.headOfFamilyName}
                </h2>
                <p className="text-xs text-slate-300 m-0">
                  District: <strong className="text-amber-300">{familyData.address?.district || 'Gandhinagar'}</strong>, Gujarat • {familyData.address?.village || 'Gandhinagar'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap relative z-10">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-slate-700 shadow-xs transition"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  Edit Profile
                </button>

                {members.length > 1 && (
                  <button
                    onClick={() => setIsSplitModalOpen(true)}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-slate-700 shadow-xs transition"
                  >
                    <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                    Request Split
                  </button>
                )}

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow transition"
                >
                  <UserPlus className="w-4 h-4" />
                  + Add Member
                </button>
              </div>
            </div>

            {/* Family ID Card Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs relative z-10">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">HOF Name</span>
                <strong className="text-white text-xs font-semibold">{familyData.headOfFamilyName}</strong>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">District</span>
                <strong className="text-white text-xs font-semibold">{familyData.address?.district || 'Gandhinagar'}</strong>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Category</span>
                <strong className="text-amber-300 text-xs font-semibold">{familyData.category}</strong>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Family Members</span>
                <strong className="text-white text-xs font-semibold">{members.length} Members</strong>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Approval Date</span>
                <strong className="text-slate-200 text-xs font-mono">
                  {familyData.approvalDate || familyData.createdAt ? new Date(familyData.approvalDate || familyData.createdAt).toLocaleDateString('en-IN') : '2026-09-20'}
                </strong>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Approved By Officer</span>
                <strong className="text-emerald-300 text-xs font-medium">{familyData.approvedBy || 'Officer Sharma (EMP-8832)'}</strong>
              </div>
            </div>
          </div>

          {/* FAMILY OVERVIEW SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Family Overview & Status Summary
              </h3>
              <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded">
                Family ID: {familyData.familyId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Family ID</span>
                <strong className="text-slate-900 font-mono text-xs">{familyData.familyId}</strong>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block text-[11px]">Verification Status</span>
                <strong className="text-emerald-900 font-bold flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {familyData.status || 'Verified & Active'}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Total Members</span>
                <strong className="text-slate-900 text-sm font-black">{members.length} Members</strong>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-amber-800 block text-[11px]">Eligible Schemes</span>
                <strong className="text-amber-900 text-sm font-black">{eligibleSchemes.length} Schemes</strong>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 block text-[11px]">Approved Schemes</span>
                <strong className="text-emerald-900 text-sm font-black">{approvedSchemes.length} Approved</strong>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-amber-800 block text-[11px]">Pending Applications</span>
                <strong className="text-amber-900 text-sm font-black">{pendingEnrollments.length} Pending</strong>
              </div>
            </div>

            {/* Missing Documents Overview Bar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-800">Missing Documents Overview:</span>
              </div>
              {(() => {
                const missingDocsSet = new Set();
                eligibilityMatches.forEach(m => {
                  if (m.missingDocuments && m.missingDocuments.length > 0) {
                    m.missingDocuments.forEach(d => missingDocsSet.add(d.replace('_', ' ')));
                  }
                });
                const missingDocsList = Array.from(missingDocsSet);
                return missingDocsList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {missingDocsList.map((doc, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-900 font-medium px-2.5 py-0.5 rounded border border-amber-200 text-[11px]">
                        ⚠ {doc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    All Family Documents Verified ✓
                  </span>
                );
              })()}
            </div>
          </div>

          {/* DASHBOARD TABS */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs md:text-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('eligible')}
              className={`px-4 py-2.5 font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'eligible'
                  ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Eligible Schemes ({eligibleSchemes.length})
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2.5 font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'members'
                  ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-slate-600" />
              Family Members Directory ({members.length})
            </button>

            <button
              onClick={() => setActiveTab('enrolled')}
              className={`px-4 py-2.5 font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'enrolled'
                  ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              My Enrolled Schemes ({enrolledMatches.length})
              {pendingEnrollments.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingEnrollments.length}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2.5 font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-700 bg-blue-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-blue-500" />
              My Documents
            </button>
          </div>

          {/* TAB 1: ELIGIBLE SCHEMES */}
          {activeTab === 'eligible' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Automated Eligibility Engine:</strong> Evaluated {members.length} members against active government scheme rules.
                  </span>
                </div>
                <span className="font-bold text-amber-800">{eligibleSchemes.length} Schemes Available</span>
              </div>

              {eligibleSchemes.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                  No matching schemes found for current family profile. Try adding members or updating education/disability details.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {eligibleSchemes.map((match, idx) => (
                    <SchemeCard
                      key={idx}
                      match={match}
                      familyId={familyData.familyId}
                      onEnrollSuccess={() => fetchData()}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEMBERS DIRECTORY */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 m-0">
                  Household Members List
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-md transition"
                >
                  + Add Member
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3">Member Name</th>
                      <th className="p-3">Relation</th>
                      <th className="p-3">Age / Gender</th>
                      <th className="p-3">Occupation</th>
                      <th className="p-3">Aadhaar Status</th>
                      <th className="p-3">Special Criteria</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {members.map((mem) => {
                      const age = calculateAge(mem.dob);
                      return (
                        <tr key={mem._id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-semibold text-slate-900">
                            {mem.name}
                            {mem.relationToHOF === 'Self' && (
                              <span className="ml-1.5 bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">HOF</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{mem.relationToHOF}</td>
                          <td className="p-3 text-slate-600">{age} yrs / {mem.gender}</td>
                          <td className="p-3 text-slate-600">{mem.occupation || 'N/A'}</td>
                          <td className="p-3">
                            <div className="space-y-1">
                              {/* Officer Approval Status */}
                              {mem.status === 'pending_approval' ? (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  Pending Officer Approval
                                </span>
                              ) : mem.status === 'rejected' ? (
                                <span className="bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit" title={mem.rejectionReason || "Addition rejected by officer"}>
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  Rejected by Officer
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Approved Member
                                </span>
                              )}

                              {/* Aadhaar Verification Status */}
                              {mem.aadhaarVerified ? (
                                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium text-[10px] flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Aadhaar Verified
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[10px] flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  Aadhaar Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-600">
                            <div className="flex flex-wrap gap-1 text-[10px]">
                              {mem.isWidow && <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-medium">Widow</span>}
                              {mem.isDisabled && <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">Disabled ({mem.disabilityPercent}%)</span>}
                              {mem.isPregnantOrLactating && <span className="bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded font-medium">Pregnant/Lactating</span>}
                              {mem.educationPercent > 0 && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Edu: {mem.educationPercent}%</span>}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            {!mem.aadhaarVerified ? (
                              <button
                                onClick={() => setSelectedMemberForVerification(mem)}
                                className="bg-blue-800 hover:bg-blue-900 text-white text-[11px] font-medium px-3 py-1.5 rounded shadow transition inline-flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                Verify Aadhaar
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedMemberForVerification(mem)}
                                className="text-slate-500 hover:text-slate-800 text-[11px] underline"
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ENROLLED SCHEMES */}
          {activeTab === 'enrolled' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Scheme Applications & Active Benefits ({enrolledMatches.length})
                  </h3>
                  <p className="text-xs text-slate-500 m-0">
                    Track your family's approved schemes and ongoing application reviews.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full">
                    {approvedSchemes.length} Active Benefits
                  </span>
                  <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">
                    {pendingEnrollments.length} Pending Review
                  </span>
                </div>
              </div>

              {enrolledMatches.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                  <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-sm">No Scheme Applications Yet</p>
                  <p>Browse "Eligible Schemes" tab above and click <strong>Apply / Enroll</strong> to submit applications for officer review.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* SECTION 1: APPROVED SCHEMES */}
                  {approvedSchemes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 m-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Approved & Active Benefits ({approvedSchemes.length})
                      </h4>
                      <div className="grid gap-3">
                        {approvedSchemes.map((item, idx) => (
                          <div key={idx} className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-emerald-700 text-[11px] font-bold block">{item.scheme.department}</span>
                              <strong className="text-base text-slate-900 font-extrabold">{item.scheme.schemeName}</strong>
                              <div className="text-slate-600 text-[11px] flex items-center gap-2">
                                <span>Beneficiary: <strong className="text-slate-900">{item.member.name}</strong> ({item.member.relationToHOF})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-slate-500 block text-[11px]">Sanctioned Benefit</span>
                                <strong className="text-emerald-800 font-extrabold text-base">₹{(item.scheme.benefitAmount || 0).toLocaleString('en-IN')}</strong>
                              </div>

                              <span className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                Approved & Active
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: PENDING APPROVAL SCHEMES */}
                  {pendingEnrollments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 m-0">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Applications Pending Officer Review ({pendingEnrollments.length})
                      </h4>
                      <div className="grid gap-3">
                        {pendingEnrollments.map((item, idx) => (
                          <div key={idx} className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-amber-800 text-[11px] font-bold block">{item.scheme.department}</span>
                              <strong className="text-sm text-slate-900 font-bold">{item.scheme.schemeName}</strong>
                              <div className="text-slate-600 text-[11px]">
                                Beneficiary: <strong>{item.member.name}</strong> ({item.member.relationToHOF})
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-slate-500 block text-[11px]">Applied Benefit</span>
                                <strong className="text-slate-800 font-bold text-sm">₹{(item.scheme.benefitAmount || 0).toLocaleString('en-IN')}</strong>
                              </div>

                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Under Officer Review
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OTHER STATUSES (Flagged or Rejected) */}
                  {enrolledMatches.filter(m => m.enrollmentStatus === 'flagged_duplicate' || m.enrollmentStatus === 'rejected').length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 m-0">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Flagged or Rejected Applications
                      </h4>
                      <div className="grid gap-3">
                        {enrolledMatches.filter(m => m.enrollmentStatus === 'flagged_duplicate' || m.enrollmentStatus === 'rejected').map((item, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 text-[11px] block">{item.scheme.department}</span>
                              <strong className="text-sm text-slate-900">{item.scheme.schemeName}</strong>
                              <div className="text-slate-600 text-[11px]">
                                Beneficiary: <strong>{item.member.name}</strong>
                              </div>
                            </div>
                            <div>
                              {item.enrollmentStatus === 'flagged_duplicate' && (
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                                  Duplicate Flagged
                                </span>
                              )}
                              {item.enrollmentStatus === 'rejected' && (
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  Application Rejected
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Toast */}
              {docToast && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  docToast.type === 'success' ? 'bg-emerald-100 border border-emerald-300 text-emerald-900' : 'bg-red-100 border border-red-300 text-red-900'
                }`}>
                  {docToast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {docToast.text}
                </div>
              )}

              {/* Upload Form Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    Upload Supporting Document to Cloud Vault
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Upload official PDF or Image proof. Files are securely stored via Cloudinary for Officer verification.
                  </p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedFile || !selectedDocType) {
                    setDocToast({ type: 'error', text: 'Please select a document type and a file.' });
                    return;
                  }
                  setIsUploading(true);
                  try {
                    const formData = new FormData();
                    const targetFamId = familyData?.familyId || familyId;
                    formData.append('familyId', targetFamId);
                    if (mobile || familyData?.mobile) {
                      formData.append('mobile', mobile || familyData?.mobile);
                    }
                    formData.append('documentType', selectedDocType);
                    formData.append('file', selectedFile);

                    const res = await apiService.uploadDocument(formData);
                    setIsUploading(false);
                    if (res.success) {
                      setDocToast({ type: 'success', text: `✅ "${selectedDocType}" uploaded to Cloudinary successfully!` });
                      setSelectedFile(null);
                      const docsRes = await apiService.getFamilyDocuments(targetFamId);
                      if (docsRes.success) setDocuments(docsRes.documents || []);
                    } else {
                      setDocToast({ type: 'error', text: res.message || 'Document upload failed.' });
                    }
                  } catch (err) {
                    setIsUploading(false);
                    setDocToast({ type: 'error', text: 'Document upload failed. Please try again.' });
                  }
                }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Document Type *</label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {[
                        'Aadhaar Card',
                        'Ration Card',
                        'Income Certificate',
                        'Caste Certificate',
                        'Disability Certificate',
                        'Birth Certificate',
                        'Education/Marksheet',
                        'Address Proof',
                        'Other'
                      ].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select File (PDF, JPG, JPEG, PNG, max 10MB) *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isUploading || !selectedFile}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow transition cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Uploading to Cloudinary...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>Demo Safety Reminder:</strong> Never upload real sensitive identity cards for testing. Use sample/fictional PDF or image files.</span>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    Uploaded Documents ({documents.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Linked to Family ID: <strong className="font-mono text-slate-800">{familyData?.familyId || familyId}</strong>
                  </span>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-sm">No Documents Uploaded Yet</p>
                    <p>Select a document type above and upload your supporting file.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {documents.map((doc) => (
                      <div key={doc._id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-slate-900">{doc.documentType}</strong>
                            {doc.status === 'verified' && (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                🟢 Verified
                              </span>
                            )}
                            {doc.status === 'pending' && (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                🟡 Pending Verification
                              </span>
                            )}
                            {doc.status === 'rejected' && (
                              <span className="bg-red-100 text-red-900 border border-red-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                🔴 Rejected
                              </span>
                            )}
                          </div>

                          <div className="text-slate-500 text-[11px] font-mono">
                            File: <strong>{doc.fileName}</strong> • Uploaded: {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN')}
                          </div>

                          {doc.rejectionReason && (
                            <div className="text-red-700 bg-red-50 p-2 rounded border border-red-200 text-[11px] font-medium mt-1">
                              <strong>Rejection Reason:</strong> {doc.rejectionReason}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Document
                          </button>

                          <button
                            onClick={() => {
                              setSelectedDocType(doc.documentType);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs transition"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Replace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODALS */}
          <AddMemberModal
            familyId={familyData.familyId}
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onMemberAdded={handleMemberAdded}
          />

          <AadhaarModal
            member={selectedMemberForVerification}
            isOpen={!!selectedMemberForVerification}
            onClose={() => setSelectedMemberForVerification(null)}
            onVerified={handleAadhaarVerified}
          />

          <EditFamilyModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            familyData={familyData}
            members={members}
            onEditComplete={fetchData}
          />

          <SplitFamilyModal
            isOpen={isSplitModalOpen}
            onClose={() => setIsSplitModalOpen(false)}
            familyData={familyData}
            members={members}
            onSplitComplete={fetchData}
          />

          <DocumentViewerModal
            document={previewDoc}
            onClose={() => setPreviewDoc(null)}
          />
        </>
      )}
    </div>
  );
};
