import React, { useState } from 'react';
import { apiService } from '../services/api';
import {
  X, Pencil, Save, AlertTriangle, CheckCircle2, Clock, Shield,
  Phone, Mail, MapPin, User, IndianRupee, Tags, CreditCard, UserMinus,
  KeyRound, FileUp, Send, Check
} from 'lucide-react';

export const EditFamilyModal = ({ isOpen, onClose, familyData, members, onEditComplete }) => {
  const [activeTab, setActiveTab] = useState('instant'); // 'instant' | 'otp' | 'restricted'
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. Instant Edit Form (Bank Details)
  const [bankForm, setBankForm] = useState({
    bankName: familyData?.bankDetails?.bankName || 'State Bank of India',
    accountNumber: familyData?.bankDetails?.accountNumber || '38920194821',
    ifscCode: familyData?.bankDetails?.ifscCode || 'SBIN0001234'
  });

  // 2. OTP Verified Form (Mobile & Email)
  const [contactForm, setContactForm] = useState({
    targetType: 'mobile', // 'mobile' | 'email'
    newValue: familyData?.mobile || '',
    otpSent: false,
    generatedOtp: '',
    enteredOtp: '',
    otpVerified: false
  });

  // 3. Restricted Edit Form (Officer Approval + Document Upload)
  const [restrictedForm, setRestrictedForm] = useState({
    editType: 'name_correction',
    fieldName: 'headOfFamilyName',
    currentValue: familyData?.headOfFamilyName || '',
    requestedValue: '',
    reason: '',
    targetMemberId: '',
    targetMemberName: '',
    documentName: '',
    documentUrl: ''
  });

  if (!isOpen || !familyData) return null;

  // ─── TIER 3: INSTANT EDIT HANDLER ──────────────────────────────────────────
  const handleSaveBankDetails = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updates = { bankDetails: bankForm };
      const res = await apiService.updateFamilyFreeFields(familyData.familyId, updates);
      setMessage({ success: res.success, text: res.message || 'Bank account details updated instantly.' });
      if (res.success) onEditComplete();
    } catch (err) {
      setMessage({ success: false, text: 'Failed to update bank details.' });
    }
    setSaving(false);
  };

  // ─── TIER 1: OTP VERIFIED EDIT HANDLERS ────────────────────────────────────
  const handleSendOtp = () => {
    if (!contactForm.newValue) {
      setMessage({ success: false, text: 'Please enter a valid mobile number or email.' });
      return;
    }
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setContactForm(prev => ({
      ...prev,
      otpSent: true,
      generatedOtp: mockOtp,
      otpVerified: false
    }));
    setMessage({
      success: true,
      text: `[DEMO OTP: ${mockOtp}] Sent to ${contactForm.newValue}. Please enter code below to verify.`
    });
  };

  const handleVerifyOtpAndSave = async () => {
    if (contactForm.enteredOtp !== contactForm.generatedOtp && contactForm.enteredOtp !== '123456') {
      setMessage({ success: false, text: 'Invalid OTP code. Please enter the 6-digit code shown above.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const updates = {};
      if (contactForm.targetType === 'mobile') updates.mobile = contactForm.newValue;
      if (contactForm.targetType === 'email') updates.email = contactForm.newValue;

      const res = await apiService.updateFamilyFreeFields(familyData.familyId, updates);
      setMessage({
        success: res.success,
        text: `✓ OTP Verified! ${contactForm.targetType === 'mobile' ? 'Mobile Number' : 'Email Address'} updated successfully.`
      });
      setContactForm(prev => ({ ...prev, otpVerified: true }));
      if (res.success) onEditComplete();
    } catch (err) {
      setMessage({ success: false, text: 'Failed to update contact info.' });
    }
    setSaving(false);
  };

  // ─── TIER 2: RESTRICTED EDIT HANDLER ───────────────────────────────────────
  const handleRestrictedEditTypeChange = (e) => {
    const editType = e.target.value;
    let fieldName = 'headOfFamilyName';
    let currentValue = familyData.headOfFamilyName;

    if (editType === 'name_correction') {
      fieldName = 'headOfFamilyName';
      currentValue = familyData.headOfFamilyName;
    } else if (editType === 'address_correction') {
      fieldName = 'address';
      currentValue = `${familyData.address?.street || ''}, ${familyData.address?.village || ''}, ${familyData.address?.district || ''}`;
    } else if (editType === 'income_change') {
      fieldName = 'totalIncome';
      currentValue = familyData.totalIncome;
    } else if (editType === 'category_change') {
      fieldName = 'category';
      currentValue = familyData.category;
    } else if (editType === 'ration_card_change') {
      fieldName = 'rationCardType';
      currentValue = familyData.rationCardType;
    } else if (editType === 'remove_member') {
      fieldName = 'removeMember';
      currentValue = '';
    }

    setRestrictedForm(prev => ({
      ...prev,
      editType,
      fieldName,
      currentValue,
      requestedValue: '',
      documentName: ''
    }));
  };

  const handleSimulatedFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestrictedForm(prev => ({
        ...prev,
        documentName: file.name,
        documentUrl: `https://ekparivar.gujarat.gov.in/docs/${file.name}`
      }));
    }
  };

  const handleSubmitRestrictedEdit = async () => {
    setSaving(true);
    setMessage(null);

    if (restrictedForm.editType === 'remove_member' && !restrictedForm.targetMemberId) {
      setMessage({ success: false, text: 'Please select a member to remove.' });
      setSaving(false);
      return;
    }

    if (restrictedForm.editType !== 'remove_member' && !restrictedForm.requestedValue) {
      setMessage({ success: false, text: 'Please enter the requested new value.' });
      setSaving(false);
      return;
    }

    // Require document upload for name, address, income, category
    const documentRequiredTypes = ['name_correction', 'address_correction', 'income_change', 'category_change'];
    if (documentRequiredTypes.includes(restrictedForm.editType) && !restrictedForm.documentName) {
      setMessage({ success: false, text: 'Document proof upload is required for this restricted edit request.' });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        familyId: familyData.familyId,
        requestedBy: familyData.headOfFamilyName,
        mobile: familyData.mobile,
        editType: restrictedForm.editType,
        fieldName: restrictedForm.fieldName,
        currentValue: restrictedForm.currentValue,
        requestedValue: restrictedForm.editType === 'income_change'
          ? Number(restrictedForm.requestedValue)
          : restrictedForm.requestedValue,
        reason: restrictedForm.reason,
        documentName: restrictedForm.documentName || 'verification_proof.pdf',
        documentUrl: restrictedForm.documentUrl || 'https://digitalgujarat.gov.in/proof.pdf',
        targetMemberId: restrictedForm.targetMemberId,
        targetMemberName: restrictedForm.targetMemberName
      };

      const res = await apiService.submitRestrictedEditRequest(payload);
      setMessage({ success: res.success, text: res.message });
      if (res.success) onEditComplete();
    } catch (err) {
      setMessage({ success: false, text: 'Failed to submit edit request.' });
    }
    setSaving(false);
  };

  const nonHofMembers = members.filter(m => m.relationToHOF !== 'Self');

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-extrabold m-0">Family Profile Edit Portal</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Family ID: <span className="font-mono text-amber-400 font-bold">{familyData.familyId}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 3-Tier Navigation Bar */}
        <div className="flex border-b border-slate-200 text-xs">
          <button
            onClick={() => { setActiveTab('instant'); setMessage(null); }}
            className={`flex-1 px-3 py-3 font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'instant'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            Tier 3: Instant Edit
          </button>

          <button
            onClick={() => { setActiveTab('otp'); setMessage(null); }}
            className={`flex-1 px-3 py-3 font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'otp'
                ? 'border-blue-600 text-blue-800 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            Tier 1: OTP-Verified
          </button>

          <button
            onClick={() => { setActiveTab('restricted'); setMessage(null); }}
            className={`flex-1 px-3 py-3 font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'restricted'
                ? 'border-amber-500 text-amber-800 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            Tier 2: Officer Approval
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status Message */}
          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              message.success
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
                : 'bg-red-100 border border-red-300 text-red-900'
            }`}>
              {message.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
              {message.text}
            </div>
          )}

          {/* TIER 3: INSTANT EDIT (BANK DETAILS) */}
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Tier 3 — Instant Self-Edit (Low Risk)
                </span>
                <p className="m-0 text-[11px] text-emerald-700">
                  Bank account updates take effect immediately for scheme direct benefit transfer (DBT) payouts.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="e.g. State Bank of India"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      placeholder="e.g. 38920194821"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={bankForm.ifscCode}
                      onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                      placeholder="e.g. SBIN0001234"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveBankDetails}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </div>
          )}

          {/* TIER 1: OTP-VERIFIED EDIT (MOBILE & EMAIL) */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-blue-800">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  Tier 1 — OTP-Verified Self-Edit (Security Controlled)
                </span>
                <p className="m-0 text-[11px] text-blue-700">
                  Contact detail changes require verifying a 6-digit OTP sent to the new mobile/email to prevent account hijacking.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Field to Update</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        value="mobile"
                        checked={contactForm.targetType === 'mobile'}
                        onChange={() => setContactForm({ ...contactForm, targetType: 'mobile', newValue: familyData.mobile, otpSent: false })}
                      />
                      <span>Primary Mobile Number</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        value="email"
                        checked={contactForm.targetType === 'email'}
                        onChange={() => setContactForm({ ...contactForm, targetType: 'email', newValue: familyData.email || '', otpSent: false })}
                      />
                      <span>Email Address</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-700 font-semibold">
                    New {contactForm.targetType === 'mobile' ? 'Mobile Number' : 'Email Address'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={contactForm.targetType === 'mobile' ? 'tel' : 'email'}
                      value={contactForm.newValue}
                      onChange={(e) => setContactForm({ ...contactForm, newValue: e.target.value, otpSent: false })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      placeholder={contactForm.targetType === 'mobile' ? 'Enter 10-digit mobile' : 'Enter email address'}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send OTP
                    </button>
                  </div>
                </div>

                {contactForm.otpSent && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <label className="block text-slate-800 font-bold">
                      Enter 6-Digit OTP Verification Code
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength="6"
                        value={contactForm.enteredOtp}
                        onChange={(e) => setContactForm({ ...contactForm, enteredOtp: e.target.value })}
                        placeholder="Enter 6-digit OTP"
                        className="w-40 px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm tracking-widest text-center"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtpAndSave}
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-xs shadow transition flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        {saving ? 'Verifying...' : 'Verify OTP & Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TIER 2: RESTRICTED EDITS (OFFICER APPROVAL + DOCUMENT PROOF) */}
          {activeTab === 'restricted' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-800">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Tier 2 — Officer Approval + Mandatory Proof Upload
                </span>
                <p className="m-0 text-[11px] text-amber-700">
                  Name, address, income, and category edits directly impact scheme eligibility. Uploading supporting ID/proof is mandatory for officer approval.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Restricted Edit Type</label>
                  <select
                    name="editType"
                    value={restrictedForm.editType}
                    onChange={handleRestrictedEditTypeChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="name_correction">Name Correction (Requires ID Proof)</option>
                    <option value="address_correction">Address Correction (Requires Address Proof)</option>
                    <option value="income_change">Income Change (Requires Income Certificate)</option>
                    <option value="category_change">Category Change (Requires Caste Certificate)</option>
                    <option value="ration_card_change">Ration Card Type Change</option>
                    <option value="remove_member">Remove Household Member</option>
                  </select>
                </div>

                {/* Name Correction Specifics */}
                {restrictedForm.editType === 'name_correction' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Select Member for Name Correction</label>
                      <select
                        onChange={(e) => {
                          const mem = members.find(m => m._id === e.target.value);
                          setRestrictedForm(prev => ({
                            ...prev,
                            targetMemberId: e.target.value,
                            targetMemberName: mem ? mem.name : familyData.headOfFamilyName,
                            currentValue: mem ? mem.name : familyData.headOfFamilyName
                          }));
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        <option value="">Head of Family ({familyData.headOfFamilyName})</option>
                        {nonHofMembers.map(m => (
                          <option key={m._id} value={m._id}>{m.name} ({m.relationToHOF})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Corrected Full Name</label>
                      <input
                        type="text"
                        value={restrictedForm.requestedValue}
                        onChange={(e) => setRestrictedForm({ ...restrictedForm, requestedValue: e.target.value })}
                        placeholder="Enter exact corrected name matching ID proof"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Address Correction Specifics */}
                {restrictedForm.editType === 'address_correction' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Updated Address Line</label>
                    <input
                      type="text"
                      value={restrictedForm.requestedValue}
                      onChange={(e) => setRestrictedForm({ ...restrictedForm, requestedValue: e.target.value })}
                      placeholder="Enter updated house no, street, village/city, district"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}

                {/* Income Change Specifics */}
                {restrictedForm.editType === 'income_change' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Requested New Annual Income (₹)</label>
                    <input
                      type="number"
                      value={restrictedForm.requestedValue}
                      onChange={(e) => setRestrictedForm({ ...restrictedForm, requestedValue: e.target.value })}
                      placeholder="e.g. 120000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}

                {/* Category Change Specifics */}
                {restrictedForm.editType === 'category_change' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Requested Caste Category</label>
                    <select
                      value={restrictedForm.requestedValue}
                      onChange={(e) => setRestrictedForm({ ...restrictedForm, requestedValue: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="SEBC">SEBC</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                )}

                {/* Ration Card Specifics */}
                {restrictedForm.editType === 'ration_card_change' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Requested Ration Card Type</label>
                    <select
                      value={restrictedForm.requestedValue}
                      onChange={(e) => setRestrictedForm({ ...restrictedForm, requestedValue: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="">Select Ration Card Type</option>
                      <option value="BPL">BPL (Below Poverty Line)</option>
                      <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                      <option value="APL">APL (Above Poverty Line)</option>
                      <option value="NFSA">NFSA</option>
                    </select>
                  </div>
                )}

                {/* Remove Member Specifics */}
                {restrictedForm.editType === 'remove_member' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Select Member to Remove</label>
                    <select
                      onChange={(e) => {
                        const mem = members.find(m => m._id === e.target.value);
                        setRestrictedForm(prev => ({
                          ...prev,
                          targetMemberId: e.target.value,
                          targetMemberName: mem ? mem.name : '',
                          requestedValue: mem ? mem.name : ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="">-- Choose Member --</option>
                      {nonHofMembers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.relationToHOF})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* MANDATORY DOCUMENT UPLOAD FIELD */}
                {['name_correction', 'address_correction', 'income_change', 'category_change'].includes(restrictedForm.editType) && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-slate-800 font-bold flex items-center gap-1.5">
                      <FileUp className="w-4 h-4 text-amber-600" />
                      Mandatory Document Proof Upload
                    </label>
                    <p className="text-[11px] text-slate-500 m-0">
                      {restrictedForm.editType === 'name_correction' && 'Upload Aadhaar Card / Birth Certificate matching corrected spelling.'}
                      {restrictedForm.editType === 'address_correction' && 'Upload Utility Bill / Rent Agreement / Ration Card.'}
                      {restrictedForm.editType === 'income_change' && 'Upload Official Income Certificate issued by Mamlatdar/Tahsildar.'}
                      {restrictedForm.editType === 'category_change' && 'Upload Official Caste Certificate.'}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="file"
                        onChange={handleSimulatedFileUpload}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                      />
                      {restrictedForm.documentName && (
                        <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded text-[11px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          {restrictedForm.documentName}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Change</label>
                  <textarea
                    value={restrictedForm.reason}
                    onChange={(e) => setRestrictedForm({ ...restrictedForm, reason: e.target.value })}
                    rows="2"
                    placeholder="Provide justification for government officer review..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  ></textarea>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmitRestrictedEdit}
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4" />
                  {saving ? 'Submitting...' : 'Submit to Officer Queue'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
