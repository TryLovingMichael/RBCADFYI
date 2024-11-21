import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, arrayUnion, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Users, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Incident, Unit } from '../types';
import IncidentCard from './IncidentCard';
import AssignUnitModal from './AssignUnitModal';
import { INCIDENT_TYPES } from '../constants';
import OnlineUnits from './OnlineUnits';
import RadioChannels from './RadioChannels';
import WeatherWidget from './WeatherWidget';

const STATUS_ORDER = {
  panic: 0,
  busy: 1,
  available: 2,
  out_of_service: 3,
  offline: 4
};

export default function DispatchDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [onlineUnits, setOnlineUnits] = useState<Unit[]>([]);
  const [newIncident, setNewIncident] = useState<{
    type: string;
    location: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>({
    type: '',
    location: '',
    description: '',
    priority: 'medium',
  });
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeIncidents = onSnapshot(incidentsQuery, (snapshot) => {
      const incidentData: Incident[] = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp || Timestamp.now()
        } as Incident));
      setIncidents(incidentData);
    });

    const unitsQuery = query(
      collection(db, 'units'),
      where('status', '!=', 'offline'),
      orderBy('status'),
      orderBy('lastUpdated', 'desc')
    );
    
    const unsubscribeUnits = onSnapshot(unitsQuery, (snapshot) => {
      const units = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Unit))
      .sort((a, b) => {
        const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDiff !== 0) return statusDiff;
        const timeA = a.lastUpdated?.toMillis() ?? 0;
        const timeB = b.lastUpdated?.toMillis() ?? 0;
        return timeB - timeA;
      });
      setOnlineUnits(units);
    });

    return () => {
      unsubscribeIncidents();
      unsubscribeUnits();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const timestamp = Timestamp.now();
      await addDoc(collection(db, 'incidents'), {
        ...newIncident,
        status: 'pending',
        timestamp,
        dispatcherId: currentUser,
        assignedUnits: [],
        notes: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        codeRed: false,
        respondingCode: 2,
        panicStatus: false,
        backupRequested: false
      });
      setNewIncident({
        type: '',
        location: '',
        description: '',
        priority: 'medium',
      });
      toast.success('Incident created successfully');
    } catch (error) {
      toast.error('Failed to create incident');
    }
  };

  // Sort incidents by timestamp before filtering
  const sortedIncidents = [...incidents].sort((a, b) => {
    const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
    const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
    return timeB - timeA;
  });

  const pendingIncidents = sortedIncidents.filter(i => i.status === 'pending');
  const activeIncidents = sortedIncidents.filter(i => i.status === 'dispatched');
  const resolvedIncidents = sortedIncidents.filter(i => i.status === 'resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <AlertCircle className="mr-2" />
                New Incident
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Incident Type
                  </label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    {INCIDENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newIncident.location}
                    onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                    placeholder="Enter exact location or cross streets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Detailed description of the incident"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newIncident.priority}
                    onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Incident
                </button>
              </form>
            </div>

            <div className="space-y-6">
              {pendingIncidents.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-red-600">Pending Incidents ({pendingIncidents.length})</h2>
                  <div className="space-y-4">
                    {pendingIncidents.map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        onAssignUnit={(id) => setSelectedIncidentId(id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {activeIncidents.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-blue-600">Active Incidents ({activeIncidents.length})</h2>
                  <div className="space-y-4">
                    {activeIncidents.map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        onAssignUnit={(id) => setSelectedIncidentId(id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {resolvedIncidents.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-green-600">Recently Resolved ({resolvedIncidents.length})</h2>
                  <div className="space-y-4">
                    {resolvedIncidents.slice(0, 3).map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <WeatherWidget location={null} />
          
          <RadioChannels unitNumber="dispatch" />
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Users className="mr-2" />
              Online Units ({onlineUnits.length})
            </h2>
            <OnlineUnits 
              units={onlineUnits}
              incidents={incidents}
            />
          </div>
        </div>
      </div>

      {selectedIncidentId && (
        <AssignUnitModal
          incidentId={selectedIncidentId}
          availableUnits={onlineUnits.filter(u => u.status === 'available').map(u => u.unitNumber)}
          onClose={() => setSelectedIncidentId(null)}
        />
      )}
    </div>
  );
}