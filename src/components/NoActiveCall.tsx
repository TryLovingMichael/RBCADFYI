import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function NoActiveCall() {
  return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Calls</h3>
      <p className="mt-1 text-sm text-gray-500">You're currently available for dispatch.</p>
    </div>
  );
}