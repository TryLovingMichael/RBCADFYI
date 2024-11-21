import React from 'react';
import { Book } from 'lucide-react';

interface TenCode {
  code: string;
  meaning: string;
}

const tenCodes: TenCode[] = [
  { code: '10-1', meaning: 'Signal Weak' },
  { code: '10-2', meaning: 'Signal Good' },
  { code: '10-3', meaning: 'Stop Transmitting' },
  { code: '10-4', meaning: 'Acknowledgement' },
  { code: '10-5', meaning: 'Relay' },
  { code: '10-6', meaning: 'Busy' },
  { code: '10-7', meaning: 'Out of Service' },
  { code: '10-8', meaning: 'In Service' },
  { code: '10-9', meaning: 'Repeat' },
  { code: '10-10', meaning: 'Fight in Progress' },
  { code: '10-11', meaning: 'Dog Case' },
  { code: '10-12', meaning: 'Stand By' },
  { code: '10-13', meaning: 'Weather/Road Report' },
  { code: '10-14', meaning: 'Escort' },
  { code: '10-15', meaning: 'Prisoner in Custody' },
  { code: '10-16', meaning: 'Domestic Problem' },
  { code: '10-17', meaning: 'Meet Complainant' },
  { code: '10-18', meaning: 'Quickly' },
  { code: '10-19', meaning: 'Return to Station' },
  { code: '10-20', meaning: 'Location' }
];

interface TenCodesPanelProps {
  show: boolean;
  onToggle: () => void;
}

export function TenCodesPanel({ show, onToggle }: TenCodesPanelProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <Book className="h-4 w-4 mr-2" />
        10-Codes
      </button>

      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">10-Codes Reference</h3>
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenCodes.map((code) => (
                <div key={code.code} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-semibold text-blue-600">{code.code}</span>
                  <span className="ml-2 text-gray-700">{code.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}