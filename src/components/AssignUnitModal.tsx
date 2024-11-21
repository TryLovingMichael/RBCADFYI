import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface AssignUnitModalProps {
  incidentId: string;
  availableUnits: string[];
  onClose: () => void;
}

export default function AssignUnitModal({ incidentId, availableUnits, onClose }: AssignUnitModalProps) {
  const [unitNumber, setUnitNumber] = useState('');

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNumber.trim()) return;

    try {
      const timestamp = Timestamp.now();
      const incidentRef = doc(db, 'incidents', incidentId);
      await updateDoc(incidentRef, {
        assignedUnits: arrayUnion(unitNumber),
        status: 'dispatched',
        updatedAt: timestamp
      });
      
      // Update unit status to busy
      const unitRef = doc(db, 'units', unitNumber);
      await updateDoc(unitRef, {
        status: 'busy',
        lastUpdated: timestamp
      });

      toast.success(`Unit ${unitNumber} assigned successfully`);
      onClose();
    } catch (error) {
      toast.error('Failed to assign unit');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Assign Unit</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleAssign}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Units
            </label>
            <div className="space-y-2">
              {availableUnits.map(unit => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setUnitNumber(unit)}
                  className={`w-full flex items-center px-4 py-2 rounded-md ${
                    unitNumber === unit
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  } border hover:bg-gray-100`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Unit {unit}
                </button>
              ))}
            </div>
            {availableUnits.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                No available units
              </p>
            )}
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
              disabled={!unitNumber || availableUnits.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}