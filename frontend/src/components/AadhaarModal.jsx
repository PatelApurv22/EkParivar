import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, X, RefreshCw, Smartphone, Calendar, User } from 'lucide-react';
import { apiService } from '../services/api';

export const AadhaarModal = ({ member, isOpen, onClose, onVerified }) => {
  const [aadhaarInput, setAadhaarInput] = useState(member?.aadhaarNumber || '453289011234');
  const [mobileInput, setMobileInput] = useState(member?.mobile || '9876543210');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !member) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!aadhaarInput || aadhaarInput.replace(/\s/g, '').length !== 12) {
      setError('Please enter a valid 12-digit mock Aadhaar number.');
      return;
    }

    setError('');
    setVerifying(true);
    setVerificationResult(null);

    // Simulate realistic 1.2s verification delay
    setTimeout(async () => {
      try {
        const cleanAadhaar = aadhaarInput.replace(/\s/g, '');
        const res = await apiService.verifyAadhaar(member._id, cleanAadhaar, mobileInput);
        setVerificationResult(res);
        setVerifying(false);
        if (onVerified) onVerified(member._id, cleanAadhaar);
      } catch (err) {
        setError('Verification failed. Please try again.');
        setVerifying(false);
      }
    }, 1200);
  };

  const formatAadhaar = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    return raw.replace(/(\d{4})(\d{4})?(\d{4})?/, (_, p1, p2, p3) => {
      let parts = [p1];
      if (p2) parts.push(p2);
      if (p3) parts.push(p3);
      return parts.join(' ');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold m-0">Aadhaar Identity Verification</h3>
              <p className="text-xs text-amber-400 font-medium m-0">MOCK / DEMO Verification Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Prototype Security Notice:</strong> This flow simulates identity verification using mock data. No real UIDAI / Aadhaar APIs are invoked.
            </div>
          </div>

          {/* Member Card */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Member Name:</span>
              <strong className="text-sm font-semibold text-slate-900">{member.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Relation to HOF:</span>
              <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-medium">{member.relationToHOF}</span>
            </div>
          </div>

          {!verificationResult ? (
            <form onSubmit={handleVerify} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Mock 12-Digit Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaarInput}
                  onChange={(e) => setAadhaarInput(formatAadhaar(e.target.value))}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-base focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
                <span className="text-slate-500 text-[11px] mt-1 block">
                  Example fictional numbers: 4532 8901 1234, 8899 1122 3344
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Registered Mobile Number
                </label>
                <input
                  type="text"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg font-medium text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {verifying ? (
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
              </div>
            </form>
          ) : (
            /* Verification Success Results View */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-base text-emerald-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ✓ Aadhaar Verified (Demo Success)
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/80">
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded border border-emerald-200">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Name Match: <strong>✓ Verified</strong></span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded border border-emerald-200">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>DOB Match: <strong>✓ Verified</strong></span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded border border-emerald-200">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Mobile Linked: <strong>✓ Verified</strong></span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Method: <strong>MOCK / DEMO</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-700 font-mono bg-emerald-100/70 p-2 rounded">
                  Mock Aadhaar Ref: {aadhaarInput.replace(/(\d{4})(\d{4})/, 'XXXX XXXX ')}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg font-medium text-xs shadow"
                >
                  Done & Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
