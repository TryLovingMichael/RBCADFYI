import React from 'react';
import { AlertTriangle, Clock, MapPin, Car, User, Package } from 'lucide-react';
import type { Bolo } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface BoloListProps {
  bolos: Bolo[];
  onEdit: (bolo: Bolo) => void;
  onResolve: (boloId: string) => void;
}

export default function BoloList({ bolos, onEdit, onResolve }: BoloListProps) {

  const getBoloIcon = (type: Bolo['type']) => {
    switch (type) {
      case 'vehicle':
        return <Car className="h-5 w-5" />;
      case 'person':
        return <User className="h-5 w-5" />;
      case 'property':
        return <Package className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: Bolo['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {bolos.map((bolo) => (
        <div
          key={bolo.id}
          className={`p-4 rounded-lg border ${
            bolo.status === 'expired'
              ? 'border-gray-200 bg-gray-50'
              : 'border-blue-200 bg-blue-50'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              {getBoloIcon(bolo.type)}
              <h3 className="text-lg font-semibold">{bolo.title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bolo.priority)}`}>
                {bolo.priority.toUpperCase()}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {bolo.type.toUpperCase()}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2">{bolo.description}</p>

          {bolo.location && (
            <p className="flex items-center text-sm text-gray-600 mb-1">
              <MapPin className="w-4 h-4 mr-1" />
              {bolo.location}
            </p>
          )}

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4 mr-1" />
            Expires {formatDistanceToNow(bolo.expiresAt.toDate(), { addSuffix: true })}
          </div>

          {bolo.type === 'vehicle' && bolo.vehicleDetails && (
            <div className="bg-white p-2 rounded mb-2 text-sm">
              <p><strong>Vehicle:</strong> {bolo.vehicleDetails.year} {bolo.vehicleDetails.make} {bolo.vehicleDetails.model}</p>
              {bolo.vehicleDetails.licensePlate && (
                <p><strong>License:</strong> {bolo.vehicleDetails.licensePlate} ({bolo.vehicleDetails.state})</p>
              )}
              {bolo.vehicleDetails.color && <p><strong>Color:</strong> {bolo.vehicleDetails.color}</p>}
            </div>
          )}

          {bolo.type === 'person' && bolo.personDetails && (
            <div className="bg-white p-2 rounded mb-2 text-sm">
              {bolo.personDetails.name && <p><strong>Name:</strong> {bolo.personDetails.name}</p>}
              <p>
                <strong>Description:</strong> {bolo.personDetails.race} {bolo.personDetails.sex}, 
                {bolo.personDetails.age && ` ${bolo.personDetails.age},`}
                {bolo.personDetails.height && ` ${bolo.personDetails.height},`}
                {bolo.personDetails.weight && ` ${bolo.personDetails.weight}`}
              </p>
              {bolo.personDetails.clothing && <p><strong>Clothing:</strong> {bolo.personDetails.clothing}</p>}
              {bolo.personDetails.armed && (
                <p className="text-red-600 font-semibold mt-1">⚠️ ARMED AND DANGEROUS</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => onEdit(bolo)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Edit
            </button>
            {bolo.status === 'active' && (
              <button
                onClick={() => onResolve(bolo.id)}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      ))}

      {bolos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No active BOLOs at this time
        </div>
      )}
    </div>
  );
}