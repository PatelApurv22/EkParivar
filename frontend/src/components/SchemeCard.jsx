import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, FileWarning, Send, Loader2, XCircle, Clock } from 'lucide-react';
import { apiService } from '../services/api';

export const SchemeCard = ({ match, familyId, onEnrollSuccess }) => {
  const { scheme, member, isEligible, isEnrolled, enrollmentStatus, matchedCriteria, missingCriteria, missingDocuments } = match;
  const [enrolling, setEnrolling] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'warn', text }

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApply = async () => {
    if (!member?._id || !scheme?._id) {
      showToast('error', 'Cannot identify member or scheme. Please refresh.');
      return;
    }
    setEnrolling(true);
    try {
      const res = await apiService.enrollMember(member._id, scheme._id, familyId);
      setEnrolling(false);
      if (res.success) {
        if (res.isDuplicate) {
          showToast('warn', res.message || 'Duplicate enrollment flagged.');
        } else {
          showToast('success', '✅ Application submitted for Officer review.');
        }
        if (onEnrollSuccess) onEnrollSuccess(res);
      } else {
        showToast('error', res.message || 'Enrollment submission failed.');
      }
    } catch (err) {
      setEnrolling(false);
      showToast('error', 'Enrollment failed. Please try again.');
    }
  };

  const statusBadge = () => {
    const s = enrollmentStatus || (isEnrolled ? 'active' : 'unenrolled');
    if (s === 'active') return (
      <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Active Benefit
      </span>
    );
    if (s === 'pending_approval') return (
      <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending Officer Approval
      </span>
    );
    if (s === 'rejected') return (
      <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5">
        <XCircle className="w-3.5 h-3.5 text-red-600" />
        Application Rejected
      </span>
    );
    if (s === 'flagged_duplicate') return (
      <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
        Duplicate Flagged
      </span>
    );
    return null;
  };

  const isPendingOrEnrolled = isEnrolled || enrollmentStatus === 'pending_approval' || enrollmentStatus === 'flagged_duplicate';

  return (
    <div className={`bg-white rounded-xl border ${isEligible ? 'border-emerald-200 shadow-sm hover:shadow-md' : 'border-slate-200 opacity-90'} transition overflow-hidden flex flex-col relative`}>

      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-2 left-2 right-2 z-20 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' :
          toast.type === 'warn'    ? 'bg-amber-500 text-slate-900' :
                                     'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {toast.type === 'warn'    && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.type === 'error'   && <XCircle className="w-4 h-4 shrink-0" />}
          {toast.text}
        </div>
      )}

      {/* Top Banner Header */}
      <div className={`px-5 py-3 border-b flex items-center justify-between ${isEligible ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            {scheme.department}
          </span>
          <h4 className="text-base font-bold text-slate-900 m-0 line-clamp-1">
            {scheme.schemeName}
          </h4>
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className="text-xs text-slate-500 block">Benefit</span>
          <span className="text-base font-extrabold text-emerald-700">
            ₹{(scheme.benefitAmount || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-4 flex-1 text-xs">
        <p className="text-slate-600 leading-relaxed">
          {scheme.description}
        </p>

        {/* Target Member Badge */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-slate-700 font-medium">
          <span className="text-slate-500">Evaluating For Member:</span>
          <strong className="text-slate-900">{member.name}</strong>
          <span className="text-slate-400">({member.relationToHOF})</span>
        </div>

        {/* Eligibility Breakdown */}
        {isEligible ? (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3.5 space-y-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Why you are eligible:
            </span>
            <ul className="space-y-1 pl-1">
              {matchedCriteria && matchedCriteria.length > 0 ? (
                matchedCriteria.map((item, idx) => (
                  <li key={idx} className="text-emerald-800 flex items-start gap-1.5 text-[11px]">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-emerald-800 text-[11px]">✓ Satisfies all core demographic and income rules.</li>
              )}
            </ul>
          </div>
        ) : (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3.5 space-y-2">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Criteria Not Satisfied:
            </span>
            <ul className="space-y-1 pl-1">
              {missingCriteria && missingCriteria.length > 0 ? (
                missingCriteria.map((item, idx) => (
                  <li key={idx} className="text-amber-800 flex items-start gap-1.5 text-[11px]">
                    <span className="text-amber-600 font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-amber-800 text-[11px]">Member criteria does not match this scheme rules.</li>
              )}
            </ul>
          </div>
        )}

        {/* Missing Required Documents Warning */}
        {missingDocuments && missingDocuments.length > 0 && (
          <div className="bg-amber-100/60 border border-amber-300/80 rounded-lg p-3 text-amber-900 space-y-1">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
              <FileWarning className="w-4 h-4 text-amber-700 shrink-0" />
              Missing Required Documents:
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingDocuments.map((doc, idx) => (
                <span key={idx} className="bg-white/90 border border-amber-300 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded capitalize">
                  ⚠ {doc.replace('_', ' ')}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-amber-800 pt-1">
              Upload these documents in the "My Documents" tab to complete your application.
            </p>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-slate-500 text-[11px] font-mono font-medium">
          {scheme.schemeCode || 'SCH-GUJ-100'}
        </span>

        {isPendingOrEnrolled ? (
          statusBadge()
        ) : isEligible ? (
          <button
            onClick={handleApply}
            disabled={enrolling}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
          >
            {enrolling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Apply / Enroll
              </>
            )}
          </button>
        ) : (
          <span className="bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-lg font-bold text-xs">
            Criteria Not Satisfied
          </span>
        )}
      </div>
    </div>
  );
};
