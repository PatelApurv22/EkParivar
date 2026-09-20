import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
  UserPlus, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Sparkles,
  Upload, FileText, Check, AlertCircle, Clock, ShieldAlert, RefreshCw
} from 'lucide-react';

export const CreateFamilyPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  // Form Data across all steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    headOfFamilyName: '',
    dob: '1985-06-15',
    gender: 'M',
    category: 'OBC',
    mobile: '',
    email: '',
    houseNo: 'House 12',
    street: 'Main Road',
    village: 'Gandhinagar',
    taluka: 'Gandhinagar',
    district: 'Gandhinagar',
    pincode: '382010',
    totalIncome: 180000,
    incomeSource: 'Agriculture & Labor',
    rationCardType: 'BPL',

    // Step 2: Mock Aadhaar Verification
    aadhaarNumber: '453289011234',
    aadhaarVerified: false,
    aadhaarVerifying: false,

    // Step 3: Documents Upload Simulation
    documents: [
      { documentType: 'income_cert', name: 'Income Certificate', fileName: 'Income_Certificate_2026.pdf', uploaded: true },
      { documentType: 'ration_card', name: 'Ration Card (BPL/AAY)', fileName: 'BPL_Ration_Card.pdf', uploaded: true },
      { documentType: 'caste_cert', name: 'Caste / Community Certificate', fileName: 'OBC_Caste_Certificate.pdf', uploaded: true },
      { documentType: 'aadhaar_card', name: 'Aadhaar Card Copy', fileName: 'Aadhaar_Card_Front_Back.pdf', uploaded: true }
    ]
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocumentSimulatedUpload = (docType, fileName) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d => 
        d.documentType === docType ? { ...d, fileName: fileName || `${docType}_uploaded.pdf`, uploaded: true } : d
      )
    }));
  };

  // Step 2 Mock Aadhaar Verification trigger
  const runMockAadhaarVerification = () => {
    if (!formData.aadhaarNumber || formData.aadhaarNumber.replace(/\s/g, '').length !== 12) {
      setError('Please enter a valid 12-digit mock Aadhaar number.');
      return;
    }

    setError('');
    setFormData(prev => ({ ...prev, aadhaarVerifying: true }));

    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        aadhaarVerifying: false,
        aadhaarVerified: true
      }));
    }, 1000);
  };

  // Step 4 Final Submission
  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        headOfFamilyName: formData.headOfFamilyName,
        dob: formData.dob,
        gender: formData.gender,
        category: formData.category,
        mobile: formData.mobile,
        email: formData.email || '',
        address: {
          houseNo: formData.houseNo,
          street: formData.street,
          village: formData.village,
          taluka: formData.taluka,
          district: formData.district,
          state: "Gujarat",
          pincode: formData.pincode
        },
        totalIncome: Number(formData.totalIncome) || 0,
        incomeSource: formData.incomeSource,
        rationCardType: formData.rationCardType,
        aadhaarDetails: {
          aadhaarNumber: formData.aadhaarNumber.replace(/\s/g, ''),
          verified: formData.aadhaarVerified,
          method: "mock",
          verifiedAt: new Date().toISOString()
        },
        documents: formData.documents.filter(d => d.uploaded).map(d => ({
          documentType: d.documentType,
          fileName: d.fileName
        }))
      };

      const res = await apiService.submitFamilyApplication(payload);
      setSubmitting(false);

      if (res.success) {
        setSubmissionResult(res);
        // Application is pending approval — login without a JWT token for now
        login('family', formData.mobile, null, null);
      } else {
        setError(res.message || 'Application submission failed.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Error submitting application. Please try again.');
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.headOfFamilyName || !formData.mobile) {
        setError('Please enter Head of Family Name and Mobile Number.');
        return;
      }
      if (formData.mobile.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }
    if (currentStep === 2 && !formData.aadhaarVerified) {
      setError('Please click "Verify Aadhaar (Demo)" to complete mock identity check.');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 py-8 px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-4">
        
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded">
                CITIZEN REGISTRATION WIZARD
              </span>
              <span className="text-amber-400 text-xs font-mono">Step {currentStep} of 4</span>
            </div>
            <h2 className="text-2xl font-black text-white m-0 mt-1">
              Create Family ID Application
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit household details & documents for Government Officer verification.
            </p>
          </div>

          <img
            src="/logo.png"
            alt="EkParivar Logo"
            className="w-14 h-14 bg-white p-1 rounded-xl border border-amber-400 object-contain hidden sm:block shrink-0"
          />
        </div>

        {/* STEPPER PROGRESS BAR */}
        {!submissionResult && (
          <div className="bg-slate-800 text-slate-300 px-6 py-3 border-t border-slate-700">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className={`py-1.5 rounded-md transition ${currentStep === 1 ? 'bg-amber-500 text-slate-950 shadow' : currentStep > 1 ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                1. Basic Details
              </div>
              <div className={`py-1.5 rounded-md transition ${currentStep === 2 ? 'bg-amber-500 text-slate-950 shadow' : currentStep > 2 ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                2. Aadhaar Verify
              </div>
              <div className={`py-1.5 rounded-md transition ${currentStep === 3 ? 'bg-amber-500 text-slate-950 shadow' : currentStep > 3 ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                3. Documents
              </div>
              <div className={`py-1.5 rounded-md transition ${currentStep === 4 ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-700 text-slate-400'}`}>
                4. Review & Submit
              </div>
            </div>
          </div>
        )}

        {/* WIZARD BODY */}
        <div className="p-6 text-xs">
          {error && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!submissionResult ? (
            <div>
              {/* STEP 1: BASIC DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 m-0">
                    Step 1: Head of Family Basic Details & Income
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-slate-800 font-semibold mb-1">
                        Head of Family Full Name *
                      </label>
                      <input
                        type="text"
                        name="headOfFamilyName"
                        value={formData.headOfFamilyName}
                        onChange={handleChange}
                        placeholder="e.g. Rameshchandra Patel"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="M">Male (M)</option>
                        <option value="F">Female (F)</option>
                        <option value="O">Other (O)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. ramesh.patel@gmail.com"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                      <p className="text-slate-400 text-[10px] mt-1">Used for government notifications and scheme updates.</p>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        District (Gujarat) *
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Gandhinagar">Gandhinagar</option>
                        <option value="Surat">Surat</option>
                        <option value="Vadodara">Vadodara</option>
                        <option value="Rajkot">Rajkot</option>
                        <option value="Mehsana">Mehsana</option>
                      </select>
                    </div>


                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC (Other Backward Class)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="SEBC">SEBC</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        Ration Card Type *
                      </label>
                      <select
                        name="rationCardType"
                        value={formData.rationCardType}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="BPL">BPL (Below Poverty Line)</option>
                        <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                        <option value="APL">APL (Above Poverty Line)</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        Annual Household Income (₹) *
                      </label>
                      <input
                        type="number"
                        name="totalIncome"
                        value={formData.totalIncome}
                        onChange={handleChange}
                        placeholder="180000"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        Income Source
                      </label>
                      <input
                        type="text"
                        name="incomeSource"
                        value={formData.incomeSource}
                        onChange={handleChange}
                        placeholder="e.g. Agriculture & Daily Wage"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MOCK AADHAAR VERIFICATION */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 m-0">
                    Step 2: Head of Family Aadhaar Identity Verification
                  </h3>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>MOCK / DEMO MODE:</strong> Identity verification is simulated using test data. No real UIDAI APIs are invoked.
                    </span>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 max-w-lg mx-auto">
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">
                        12-Digit Mock Aadhaar Number
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        placeholder="4532 8901 1234"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {!formData.aadhaarVerified ? (
                      <button
                        type="button"
                        onClick={runMockAadhaarVerification}
                        disabled={formData.aadhaarVerifying}
                        className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow transition disabled:opacity-50"
                      >
                        {formData.aadhaarVerifying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                            Verifying Mock Aadhaar...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            Verify Aadhaar (Demo)
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-emerald-900">
                        <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ✓ Aadhaar Verified (Demo Success)
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200/80">
                          <div>Name Match: <strong>✓ Verified</strong></div>
                          <div>DOB Match: <strong>✓ Verified</strong></div>
                          <div>Mobile Linked: <strong>✓ Verified</strong></div>
                          <div>Method: <strong>MOCK / DEMO</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: DOCUMENTS SIMULATED UPLOAD */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 m-0">
                    Step 3: Upload Supporting Documents
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Upload copies of mandatory certificates for Officer verification. (Simulated upload)
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.documents.map((doc, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 text-xs font-bold">{doc.name}</strong>
                          {doc.uploaded ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Uploaded
                            </span>
                          ) : (
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-200 text-[11px] text-slate-600">
                          <span className="truncate max-w-[180px] font-mono">{doc.fileName}</span>
                          <button
                            type="button"
                            onClick={() => handleDocumentSimulatedUpload(doc.documentType, `${doc.documentType}_v2.pdf`)}
                            className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Re-upload
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 m-0">
                    Step 4: Application Review & Final Submission
                  </h3>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <strong className="text-slate-900 text-sm">Head of Family Summary</strong>
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-bold text-[11px]">
                        Status: Pending Submission
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700">
                      <div><span className="text-slate-400 block">HOF Name:</span><strong>{formData.headOfFamilyName}</strong></div>
                      <div><span className="text-slate-400 block">Mobile:</span><strong className="font-mono">{formData.mobile}</strong></div>
                      <div><span className="text-slate-400 block">District:</span><strong>{formData.district}</strong></div>
                      <div><span className="text-slate-400 block">Category:</span><strong>{formData.category}</strong></div>
                      <div><span className="text-slate-400 block">Ration Card:</span><strong>{formData.rationCardType}</strong></div>
                      <div><span className="text-slate-400 block">Annual Income:</span><strong>₹{Number(formData.totalIncome).toLocaleString('en-IN')}</strong></div>
                      <div><span className="text-slate-400 block">Aadhaar Status:</span><strong className="text-emerald-700">✓ Mock Verified</strong></div>
                      <div><span className="text-slate-400 block">Uploaded Docs:</span><strong>{formData.documents.filter(d => d.uploaded).length} Attached</strong></div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-[11px]">
                      ⚠ <strong>Important Notice:</strong> Upon clicking "Submit Application", your record will be assigned an Application Reference Number (<code>APP-GUJ-2026-XXXX</code>) and queued for Government Officer approval. Family ID will be generated upon Officer Approval.
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="pt-6 flex items-center justify-between border-t border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg flex items-center gap-1.5 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous Step
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow transition"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={submitting}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <UserPlus className="w-5 h-5" />
                    {submitting ? 'Submitting Application...' : 'Submit Application for Officer Approval'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* SUBMISSION SUCCESS - PENDING OFFICER APPROVAL VIEW */
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block">
                  Application Submitted & Pending Officer Approval
                </span>
                <div className="inline-block bg-slate-900 text-amber-400 font-mono font-black text-2xl px-6 py-3 rounded-xl shadow-md border border-amber-500/40">
                  {submissionResult.applicationRefNo}
                </div>
                <p className="text-xs text-slate-600 max-w-md mx-auto pt-1">
                  Your application has been received for Head of Family <strong>{formData.headOfFamilyName}</strong>. 
                  Status is currently <strong>Pending Government Officer Review</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant Name:</span>
                  <strong className="text-slate-900">{formData.headOfFamilyName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Number:</span>
                  <strong className="font-mono text-slate-900">{formData.mobile}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    ⏳ pending_approval
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Family ID Status:</span>
                  <span className="text-slate-500 font-medium">Will be generated upon Officer Approval</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/family-dashboard')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition flex items-center gap-2"
                >
                  Go to Family Dashboard
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
