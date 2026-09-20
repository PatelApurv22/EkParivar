import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search, CheckCircle2, ShieldCheck, AlertTriangle, FileWarning,
  Eye, Users, Sparkles, X, Layers, Check, Info
} from 'lucide-react';

export const SchemeListPage = () => {
  const { isLoggedIn, role, familyId } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [familyMatches, setFamilyMatches] = useState([]);
  const [officerMatches, setOfficerMatches] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeCheckScheme, setActiveCheckScheme] = useState(null); // Family: Check My Eligibility modal
  const [activeDetailsScheme, setActiveDetailsScheme] = useState(null); // View Eligibility Details modal
  const [activeOfficerMatchesScheme, setActiveOfficerMatchesScheme] = useState(null); // Officer: View Matches modal
  const [activeOfficerEnrolledScheme, setActiveOfficerEnrolledScheme] = useState(null); // Officer: View Enrolled modal

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiService.getSchemes();
        if (res.success) setSchemes(res.schemes || []);

        if (isLoggedIn && role === 'family' && familyId) {
          const eligRes = await apiService.getEligibilityForFamily(familyId);
          if (eligRes.success) setFamilyMatches(eligRes.eligibilityMatches || []);
        }

        if (isLoggedIn && role === 'officer') {
          const allEligRes = await apiService.getAllEligibilityMatches();
          if (allEligRes.success) setOfficerMatches(allEligRes.eligibilityMatches || []);
        }
      } catch (err) {
        console.error("Error loading schemes:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoggedIn, role, familyId]);

  const filteredSchemes = schemes.filter(sch => {
    const matchSearch = sch.schemeName.toLowerCase().includes(search.toLowerCase()) ||
                        sch.department.toLowerCase().includes(search.toLowerCase()) ||
                        sch.description.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || sch.department === deptFilter;
    return matchSearch && matchDept;
  });

  const departments = ['All', ...new Set(schemes.map(s => s.department))];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-600">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-medium text-sm">Loading Government Schemes Catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded">
              GUJARAT SCHEMES DIRECTORY
            </span>
            {isLoggedIn && role === 'family' && (
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Family ID: {familyId}
              </span>
            )}
            {isLoggedIn && role === 'officer' && (
              <span className="bg-purple-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Officer View Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white m-0 mt-2">
            Active Welfare & Financial Support Schemes
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Official list of Gujarat state welfare initiatives linked with EkParivar Family ID.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme name, department..."
              className="pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 w-60 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {departments.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Scheme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((sch) => {
          const rule = sch.rule || {};

          // Calculate Family Status if Logged-in Family
          let familyStatus = null;
          let eligibleCount = 0;
          let isEnrolled = false;
          let schemeMissingDocs = [];

          if (isLoggedIn && role === 'family') {
            const matchesForSch = familyMatches.filter(m => {
              const sId = m.scheme?._id || m.schemeId?._id || m.schemeId;
              const sCode = m.scheme?.schemeCode || m.schemeId?.schemeCode;
              return (sId && String(sId) === String(sch._id)) || (sCode && sCode === sch.schemeCode);
            });
            eligibleCount = matchesForSch.filter(m => m.isEligible).length;
            isEnrolled = matchesForSch.some(m => m.isEnrolled);

            const docsSet = new Set();
            matchesForSch.forEach(m => {
              if (m.missingDocuments) {
                m.missingDocuments.forEach(d => docsSet.add(d.replace('_', ' ')));
              }
            });
            schemeMissingDocs = Array.from(docsSet);

            if (isEnrolled) {
              familyStatus = { type: 'enrolled', text: 'Enrolled / Active Benefit', bg: 'bg-emerald-100 text-emerald-800' };
            } else if (eligibleCount > 0) {
              familyStatus = { type: 'eligible', text: `✓ Eligible (${eligibleCount} Member${eligibleCount > 1 ? 's' : ''})`, bg: 'bg-emerald-500 text-white' };
            } else {
              familyStatus = { type: 'not_eligible', text: '✕ Criteria Not Satisfied', bg: 'bg-amber-100 text-amber-900' };
            }
          }

          // Calculate Officer Metrics if Officer
          let officerMatchedCount = 0;
          let officerEnrolledCount = 0;
          if (isLoggedIn && role === 'officer') {
            const matchesForSch = officerMatches.filter(m => {
              const sId = m.schemeId?._id || m.schemeId || m.scheme?._id;
              const sCode = m.schemeId?.schemeCode || m.scheme?.schemeCode || m.schemeCode;
              return (sId && String(sId) === String(sch._id)) ||
                (sCode && sCode === sch.schemeCode) ||
                (m.schemeName && m.schemeName === sch.schemeName);
            });
            officerMatchedCount = matchesForSch.filter(m => m.isEligible).length;
            officerEnrolledCount = matchesForSch.filter(m => m.isEnrolled).length;
          }

          return (
            <div key={sch._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              
              {/* Card Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">
                    {sch.department}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 m-0 mt-0.5 line-clamp-1">
                    {sch.schemeName}
                  </h3>
                </div>

                {familyStatus ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${familyStatus.bg}`}>
                    {familyStatus.text}
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                    Active Scheme
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 text-xs flex-1">
                <p className="text-slate-600 line-clamp-2">
                  {sch.description}
                </p>

                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Benefit:</span>
                  <strong className="text-emerald-700 text-sm font-extrabold">
                    ₹{(sch.benefitAmount || 0).toLocaleString('en-IN')} ({sch.benefitType})
                  </strong>
                </div>

                {/* Eligibility Criteria Summary */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-700">
                  <strong className="block text-slate-900 text-xs mb-1">Eligibility Criteria / Key Rules:</strong>
                  {rule.maxIncome && <div>• Max Household Income: ₹{rule.maxIncome.toLocaleString('en-IN')}</div>}
                  {rule.minAge && <div>• Age Limit: {rule.minAge} to {rule.maxAge || 120} yrs</div>}
                  {rule.requiredGender && rule.requiredGender !== 'Any' && <div>• Gender Restriction: {rule.requiredGender === 'F' ? 'Female Only' : 'Male Only'}</div>}
                  {rule.requiresBPL && <div>• Requires BPL / AAY Ration Card</div>}
                  {rule.requiresWidow && <div>• Requires Widow Status</div>}
                  {rule.requiresDisabled && <div>• Requires Disability Certificate</div>}
                </div>

                {/* Required Documents */}
                {sch.requiredDocuments && sch.requiredDocuments.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block mb-1">Required Documents:</span>
                    <div className="flex flex-wrap gap-1">
                      {sch.requiredDocuments.map((doc, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded capitalize">
                          {doc.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logged in Family Missing Documents Warning */}
                {isLoggedIn && role === 'family' && schemeMissingDocs.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded text-amber-900 text-[11px] space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <FileWarning className="w-3.5 h-3.5 text-amber-600" />
                      Missing Documents for Your Family:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {schemeMissingDocs.map((doc, idx) => (
                        <span key={idx} className="bg-amber-100 text-amber-900 font-medium px-1.5 py-0.5 rounded text-[10px]">
                          ⚠ {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions (Role Based) */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs">
                
                {/* 1. PUBLIC / NOT LOGGED IN USER */}
                {!isLoggedIn && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono text-[10px]">{sch.schemeCode}</span>
                    <span className="text-[11px] font-medium text-slate-400">Public Scheme Information</span>
                  </div>
                )}

                {/* 2. LOGGED-IN FAMILY */}
                {isLoggedIn && role === 'family' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCheckScheme(sch)}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-[11px] transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Check My Eligibility
                    </button>
                    <button
                      onClick={() => setActiveDetailsScheme(sch)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-2 rounded-lg text-[11px] transition flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      View Details
                    </button>
                  </div>
                )}

                {/* 3. GOVERNMENT OFFICER */}
                {isLoggedIn && role === 'officer' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveOfficerMatchesScheme(sch)}
                      className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold px-3 py-2 rounded-lg text-[11px] transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-200" />
                      View Matches ({officerMatchedCount})
                    </button>
                    <button
                      onClick={() => setActiveOfficerEnrolledScheme(sch)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-2 rounded-lg text-[11px] transition flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                      Enrolled ({officerEnrolledCount})
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: FAMILY CHECK MY ELIGIBILITY MODAL */}
      {activeCheckScheme && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 relative">
            <button
              onClick={() => setActiveCheckScheme(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider block">
                FAMILY ID ELIGIBILITY EVALUATION
              </span>
              <h3 className="text-lg font-black text-slate-900 m-0 mt-0.5">
                {activeCheckScheme.schemeName}
              </h3>
              <p className="text-xs text-slate-500">
                Department: {activeCheckScheme.department} | Benefit: <strong>₹{(activeCheckScheme.benefitAmount || 0).toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {familyMatches
                .filter(m => {
                  const sId = m.scheme?._id || m.schemeId?._id || m.schemeId;
                  const sCode = m.scheme?.schemeCode || m.schemeId?.schemeCode;
                  return (sId && String(sId) === String(activeCheckScheme._id)) || (sCode && sCode === activeCheckScheme.schemeCode);
                })
                .map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.isEligible ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'} space-y-2 text-xs`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{item.member.name}</strong>
                        <span className="text-slate-500 font-medium">({item.member.relationToHOF})</span>
                      </div>
                      {item.isEnrolled ? (
                        <span className="bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded font-bold text-[10px]">
                          ✓ Enrolled
                        </span>
                      ) : item.isEligible ? (
                        <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded font-bold text-[10px]">
                          ✓ Eligible
                        </span>
                      ) : (
                        <span className="bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded font-bold text-[10px]">
                          ✕ Not Eligible
                        </span>
                      )}
                    </div>

                    {item.matchedCriteria && item.matchedCriteria.length > 0 && (
                      <ul className="space-y-1 text-[11px] text-emerald-900 pl-2">
                        {item.matchedCriteria.map((c, i) => (
                          <li key={i}>✓ {c}</li>
                        ))}
                      </ul>
                    )}

                    {item.missingCriteria && item.missingCriteria.length > 0 && (
                      <ul className="space-y-1 text-[11px] text-amber-900 pl-2">
                        {item.missingCriteria.map((c, i) => (
                          <li key={i}>✕ {c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveCheckScheme(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
              >
                Close Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW ELIGIBILITY DETAILS MODAL */}
      {activeDetailsScheme && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 relative">
            <button
              onClick={() => setActiveDetailsScheme(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">SCHEME RULES & REQUIREMENTS</span>
              <h3 className="text-lg font-black text-slate-900 m-0">{activeDetailsScheme.schemeName}</h3>
              <p className="text-xs text-slate-500 mt-1">{activeDetailsScheme.description}</p>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs m-0 border-b border-slate-200 pb-2">Rule Definitions</h4>
              <div className="space-y-1.5 text-slate-700 pt-1">
                <div>• Department: <strong>{activeDetailsScheme.department}</strong></div>
                <div>• Benefit Payout: <strong>₹{(activeDetailsScheme.benefitAmount || 0).toLocaleString('en-IN')} ({activeDetailsScheme.benefitType})</strong></div>
                <div>• Max Household Income: <strong>₹{(activeDetailsScheme.rule?.maxIncome || 500000).toLocaleString('en-IN')}</strong></div>
                <div>• Age Range: <strong>{activeDetailsScheme.rule?.minAge || 0} to {activeDetailsScheme.rule?.maxAge || 120} Years</strong></div>
                <div>• Applicable Categories: <strong>{Array.isArray(activeDetailsScheme.rule?.requiredCategory) ? activeDetailsScheme.rule.requiredCategory.join(', ') : 'All'}</strong></div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveDetailsScheme(null)}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: OFFICER VIEW MATCHES MODAL */}
      {activeOfficerMatchesScheme && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 relative">
            <button
              onClick={() => setActiveOfficerMatchesScheme(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase text-purple-700 block">OFFICER SCHEME MATCHES</span>
              <h3 className="text-lg font-black text-slate-900 m-0">{activeOfficerMatchesScheme.schemeName}</h3>
              <p className="text-xs text-slate-500">
                Identified eligible citizens across all registered Family IDs.
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {officerMatches
                .filter(m => {
                  const sId = m.schemeId?._id || m.schemeId || m.scheme?._id;
                  const sCode = m.schemeId?.schemeCode || m.scheme?.schemeCode;
                  return ((sId && String(sId) === String(activeOfficerMatchesScheme._id)) || (sCode && sCode === activeOfficerMatchesScheme.schemeCode)) && m.isEligible;
                })
                .map((m, idx) => (
                  <div key={idx} className="bg-purple-50/60 border border-purple-200 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900 text-sm">{m.memberName || m.member?.name || 'Citizen'}</strong>
                      <span className="text-slate-500 text-[11px] ml-2">Family ID: <strong className="font-mono text-purple-900">{m.familyId || m.member?.familyId || 'N/A'}</strong></span>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Gender: {m.member?.gender || 'N/A'} | Department: {m.department}
                      </div>
                    </div>
                    <span className="bg-purple-700 text-white font-bold px-3 py-1 rounded-full text-[10px]">
                      ✓ Match Found
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveOfficerMatchesScheme(null)}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: OFFICER VIEW ENROLLED BENEFICIARIES MODAL */}
      {activeOfficerEnrolledScheme && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6 relative">
            <button
              onClick={() => setActiveOfficerEnrolledScheme(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">ENROLLED BENEFICIARIES</span>
              <h3 className="text-lg font-black text-slate-900 m-0">{activeOfficerEnrolledScheme.schemeName}</h3>
              <p className="text-xs text-slate-500">
                Active beneficiaries receiving benefits under this scheme.
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {officerMatches
                .filter(m => {
                  const sId = m.schemeId?._id || m.schemeId || m.scheme?._id;
                  const sCode = m.schemeId?.schemeCode || m.scheme?.schemeCode;
                  return ((sId && String(sId) === String(activeOfficerEnrolledScheme._id)) || (sCode && sCode === activeOfficerEnrolledScheme.schemeCode)) && m.isEnrolled;
                })
                .map((m, idx) => (
                  <div key={idx} className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900 text-sm">{m.memberName || m.member?.name || 'Citizen'}</strong>
                      <span className="text-slate-500 text-[11px] ml-2">Family ID: <strong className="font-mono text-emerald-900">{m.familyId || m.member?.familyId || 'N/A'}</strong></span>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        Benefit Payout: <strong>₹{(activeOfficerEnrolledScheme.benefitAmount || 0).toLocaleString('en-IN')}</strong> | Status: Active
                      </div>
                    </div>
                    <span className="bg-emerald-700 text-white font-bold px-3 py-1 rounded-full text-[10px]">
                      ✓ Active Beneficiary
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveOfficerEnrolledScheme(null)}
                className="bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
