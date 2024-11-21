import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Incident } from '../types';
import { INCIDENT_TYPES } from '../constants';

interface EditIncidentModalProps {
  incident: Incident;
  onClose: () => void;
}

export default function EditIncidentModal({ incident, onClose }: EditIncidentModalProps) {
  const [editedIncident, setEditedIncident] = useState({
    type: incident.type,
    location: incident.location,
    description: incident.description,
    priority: incident.priority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      await updateDoc(incidentRef, {
        ...editedIncident,
        updatedAt: serverTimestamp(),
      });
      toast.success('Incident updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update incident');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Incident</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Incident Type
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedIncident.type}
              onChange={(e) => setEditedIncident({ ...editedIncident, type: e.target.value })}
            >
              {INCIDENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
              value={editedIncident.location}
              onChange={(e) => setEditedIncident({ ...editedIncident, location: e.target.value })}
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
              value={editedIncident.description}
              onChange={(e) => setEditedIncident({ ...editedIncident, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={editedIncident.priority}
              onChange={(e) => setEditedIncident({ ...editedIncident, priority: e.target.value as 'high' | 'medium' | 'low' })}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}