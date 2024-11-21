import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Radio, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header() {
  const { logout, role, currentUser, setRole } = useAuth();
  const navigate = useNavigate();
  const [showSupervisorPrompt, setShowSupervisorPrompt] = useState(false);
  const [supervisorPassword, setSupervisorPassword] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleSupervisorSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (supervisorPassword === 'supervisor') {
      setRole('supervisor');
      setShowSupervisorPrompt(false);
      setSupervisorPassword('');
      toast.success('Switched to Supervisor mode');
      navigate('/dashboard');
    } else {
      toast.error('Invalid supervisor password');
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {role === 'supervisor' ? (
              <Shield className="h-8 w-8 text-blue-600" />
            ) : (
              <Radio className="h-8 w-8 text-blue-600" />
            )}
            <div className="text-lg font-semibold">
              {role === 'dispatch' ? 'Dispatch Console' : 
               role === 'supervisor' ? 'Supervisor Console' :
               `Unit ${currentUser}`}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                to="/bolos"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                BOLOs
              </Link>
              {role !== 'supervisor' && (
                <button
                  onClick={() => setShowSupervisorPrompt(true)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Supervisor Mode
                </button>
              )}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              End Shift
            </button>
          </div>
        </div>
      </div>

      {showSupervisorPrompt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Enter Supervisor Mode
              </h3>
              <button
                onClick={() => {
                  setShowSupervisorPrompt(false);
                  setSupervisorPassword('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSupervisorSwitch}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Supervisor Password
                </label>
                <input
                  type="password"
                  value={supervisorPassword}
                  onChange={(e) => setSupervisorPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSupervisorPrompt(false);
                    setSupervisorPassword('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Enter Supervisor Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}