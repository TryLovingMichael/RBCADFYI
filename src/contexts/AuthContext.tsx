import React, { createContext, useContext, useState } from 'react';
import type { UserRole } from '../types';

interface AuthContextType {
  currentUser: string | null;
  role: UserRole;
  login: (identifier: string, role: UserRole, password?: string) => boolean;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('dispatch');

  const login = (identifier: string, userRole: UserRole, password?: string): boolean => {
    // Check for supervisor password
    if (userRole === 'supervisor') {
      if (password !== 'supervisor') {
        return false;
      }
    }

    setCurrentUser(identifier);
    setRole(userRole);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('dispatch');
  };

  const value = {
    currentUser,
    role,
    login,
    logout,
    setRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;