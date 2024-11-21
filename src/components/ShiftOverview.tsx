import React from 'react';
import { Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import type { Unit, Incident } from '../types';

interface ShiftOverviewProps {
  units: Unit[];
  incidents: Incident[];
}

export default function ShiftOverview({ units, incidents }: ShiftOverviewProps) {
  const currentShift = new Date().getHours() >= 18 ? 'night' : new Date().getHours() >= 10 ? 'day' : 'swing';
  
  const shiftStats = {
    totalUnits: units.length,
    availableUnits: units.filter(u => u.status === 'available').length,
    busyUnits: units.filter(u => u.status === 'busy').length,
    outOfService: units.filter(u => u.status === 'out_of_service').length,
    activeIncidents: incidents.filter(i => i.status === 'dispatched').length,
    resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
    pendingIncidents: incidents.filter(i => i.status === 'pending').length
  };

  return (
    <div className="mt-6">
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-700">Current Shift Overview</h3>
            <p className="text-sm text-blue-600">
              {currentShift === 'day' ? 'Day Shift (0600-1800)' :
               currentShift === 'night' ? 'Night Shift (1800-0600)' :
               'Swing Shift (1000-2200)'}
            </p>
          </div>
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Unit Status
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Units</span>
              <span className="text-lg font-bold">{shiftStats.totalUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">Available</span>
              <span className="text-lg font-bold text-green-600">{shiftStats.availableUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-600">Busy</span>
              <span className="text-lg font-bold text-yellow-600">{shiftStats.busyUnits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Out of Service</span>
              <span className="text-lg font-bold text-gray-600">{shiftStats.outOfService}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
            Incident Status
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-600">Active</span>
              <span className="text-lg font-bold text-yellow-600">{shiftStats.activeIncidents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-red-600">Pending</span>
              <span className="text-lg font-bold text-red-600">{shiftStats.pendingIncidents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">Resolved</span>
              <span className="text-lg font-bold text-green-600">{shiftStats.resolvedIncidents}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4">Unit Availability Timeline</h4>
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-green-500"
            style={{ width: `${(shiftStats.availableUnits / shiftStats.totalUnits) * 100}%` }}
          />
          <div 
            className="absolute h-full bg-yellow-500"
            style={{ 
              left: `${(shiftStats.availableUnits / shiftStats.totalUnits) * 100}%`,
              width: `${(shiftStats.busyUnits / shiftStats.totalUnits) * 100}%` 
            }}
          />
          <div 
            className="absolute h-full bg-gray-500"
            style={{ 
              left: `${((shiftStats.availableUnits + shiftStats.busyUnits) / shiftStats.totalUnits) * 100}%`,
              width: `${(shiftStats.outOfService / shiftStats.totalUnits) * 100}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-green-600">Available ({shiftStats.availableUnits})</span>
          <span className="text-yellow-600">Busy ({shiftStats.busyUnits})</span>
          <span className="text-gray-600">Out of Service ({shiftStats.outOfService})</span>
        </div>
      </div>
    </div>
  );
}