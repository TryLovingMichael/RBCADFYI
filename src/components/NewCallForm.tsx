import React from 'react';
import { Plus } from 'lucide-react';
import { INCIDENT_TYPES } from '../constants';

interface NewCallFormProps {
  showForm: boolean;
  onToggleForm: () => void;
  newIncident: {
    type: string;
    location: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  };
  onSubmit: (e: React.FormEvent) => void;
  onIncidentChange: (incident: typeof newIncident) => void;
}

export default function NewCallForm({ 
  showForm, 
  onToggleForm, 
  newIncident, 
  onSubmit, 
  onIncidentChange 
}: NewCallFormProps) {
  return (
    <>
      <button
        onClick={onToggleForm}
        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Call
      </button>

      {showForm && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Create New Call</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Call Type
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newIncident.type}
                onChange={(e) => onIncidentChange({ ...newIncident, type: e.target.value })}
              >
                <option value="">Select type...</option>
                {INCIDENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newIncident.priority}
                onChange={(e) => onIncidentChange({ ...newIncident, priority: e.target.value as 'high' | 'medium' | 'low' })}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newIncident.location}
                onChange={(e) => onIncidentChange({ ...newIncident, location: e.target.value })}
                placeholder="Street address or intersection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={newIncident.description}
                onChange={(e) => onIncidentChange({ ...newIncident, description: e.target.value })}
                placeholder="Additional details about the call"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onToggleForm}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Call
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}