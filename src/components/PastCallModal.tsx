import React from 'react';
import { X, Clock, MapPin, AlertTriangle } from 'lucide-react';
import type { Incident } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface PastCallsModalProps {
  calls: Incident[];
  onClose: () => void;
}

export default function PastCallsModal({ calls, onClose }: PastCallsModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Past 5 Calls</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {calls.map((call) => (
            <div
              key={call.id}
              className={`p-4 rounded-lg border ${
                call.priority === 'high'
                  ? 'border-red-200 bg-red-50'
                  : call.priority === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{call.type}</h4>
                  {call.codeRed && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                      CODE RED
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(call.timestamp.toDate(), { addSuffix: true })}
                </span>
              </div>

              <div className="space-y-2">
                <p className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {call.location}
                </p>
                <p className="text-sm text-gray-600">{call.description}</p>

                {call.notes && call.notes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-gray-700">Notes:</p>
                    {call.notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-2 rounded text-sm ${
                          note.type === 'supervisor'
                            ? 'bg-blue-50'
                            : note.type === 'panic'
                            ? 'bg-red-50'
                            : 'bg-gray-50'
                        }`}
                      >
                        <p className="text-sm">{note.text}</p>
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                          <span>{note.author}</span>
                          <span>{note.timestamp.toDate().toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {calls.length === 0 && (
            <p className="text-center text-gray-500 py-4">No past calls found</p>
          )}
        </div>
      </div>
    </div>
  );
}