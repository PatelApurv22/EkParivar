import React, { useState } from 'react';
import { apiService } from '../services/api';
import {
  X, Scissors, AlertTriangle, CheckCircle2, Clock, Users,
  UserCheck, ArrowRight
} from 'lucide-react';

export const SplitFamilyModal = ({ isOpen, onClose, familyData, members, onSplitComplete }) => {
  const [step, setStep] = useState(1); // 1: Select Members, 2: New Family Details, 3: Review & Submit
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Split form state
  const [selectedMembers, setSelectedMembers] = useState({}); // memberId -> boolean
  const [newHeadId, setNewHeadId] = useState('');
  const [splitReason, setSplitReason] = useState('marriage');
  const [reasonDetails, setReasonDetails] = useState('');
  const [newFamilyIncome, setNewFamilyIncome] = useState('');
  const [newFamilyCategory, setNewFamilyCategory] = useState(familyData?.category || 'General');
  const [newFamilyRationCardType, setNewFamilyRationCardType] = useState(familyData?.rationCardType || 'BPL');

  if (!isOpen || !familyData) return null;

  // Non-HOF members eligible for splitting
  const splittableMembers = members.filter(m => m.relationToHOF !== 'Self');
  const selectedMemberList = splittableMembers.filter(m => selectedMembers[m._id]);
  const newHead = members.find(m => m._id === newHeadId);

  const toggleMember = (memberId) => {
    setSelectedMembers(prev => {
      const updated = { ...prev, [memberId]: !prev[memberId] };
      // If deselecting the head, reset head
      if (!updated[memberId] && newHeadId === memberId) {
        setNewHeadId('');
      }
      return updated;
    });
  };

  const canProceedStep1 = selectedMemberList.length > 0 && newHeadId;
  const canProceedStep2 = splitReason && newFamilyIncome;

  const handleSubmitSplit = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        sourceFamilyId: familyData.familyId,
        requestedBy: familyData.headOfFamilyName,
        mobile: familyData.mobile,
        splitReason,
        reasonDetails,
        membersToSplit: selectedMemberList.map(m => ({
          memberId: m._id,
          memberName: m.name,
          relationToHOF: m.relationToHOF
        })),
        newHeadMemberId: newHeadId,
        newHeadMemberName: newHead ? newHead.name : '',
        newFamilyIncome: Number(newFamilyIncome) || 0,
        newFamilyCategory,
        newFamilyRationCardType
      };

      const res = await apiService.requestFamilySplit(payload);
      setMessage({ success: res.success, text: res.message });
      if (res.success) {
        setTimeout(() => {
          onSplitComplete();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setMessage({ success: false, text: 'Failed to submit split request.' });
    }
    setSaving(false);
  };

  const splitReasonLabels = {
    marriage: '💍 Marriage (member marrying into different household)',
    separation: '⚖️ Legal Separation / Divorce',
    adult_child_independence: '🏠 Adult Child Establishing Independent Household',
    other: '📋 Other Reason'
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold m-0">Request Family Split</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Source Family: <span className="font-mono text-amber-400">{familyData.familyId}</span> •
              HOF: <span className="text-white font-medium">{familyData.headOfFamilyName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 p-4 bg-slate-50 border-b border-slate-200">
          {[
            { num: 1, label: 'Select Members' },
            { num: 2, label: 'New Family Details' },
            { num: 3, label: 'Review & Submit' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                step === s.num
                  ? 'bg-amber-500 text-slate-950'
                  : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{s.num}</span>}
                {s.label}
              </div>
              {idx < 2 && <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />}
            </div>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Status Message */}
          {message && (
            <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
              message.success
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                : 'bg-red-100 border border-red-300 text-red-900'
            }`}>
              {message.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {/* STEP 1: Select Members to Split */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <strong>How Family Splitting Works:</strong> When a member permanently leaves the household
                (marriage, separation, or adult child independence), they form a new family unit with a
                new <strong>EKP-YYYYMMDD-XXXX</strong> Family ID. The split requires Government Officer approval.
              </div>

              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select members to move to the new family:
              </h4>

              {splittableMembers.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-6">
                  No eligible members to split. Only non-HOF members can be split into a new family.
                </div>
              ) : (
                <div className="space-y-2">
                  {splittableMembers.map(mem => (
                    <div key={mem._id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        selectedMembers[mem._id]
                          ? 'bg-amber-50 border-amber-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => toggleMember(mem._id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedMembers[mem._id]}
                          onChange={() => toggleMember(mem._id)}
                          className="w-4 h-4 rounded text-amber-600"
                        />
                        <div>
                          <strong className="text-sm text-slate-900">{mem.name}</strong>
                          <div className="text-[11px] text-slate-500">
                            {mem.relationToHOF} • {mem.gender} • Age: {mem.dob ? Math.floor((Date.now() - new Date(mem.dob)) / 31557600000) : '?'} yrs
                          </div>
                        </div>
                      </div>

                      {selectedMembers[mem._id] && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setNewHeadId(mem._id); }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                            newHeadId === mem._id
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-200 text-slate-700 hover:bg-emerald-100'
                          }`}
                        >
                          {newHeadId === mem._id ? '✓ New HOF' : 'Set as HOF'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedMemberList.length > 0 && !newHeadId && (
                <div className="text-amber-700 text-xs font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Please select one member as the Head of the new family.
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  Next: New Family Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: New Family Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                New Family Unit Details
              </h4>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                <strong>New Head of Family:</strong> <span className="text-emerald-800 font-bold">{newHead?.name || 'Not selected'}</span>
                <br />
                <strong>Members Moving:</strong> {selectedMemberList.map(m => m.name).join(', ')}
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold mb-1 block">Reason for Split</label>
                  <select
                    value={splitReason}
                    onChange={(e) => setSplitReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {Object.entries(splitReasonLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold mb-1 block">Additional Details</label>
                  <textarea
                    value={reasonDetails}
                    onChange={(e) => setReasonDetails(e.target.value)}
                    rows={2}
                    placeholder="Provide context for the split..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-700 font-semibold mb-1 block">New Family Annual Income (₹)</label>
                    <input
                      type="number"
                      value={newFamilyIncome}
                      onChange={(e) => setNewFamilyIncome(e.target.value)}
                      placeholder="e.g. 120000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold mb-1 block">Category</label>
                    <select
                      value={newFamilyCategory}
                      onChange={(e) => setNewFamilyCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="SEBC">SEBC</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold mb-1 block">Ration Card Type</label>
                    <select
                      value={newFamilyRationCardType}
                      onChange={(e) => setNewFamilyRationCardType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="BPL">BPL</option>
                      <option value="APL">APL</option>
                      <option value="AAY">AAY</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-slate-600 hover:text-slate-900 font-bold text-xs underline transition"
                >
                  ← Back to Member Selection
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  Next: Review
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Review Split Request
              </h4>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Source Family</span>
                    <strong className="font-mono text-slate-900">{familyData.familyId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current HOF</span>
                    <strong>{familyData.headOfFamilyName}</strong>
                  </div>
                </div>

                <hr className="border-slate-200" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">New HOF</span>
                    <strong className="text-emerald-800">{newHead?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Split Reason</span>
                    <strong>{splitReasonLabels[splitReason]}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Members Moving to New Family</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedMemberList.map(m => (
                      <span key={m._id} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold text-[11px]">
                        {m.name} ({m.relationToHOF})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">New Income</span>
                    <strong>₹{Number(newFamilyIncome).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <strong>{newFamilyCategory}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ration Card</span>
                    <strong>{newFamilyRationCardType}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  After submission, a Government Officer will review and approve the split.
                  Upon approval, a new <strong>EKP-YYYYMMDD-XXXX</strong> Family ID will be generated
                  and the selected members will be transferred to the new family record.
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="text-slate-600 hover:text-slate-900 font-bold text-xs underline transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmitSplit}
                  disabled={saving}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  <Scissors className="w-4 h-4" />
                  {saving ? 'Submitting Split Request...' : 'Submit Split Request for Officer Approval'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
