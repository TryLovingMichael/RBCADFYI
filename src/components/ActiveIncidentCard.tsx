import React, { useState } from 'react';
import { Clock, MapPin, MessageSquare } from 'lucide-react';
import type { Incident } from '../types';
import IncidentNotes from './IncidentNotes';

interface ActiveIncidentCardProps {
  incident: Incident;
  unitNumber: string;
  onEdit: () => void;
  onComplete: () => void;
}

export default function ActiveIncidentCard({ 
  incident, 
  unitNumber, 
  onEdit, 
  onComplete 
}: ActiveIncidentCardProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className={`p-4 rounded-lg border ${
      incident.priority === 'high'
        ? 'border-red-200 bg-red-50'
        : incident.priority === 'medium'
        ? 'border-yellow-200 bg-yellow-50'
        : 'border-green-200 bg-green-50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">{incident.type}</h3>
          {incident.codeRed && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
              CODE RED
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit Incident"
          >
            <span className="sr-only">Edit</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {incident.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {incident.location}
        </p>
        <p className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {incident.timestamp?.toDate().toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">{incident.description}</p>

        <div className="mt-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Notes ({incident.notes?.length || 0})
          </button>
          
          {showNotes && (
            <IncidentNotes incident={incident} unitNumber={unitNumber} />
          )}
        </div>

        <button
          onClick={onComplete}
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Complete Call
        </button>
      </div>
    </div>
  );
}