import React from 'react';
import { X, Bell, Handcuffs, Megaphone } from 'lucide-react';

interface CodesModalProps {
  type: 'signal' | 'penal' | 'radio';
  onClose: () => void;
}

const SIGNAL_CODES = {
  'Code 0': 'Officer needs immediate assistance',
  'Code 1': 'Respond without lights/sirens',
  'Code 2': 'Urgent, no lights/sirens',
  'Code 3': 'Emergency response, lights/sirens',
  'Code 4': 'Scene secure, no further assistance needed',
  'Code 5': 'Stakeout in progress',
  'Code 6': 'Out of vehicle investigating',
  'Code 7': 'Meal break',
};

const PENAL_CODES = {
  '187': 'Murder',
  '211': 'Robbery',
  '240': 'Assault',
  '459': 'Burglary',
  '484': 'Petty Theft',
  '487': 'Grand Theft',
  '502': 'DUI',
  '647': 'Disorderly Conduct',
};

const RADIO_CODES = {
  '10-1': 'Poor Reception',
  '10-4': 'Acknowledgment',
  '10-7': 'Out of Service',
  '10-8': 'In Service',
  '10-9': 'Repeat',
  '10-20': 'Location',
  '10-27': 'License Check',
  '10-31': 'Crime in Progress',
};

export default function CodesModal({ type, onClose }: CodesModalProps) {
  const getTitle = () => {
    switch (type) {
      case 'signal':
        return 'Signal Codes';
      case 'penal':
        return 'Penal Codes';
      case 'radio':
        return 'Radio Codes';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'signal':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'penal':
        return <Handcuffs className="h-5 w-5 text-blue-600" />;
      case 'radio':
        return <Megaphone className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCodes = () => {
    switch (type) {
      case 'signal':
        return SIGNAL_CODES;
      case 'penal':
        return PENAL_CODES;
      case 'radio':
        return RADIO_CODES;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium flex items-center">
            {getIcon()}
            <span className="ml-2">{getTitle()}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(getCodes()).map(([code, description]) => (
            <div
              key={code}
              className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="font-medium">{code}</span>
                <span className="text-sm text-gray-600">{description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}