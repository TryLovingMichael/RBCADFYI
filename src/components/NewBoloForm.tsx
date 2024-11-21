import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Bolo, BoloType, Priority } from '../types';
import { addDays } from 'date-fns';

interface NewBoloFormProps {
  onSubmit: (bolo: Partial<Bolo>) => Promise<void>;
  onClose: () => void;
}

export default function NewBoloForm({ onSubmit, onClose }: NewBoloFormProps) {
  const [boloData, setBoloData] = useState<Partial<Bolo>>({
    type: 'person',
    priority: 'medium',
    title: '',
    description: '',
    location: '',
    vehicleDetails: {},
    personDetails: {},
    propertyDetails: {},
    expiresAt: addDays(new Date(), 7), // Default expiry of 7 days
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(boloData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create New BOLO</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={boloData.type}
                onChange={(e) => setBoloData({ ...boloData, type: e.target.value as BoloType })}
              >
                <option value="person">Person</option>
                <option value="vehicle">Vehicle</option>
                <option value="property">Property</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={boloData.priority}
                onChange={(e) => setBoloData({ ...boloData, priority: e.target.value as Priority })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={boloData.title}
              onChange={(e) => setBoloData({ ...boloData, title: e.target.value })}
              placeholder="Brief title for the BOLO"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={boloData.description}
              onChange={(e) => setBoloData({ ...boloData, description: e.target.value })}
              placeholder="Detailed description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Known Location</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={boloData.location}
              onChange={(e) => setBoloData({ ...boloData, location: e.target.value })}
              placeholder="Last known location or area"
            />
          </div>

          {boloData.type === 'vehicle' && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Make</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.vehicleDetails?.make || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      vehicleDetails: { ...boloData.vehicleDetails, make: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.vehicleDetails?.model || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      vehicleDetails: { ...boloData.vehicleDetails, model: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Plate</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.vehicleDetails?.licensePlate || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      vehicleDetails: { ...boloData.vehicleDetails, licensePlate: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.vehicleDetails?.color || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      vehicleDetails: { ...boloData.vehicleDetails, color: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {boloData.type === 'person' && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Person Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.personDetails?.name || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      personDetails: { ...boloData.personDetails, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.personDetails?.age || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      personDetails: { ...boloData.personDetails, age: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.personDetails?.height || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      personDetails: { ...boloData.personDetails, height: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.personDetails?.weight || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      personDetails: { ...boloData.personDetails, weight: e.target.value }
                    })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Clothing Description</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={boloData.personDetails?.clothing || ''}
                    onChange={(e) => setBoloData({
                      ...boloData,
                      personDetails: { ...boloData.personDetails, clothing: e.target.value }
                    })}
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      checked={boloData.personDetails?.armed || false}
                      onChange={(e) => setBoloData({
                        ...boloData,
                        personDetails: { ...boloData.personDetails, armed: e.target.checked }
                      })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Armed</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      checked={boloData.personDetails?.dangerous || false}
                      onChange={(e) => setBoloData({
                        ...boloData,
                        personDetails: { ...boloData.personDetails, dangerous: e.target.checked }
                      })}
                    />
                    <span className="ml-2 text-sm text-gray-700">Dangerous</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create BOLO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}