import React, { useState } from 'react';
import { Shield, AlertTriangle, Radio } from 'lucide-react';
import type { Unit, UnitStatus } from '../types';

interface SupervisorActionsProps {
  onlineUnits: Unit[];
  onForceStatusChange: (unitId: string, status: UnitStatus) => void;
  onAddSupervisorNote: (incidentId: string, note: string) => void;
}

export default function SupervisorActions({
  onlineUnits,
  onForceStatusChange,
  onAddSupervisorNote
}: SupervisorActionsProps) {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [newStatus, setNewStatus] = useState<UnitStatus>('available');

  const handleForceStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUnit && newStatus) {
      onForceStatusChange(selectedUnit, newStatus);
      setSelectedUnit('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium flex items-center mb-2">
            <Shield className="h-4 w-4 mr-2" />
            Force Status Change
          </h3>
          <form onSubmit={handleForceStatus} className="space-y-2">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">Select Unit...</option>
              {onlineUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unitNumber} ({unit.status})
                </option>
              ))}
            </select>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as UnitStatus)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="out_of_service">Out of Service</option>
            </select>
            <button
              type="submit"
              disabled={!selectedUnit}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Force Change
            </button>
          </form>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency Override
          </h3>
          <button
            onClick={() => {
              onlineUnits.forEach(unit => {
                onForceStatusChange(unit.id, 'available');
              });
            }}
            className="w-full px-3 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
          >
            Set All Units Available
          </button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium flex items-center mb-2">
            <Radio className="h-4 w-4 mr-2" />
            Radio Control
          </h3>
          <button
            className="w-full px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            Emergency Broadcast
          </button>
        </div>
      </div>
    </div>
  );
}