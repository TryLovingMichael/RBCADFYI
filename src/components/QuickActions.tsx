import React from 'react';
import { Shield, Car, Coffee } from 'lucide-react';

type QuickAction = 'backup' | 'traffic' | 'break';

interface QuickActionsProps {
  onAction: (action: QuickAction) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <button
        onClick={() => onAction('backup')}
        className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
      >
        <Shield className="h-6 w-6 text-red-600 mb-2" />
        <span className="text-sm font-medium text-red-700">Request Backup</span>
      </button>
      
      <button
        onClick={() => onAction('traffic')}
        className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Car className="h-6 w-6 text-blue-600 mb-2" />
        <span className="text-sm font-medium text-blue-700">Traffic Stop</span>
      </button>
      
      <button
        onClick={() => onAction('break')}
        className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
      >
        <Coffee className="h-6 w-6 text-green-600 mb-2" />
        <span className="text-sm font-medium text-green-700">Request Break</span>
      </button>
    </div>
  );
}