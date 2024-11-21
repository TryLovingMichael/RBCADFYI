import React from 'react';
import type { UnitStatus } from '../types';

interface UnitStatusSelectProps {
  status: UnitStatus;
  onChange: (status: UnitStatus) => void;
}

export default function UnitStatusSelect({ status, onChange }: UnitStatusSelectProps) {
  const getStatusColor = (currentStatus: UnitStatus) => {
    switch (currentStatus) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'panic':
        return 'bg-red-100 text-red-800 animate-pulse';
      case 'out_of_service':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as UnitStatus)}
      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}
    >
      <option value="available">Available</option>
      <option value="busy">Busy</option>
      <option value="out_of_service">Out of Service</option>
      <option value="panic">PANIC</option>
    </select>
  );
}