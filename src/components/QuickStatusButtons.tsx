import React from 'react';
import type { UnitStatus } from '../types';

interface QuickStatusButtonsProps {
  currentStatus: UnitStatus;
  onStatusChange: (status: UnitStatus) => void;
}

export function QuickStatusButtons({ currentStatus, onStatusChange }: QuickStatusButtonsProps) {
  const statusButtons = [
    { status: '10-8' as UnitStatus, color: 'green' },
    { status: '10-7' as UnitStatus, color: 'red' },
    { status: '10-6' as UnitStatus, color: 'yellow' }
  ];

  return (
    <div className="flex space-x-2">
      {statusButtons.map(({ status, color }) => (
        <button
          key={status}
          onClick={() => onStatusChange(status)}
          className={`px-3 py-1 rounded ${
            currentStatus === status
              ? `bg-${color}-600 text-white`
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}