import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Radio, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UserRole } from '../types';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState<UserRole>('dispatch');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'unit' && !identifier.trim()) {
      toast.error('Please enter a unit number');
      return;
    }

    if (role === 'supervisor') {
      if (password !== 'supervisor') {
        toast.error('Invalid supervisor password');
        return;
      }
    }

    // Perform login
    if (role === 'supervisor') {
      login('supervisor', 'supervisor');
      navigate('/dashboard');
      toast.success('Logged in as Supervisor');
    } else if (role === 'dispatch') {
      login('dispatch', 'dispatch');
      navigate('/dashboard');
      toast.success('Logged in as Dispatcher');
    } else {
      login(identifier, 'unit');
      navigate('/dashboard');
      toast.success(`Logged in as Unit ${identifier}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          {role === 'supervisor' ? (
            <Shield className="h-12 w-12 text-blue-600" />
          ) : (
            <Radio className="h-12 w-12 text-blue-600" />
          )}
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-8">
          CAD System Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="dispatch">Dispatch</option>
              <option value="unit">Unit</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          
          {role === 'unit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit Number
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your unit number"
              />
            </div>
          )}

          {role === 'supervisor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Supervisor Password
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter supervisor password"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Shift
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;