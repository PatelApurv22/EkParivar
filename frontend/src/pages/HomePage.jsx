import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, UserPlus, Sparkles, FileText, CheckCircle2,
  Users, Layers, Award, ArrowRight, Building2, Lock, EyeOff
} from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="space-y-12 pb-12">
      
      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-medium">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Gujarat Government Beneficiary Management System
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              One Verified Family ID. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400">
                Endless Government Benefits.
              </span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              <strong>EkParivar</strong> creates a unified digital profile for your entire household in Gujarat. 
              Connect all family members under a single <strong>Family ID</strong> to automatically discover eligible government welfare schemes, reduce repeated document submissions, and track benefits in real-time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/create-family"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Create Family ID
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                Login to Portal
              </Link>
            </div>

            {/* Micro badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 text-xs text-slate-400 border-t border-slate-800">
              <div>
                <strong className="block text-white text-sm">Unified ID</strong>
                EKP-YYYYMMDD-XXXX
              </div>
              <div>
                <strong className="block text-white text-sm">Auto Match</strong>
                Rule-based Engine
              </div>
              <div>
                <strong className="block text-white text-sm">Duplicate Check</strong>
                Prevent Overlap
              </div>
            </div>
          </div>

          {/* Right Logo Banner Column */}
          <div className="flex justify-center items-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-amber-400 max-w-sm w-full text-center relative group">
              <img
                src="/logo.png"
                alt="EkParivar Logo"
                className="w-full h-auto object-contain max-h-72 mx-auto rounded-xl"
              />
              <div className="mt-4 pt-4 border-t border-slate-200">
                <span className="text-slate-900 font-extrabold text-sm block">
                  Sabka Vikas Gujarat Ka Parivar
                </span>
                <span className="text-slate-500 text-xs">
                  A Stronger Gujarat Together
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE EXPLANATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            How EkParivar Works
          </h2>
          <p className="text-slate-600 text-xs md:text-sm">
            Bridging citizens and Gujarat state government welfare schemes through smart household identification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: What Family ID is */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 m-0">
              1. What is Family ID?
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Family ID (`EKP-YYYYMMDD-XXXX`) is a unique household identifier issued to every family unit in Gujarat. It links the Head of Family along with all dependent members into a single verified master record.
            </p>
          </div>

          {/* Card 2: How it connects members */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 m-0">
              2. Linking All Family Members
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Connect spouses, students, elderly parents, widowed women, and persons with disabilities under one umbrella. Every member's demographic and special status is stored securely.
            </p>
          </div>

          {/* Card 3: Automated Scheme Discovery */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 m-0">
              3. Automatic Scheme Discovery
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Instead of manually searching dozens of departmental websites, EkParivar automatically evaluates your family income and member profiles against government eligibility rules to highlight unclaimed benefits.
            </p>
          </div>
        </div>
      </section>

      {/* KEY SYSTEM BENEFITS GRID */}
      <section className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              System Advantages
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white m-0">
              Key Benefits for Citizens & Officers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            {/* Benefit 1 */}
            <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 space-y-2">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-lg w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white m-0">Unified Household Profile</h4>
              <p className="text-slate-300 leading-relaxed">
                One master profile containing household address, category, income source, and ration card details.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 space-y-2">
              <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-lg w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white m-0">Fewer Repeated Documents</h4>
              <p className="text-slate-300 leading-relaxed">
                Verified documents like Income and Caste certificates are linked once, eliminating repeated paperwork.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 space-y-2">
              <div className="p-2.5 bg-blue-500 text-white rounded-lg w-fit">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white m-0">Instant Scheme Matching</h4>
              <p className="text-slate-300 leading-relaxed">
                See exact reasons why a member is eligible (e.g., income limits, education score, widow status).
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-slate-800/90 p-5 rounded-xl border border-slate-700 space-y-2">
              <div className="p-2.5 bg-red-500 text-white rounded-lg w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white m-0">Duplicate Benefit Tracking</h4>
              <p className="text-slate-300 leading-relaxed">
                Automatic duplicate detection prevents overlapping scheme payouts across government departments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-3xl p-8 md:p-12 text-slate-950 shadow-xl space-y-6">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight m-0">
            Ready to Connect Your Family ID?
          </h2>
          <p className="text-slate-900 font-medium text-xs md:text-sm max-w-2xl mx-auto">
            Create your new household profile in under 2 minutes or login with your mobile number to view eligible Gujarat government schemes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/create-family"
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              Create Family ID
            </Link>

            <Link
              to="/login"
              className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Portal Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
