import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { CreateFamilyPage } from './pages/CreateFamilyPage';
import { LoginPage } from './pages/LoginPage';
import { FamilyDashboard } from './pages/FamilyDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { SchemeListPage } from './pages/SchemeListPage';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'family' ? '/family-dashboard' : '/officer-dashboard'} replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header />
      <main className="flex-1 pb-12">
        {children}
      </main>
      
      {/* Official Government Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <strong className="text-white">EkParivar Gujarat Hackathon Prototype</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Designed for integration with authorized identity and government service APIs.
            </p>
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            DEMO MODE: Aadhaar and OTP verification are simulated using mock data.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-family" element={<CreateFamilyPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/family-dashboard"
              element={
                <ProtectedRoute allowedRole="family">
                  <FamilyDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/officer-dashboard"
              element={
                <ProtectedRoute allowedRole="officer">
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/schemes"
              element={<SchemeListPage />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
