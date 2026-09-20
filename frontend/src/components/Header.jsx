import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, ShieldAlert, LogOut, FileText, LayoutDashboard, Home, UserPlus } from 'lucide-react';

export const Header = () => {
  const { role, mobile, familyId, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-slate-900 text-white shadow-md border-b border-slate-700">
      {/* Top Banner - Mandatory Demo Disclaimer */}
      <div className="bg-amber-500 text-slate-950 font-medium py-1.5 px-4 text-xs md:text-sm flex items-center justify-center gap-2 text-center shadow-inner">
        <ShieldAlert className="w-4 h-4 shrink-0 text-slate-950" />
        <span>
          <strong>DEMO MODE:</strong> Aadhaar and OTP verification are simulated using mock data.
        </span>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Emblem & Portal Title with new EkParivar Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="EkParivar Logo"
            className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-amber-400 shadow-md group-hover:scale-105 transition transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white m-0 flex items-center gap-2">
                EkParivar
                <span className="text-xs font-normal text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  GUJARAT
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-300 font-light">
              One Family • Many Opportunities | Gujarat Government
            </p>
          </div>
        </Link>

        {/* User Session Info & Navigation CTAs */}
        <div className="flex items-center gap-3">
          {!isLoggedIn && (
            <div className="flex items-center gap-2">
              <Link
                to="/create-family"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-md shadow transition flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Family ID
              </Link>

              <Link
                to="/login"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-md shadow transition"
              >
                Portal Login
              </Link>
            </div>
          )}

          {isLoggedIn && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 bg-slate-800/90 px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                  {role === 'officer' ? (
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Role: <strong className="capitalize text-white">{role}</strong></span>
                </div>
                <span className="text-slate-500">|</span>
                {role === 'family' ? (
                  <span className="text-slate-300">Family ID: <strong className="text-white font-mono">{familyId}</strong></span>
                ) : (
                  <span className="text-slate-300">Officer Mobile: <strong className="text-white font-mono">{mobile}</strong></span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded transition shadow"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <nav className="bg-slate-800 border-t border-slate-700/80 text-xs md:text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition ${
              location.pathname === '/'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          {isLoggedIn && role === 'family' && (
            <Link
              to="/family-dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition ${
                location.pathname === '/family-dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Family Dashboard
            </Link>
          )}

          {isLoggedIn && role === 'officer' && (
            <Link
              to="/officer-dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition ${
                location.pathname === '/officer-dashboard'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Officer Dashboard
            </Link>
          )}

          <Link
            to="/schemes"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition ${
              location.pathname === '/schemes'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            All Government Schemes
          </Link>

          {!(isLoggedIn && role === 'family') && (
            <Link
              to="/create-family"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium transition ${
                location.pathname === '/create-family'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Family ID
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
