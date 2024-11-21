import React from 'react';
import { Shield, AlertTriangle, LogOut } from 'lucide-react';
import type { Unit, Incident } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface OnlineUnitsProps {
  units: Unit[];
  incidents: Incident[];
  isSupervisor?: boolean;
  onUnitSelect?: (unitId: string) => void;
}

export default function OnlineUnits({ 
  units, 
  incidents,
  isSupervisor,
  onUnitSelect 
}: OnlineUnitsProps) {
  const { role } = useAuth();
  const isDispatch = role === 'dispatch';

  const getUnitIncidents = (unitId: string) => {
    return incidents.filter(
      incident => 
        incident.status === 'dispatched' && 
        incident.assignedUnits?.includes(unitId)
    );
  };

  const getStatusColor = (status: Unit['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service':
        return 'bg-gray-100 text-gray-800';
      case 'panic':
        return 'bg-red-100 text-red-800 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleKickUnit = async (unit: Unit) => {
    if (!isDispatch) return;

    try {
      const unitRef = doc(db, 'units', unit.unitNumber);
      await updateDoc(unitRef, {
        status: 'offline',
        lastUpdated: Timestamp.now(),
        kickedBy: 'dispatch',
        kickedAt: Timestamp.now()
      });
      toast.success(`Unit ${unit.unitNumber} has been kicked`);
    } catch (error) {
      console.error('Error kicking unit:', error);
      toast.error('Failed to kick unit');
    }
  };

  return (
    <div className="space-y-4">
      {units.map((unit) => {
        const activeIncidents = getUnitIncidents(unit.unitNumber);
        
        return (
          <div 
            key={unit.unitNumber} 
            className="border rounded-lg p-4"
            onClick={() => onUnitSelect && onUnitSelect(unit.unitNumber)}
            role={onUnitSelect ? "button" : undefined}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Unit {unit.unitNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                  {unit.status === 'out_of_service' ? 'OOS' : unit.status.toUpperCase()}
                </span>
                {isDispatch && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleKickUnit(unit);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Kick unit"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {unit.status === 'panic' && (
              <div className="flex items-center text-red-600 mb-2">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">PANIC ALERT</span>
              </div>
            )}

            {activeIncidents.length > 0 ? (
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-500 mb-1">Active Calls:</div>
                {activeIncidents.map(incident => (
                  <div key={incident.id} className="text-sm bg-gray-50 p-2 rounded">
                    <div className="font-medium">{incident.type}</div>
                    <div className="text-gray-600">{incident.location}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No active calls</div>
            )}

            <div className="text-xs text-gray-400 mt-2">
              Last updated: {unit.lastUpdated?.toDate().toLocaleString()}
            </div>
          </div>
        );
      })}

      {units.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No units currently online
        </div>
      )}
    </div>
  );
}