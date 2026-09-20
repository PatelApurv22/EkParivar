import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem('ekparivar_role') || null);
  const [mobile, setMobile] = useState(() => localStorage.getItem('ekparivar_mobile') || null);
  const [familyId, setFamilyId] = useState(() => localStorage.getItem('ekparivar_familyId') || null);
  const [token, setToken] = useState(() => localStorage.getItem('ekparivar_token') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('ekparivar_token'));

  // Keep localStorage in sync whenever state changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('ekparivar_token', token);
      localStorage.setItem('ekparivar_role', role || '');
      localStorage.setItem('ekparivar_mobile', mobile || '');
      localStorage.setItem('ekparivar_familyId', familyId || '');
    } else {
      localStorage.removeItem('ekparivar_token');
      localStorage.removeItem('ekparivar_role');
      localStorage.removeItem('ekparivar_mobile');
      localStorage.removeItem('ekparivar_familyId');
    }
  }, [token, role, mobile, familyId]);

  /**
   * Call after a successful /api/auth/login response.
   * @param {string} selectedRole   - 'family' | 'officer'
   * @param {string} enteredMobile  - mobile number used to login
   * @param {string|null} selectedFamilyId - familyId returned from backend (null for officers)
   * @param {string} jwtToken       - JWT returned from backend
   */
  const login = (selectedRole, enteredMobile, selectedFamilyId, jwtToken) => {
    setRole(selectedRole);
    setMobile(enteredMobile);
    setFamilyId(selectedFamilyId || null);
    setToken(jwtToken || null);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setRole(null);
    setMobile(null);
    setFamilyId(null);
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{
      role,
      setRole,
      mobile,
      setMobile,
      familyId,
      setFamilyId,
      token,
      isLoggedIn,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
