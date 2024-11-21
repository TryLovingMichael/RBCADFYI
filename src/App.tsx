import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import DispatchDashboard from './components/DispatchDashboard';
import UnitDashboard from './components/UnitDashboard';
import BoloDashboard from './components/BoloDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import Header from './components/Header';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function Dashboard() {
  const { role, currentUser } = useAuth();
  
  return (
    <div>
      <Header />
      {role === 'dispatch' ? (
        <DispatchDashboard />
      ) : role === 'supervisor' ? (
        <SupervisorDashboard />
      ) : (
        <UnitDashboard unitNumber={currentUser || ''} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/bolos"
            element={
              <PrivateRoute>
                <div>
                  <Header />
                  <BoloDashboard />
                </div>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;