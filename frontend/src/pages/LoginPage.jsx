import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Smartphone, KeyRound, AlertCircle, UserPlus, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('family'); // 'family' | 'officer'
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit mock OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiService.login(role, mobile, otp);
      setLoading(false);
      if (res.success) {
        // Store JWT token + identity in AuthContext
        login(role, mobile, res.familyId, res.token);
        if (role === 'family') {
          navigate('/family-dashboard');
        } else {
          navigate('/officer-dashboard');
        }
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection error. Please try again.');
    }
  };

  // Demo accounts helper: ONLY fills the mobile number (no dropdown selection!)
  const fillMobile = (presetRole, presetMobile) => {
    setRole(presetRole);
    setMobile(presetMobile);
    setOtp('123456');
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 flex items-center justify-center p-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-4">
        
        {/* Top Header Banner with New Logo */}
        <div className="bg-slate-900 text-white p-6 text-center relative space-y-2">
          <img
            src="/logo.png"
            alt="EkParivar Logo"
            className="w-16 h-16 bg-white p-1 rounded-xl mx-auto border-2 border-amber-400 object-contain shadow-md"
          />
          <h2 className="text-2xl font-black tracking-tight text-white m-0">EkParivar</h2>
          <p className="text-xs text-amber-400 font-medium">
            Gujarat Government Beneficiary Portal
          </p>
          <div className="inline-block bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-[11px] text-slate-300">
            Citizens & Officers Sign-in
          </div>
        </div>

        {/* Role Toggle Selector */}
        <div className="p-6 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => fillMobile('family', '9876543210')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'family'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Family / Citizen Login
            </button>

            <button
              type="button"
              onClick={() => fillMobile('officer', '9988776655')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                role === 'officer'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Government Officer
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                Mobile Number *
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit registered mobile"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {role === 'family' ? 'Family ID will be automatically resolved from your mobile number.' : 'Enter registered officer mobile number.'}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                6-Digit OTP (Simulated Mock) *
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 123456"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg font-mono text-base tracking-widest text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                * DEMO MODE: Any valid 6-digit code will be accepted.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                role === 'family'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {loading ? 'Authenticating...' : `Login as ${role === 'family' ? 'Citizen / Family' : 'Officer'}`}
            </button>
          </form>

          {/* Quick Demo Mobile Presets - ONLY fills mobile input! */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Mobile Presets (Click to autofill mobile):
            </span>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillMobile('family', '9876543210')}
                className="w-full bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-2 rounded-lg text-left text-slate-800 flex items-center justify-between"
              >
                <div>
                  <strong className="block text-slate-900 text-xs">Rameshchandra Patel (HOF)</strong>
                  <span className="text-slate-500 text-[10px]">Mobile: 9876543210</span>
                </div>
                <span className="text-amber-700 font-semibold text-[10px]">Fill Mobile →</span>
              </button>

              <button
                type="button"
                onClick={() => fillMobile('family', '9825012345')}
                className="w-full bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-2 rounded-lg text-left text-slate-800 flex items-center justify-between"
              >
                <div>
                  <strong className="block text-slate-900 text-xs">Savitaben Solanki (Widow HOF)</strong>
                  <span className="text-slate-500 text-[10px]">Mobile: 9825012345</span>
                </div>
                <span className="text-amber-700 font-semibold text-[10px]">Fill Mobile →</span>
              </button>

              <button
                type="button"
                onClick={() => fillMobile('officer', '9988776655')}
                className="w-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-2 rounded-lg text-left text-slate-800 flex items-center justify-between"
              >
                <div>
                  <strong className="block text-slate-900 text-xs">Government Officer Portal</strong>
                  <span className="text-slate-500 text-[10px]">Mobile: 9988776655</span>
                </div>
                <span className="text-emerald-700 font-semibold text-[10px]">Fill Mobile →</span>
              </button>
            </div>
          </div>

          {/* Prompt to create new Family ID */}
          <div className="pt-2 text-center text-xs text-slate-600">
            Don't have a Family ID yet?{' '}
            <Link to="/create-family" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
              Create Family ID
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
