import React, { useState } from 'react';
import { UserPlus, X, ShieldAlert, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { apiService } from '../services/api';

export const AddMemberModal = ({ familyId, isOpen, onClose, onMemberAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    aadhaarNumber: '',
    dob: '',
    gender: 'M',
    relationToHOF: 'Son',
    maritalStatus: 'Single',
    occupation: 'Student',
    monthlyIncome: 0,
    currentlyEnrolled: false,
    currentClassOrCourse: '',
    isDisabled: false,
    disabilityPercent: 0,
    disabilityType: '',
    isWidow: false,
    isPregnantOrLactating: false,
    mobile: '',
    email: ''
  });

  const [educationRecords, setEducationRecords] = useState([
    { level: 'Class 10', percentage: '', yearOfPassing: '', boardOrUniversity: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddEducationRow = () => {
    setEducationRecords(prev => [
      ...prev,
      { level: 'Class 12', percentage: '', yearOfPassing: '', boardOrUniversity: '' }
    ]);
  };

  const handleRemoveEducationRow = (index) => {
    setEducationRecords(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleEducationRecordChange = (index, field, value) => {
    setEducationRecords(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dob) {
      setError('Please provide Name and Date of Birth.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processedEducation = educationRecords
        .filter(r => r.level && r.percentage !== '')
        .map(r => ({
          level: r.level,
          percentage: Number(r.percentage) || 0,
          yearOfPassing: r.yearOfPassing ? Number(r.yearOfPassing) : undefined,
          boardOrUniversity: r.boardOrUniversity || ''
        }));

      const payload = {
        ...formData,
        monthlyIncome: Number(formData.monthlyIncome) || 0,
        educationRecords: processedEducation,
        disabilityPercent: formData.isDisabled ? (Number(formData.disabilityPercent) || 0) : 0,
        isSeniorCitizen: false
      };

      const res = await apiService.addMember(familyId, payload);
      setLoading(false);
      if (res.success) {
        onMemberAdded(res.member);
        onClose();
      } else {
        setError(res.message || 'Failed to add member.');
      }
    } catch (err) {
      setLoading(false);
      setError('Error adding member. Please check fields.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold m-0">Add New Family Member</h3>
              <p className="text-xs text-amber-400 font-medium m-0">Linking to Family ID: {familyId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              Government Officer Approval Required
            </div>
            <p className="text-[11px] text-amber-800 m-0 leading-relaxed">
              Newly added family members require verification & approval from the designated Government Officer before scheme eligibility is unlocked for them.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priyaben Patel"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="M">Male (M)</option>
                <option value="F">Female (F)</option>
                <option value="O">Other (O)</option>
              </select>
            </div>

            {/* Relation to HOF */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Relation to Head of Family</label>
              <select
                name="relationToHOF"
                value={formData.relationToHOF}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Spouse">Spouse</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Daughter-in-law">Daughter-in-law</option>
                <option value="Grandson">Grandson</option>
                <option value="Granddaughter">Granddaughter</option>
                <option value="Other">Other Relative</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widow">Widow</option>
                <option value="Widower">Widower</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>

            {/* Aadhaar Number */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Aadhaar Number (12 Digits)</label>
              <input
                type="text"
                name="aadhaarNumber"
                maxLength="12"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="453289011234"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Student, Farmer, Homemaker"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Monthly Income */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Monthly Income (₹)</label>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="priya@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* REPEATABLE EDUCATION RECORDS SECTION */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-800 font-bold text-xs m-0">Academic History / Education Records (Optional)</label>
                <p className="text-[11px] text-slate-500 m-0">Add one or multiple academic records to evaluate scholarship and post-matric schemes.</p>
              </div>
              <button
                type="button"
                onClick={handleAddEducationRow}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                + Add Education Record
              </button>
            </div>

            {educationRecords.length === 0 ? (
              <p className="text-slate-400 text-xs italic m-0 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                No education records added. Click "+ Add Education Record" to add academic scores.
              </p>
            ) : (
              <div className="space-y-2">
                {educationRecords.map((rec, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
                    <div className="flex-1 min-w-[130px]">
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Education Level</span>
                      <select
                        value={rec.level}
                        onChange={(e) => handleEducationRecordChange(idx, 'level', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                      >
                        {['Class 8', 'Class 10', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD'].map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Percentage (%)</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={rec.percentage}
                        onChange={(e) => handleEducationRecordChange(idx, 'percentage', e.target.value)}
                        placeholder="e.g. 85"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>

                    <div className="w-24">
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Passing Year</span>
                      <input
                        type="number"
                        value={rec.yearOfPassing}
                        onChange={(e) => handleEducationRecordChange(idx, 'yearOfPassing', e.target.value)}
                        placeholder="e.g. 2022"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                      />
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Board / University</span>
                      <input
                        type="text"
                        value={rec.boardOrUniversity}
                        onChange={(e) => handleEducationRecordChange(idx, 'boardOrUniversity', e.target.value)}
                        placeholder="e.g. GSEB / GTU"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEducationRow(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition self-end mb-0.5"
                      title="Remove record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHECKBOXES FOR SPECIAL CATEGORIES */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs m-0">Special Status & Enrollments</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  name="currentlyEnrolled"
                  checked={formData.currentlyEnrolled}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Currently Enrolled in School/College</span>
              </label>

              {formData.currentlyEnrolled && (
                <input
                  type="text"
                  name="currentClassOrCourse"
                  value={formData.currentClassOrCourse}
                  onChange={handleChange}
                  placeholder="Current Class/Course (e.g. B.Tech 2nd Year)"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              )}

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  name="isDisabled"
                  checked={formData.isDisabled}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Person with Disability (Divyangjan)</span>
              </label>

              {formData.isDisabled && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="disabilityPercent"
                    value={formData.disabilityPercent}
                    onChange={handleChange}
                    placeholder="Disability %"
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    name="disabilityType"
                    value={formData.disabilityType}
                    onChange={handleChange}
                    placeholder="Disability Type"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              )}

              {formData.gender === 'F' && (
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    name="isPregnantOrLactating"
                    checked={formData.isPregnantOrLactating}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">Pregnant / Lactating Mother</span>
                </label>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs shadow transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Submitting Request...' : 'Submit for Officer Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
