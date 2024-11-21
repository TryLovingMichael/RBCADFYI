import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, arrayUnion, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Shield, Activity, BarChart2, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Incident, Unit, UnitStatus } from '../types';
import OnlineUnits from './OnlineUnits';
import RadioChannels from './RadioChannels';
import WeatherWidget from './WeatherWidget';
import SupervisorActions from './SupervisorActions';
import ShiftLog from './ShiftLog';
import IncidentCard from './IncidentCard';
import UnitMetrics from './UnitMetrics';
import IncidentAnalytics from './IncidentAnalytics';
import ShiftOverview from './ShiftOverview';
import NewCallForm from './NewCallForm';
import AssignUnitModal from './AssignUnitModal';

const STATUS_ORDER: Record<UnitStatus, number> = {
  panic: 0,
  busy: 1,
  available: 2,
  out_of_service: 3,
  offline: 4
};

export default function SupervisorDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [onlineUnits, setOnlineUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState<'incidents' | 'metrics' | 'overview'>('incidents');
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [newIncident, setNewIncident] = useState({
    type: '',
    location: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  useEffect(() => {
    const incidentsQuery = query(
      collection(db, 'incidents'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribeIncidents = onSnapshot(incidentsQuery, (snapshot) => {
      const incidentData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Incident))
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis() ?? 0;
          const timeB = b.timestamp?.toMillis() ?? 0;
          return timeB - timeA;
        });
      setIncidents(incidentData);
    });

    const unitsQuery = query(
      collection(db, 'units'),
      where('status', '!=', 'offline')
    );
    
    const unsubscribeUnits = onSnapshot(unitsQuery, (snapshot) => {
      const units = snapshot.docs
        .map(doc => ({
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

  const handleForceStatusChange = async (unitId: string, newStatus: UnitStatus) => {
    try {
      const unitRef = doc(db, 'units', unitId);
      await updateDoc(unitRef, {
        status: newStatus,
        lastUpdated: Timestamp.now(),
        lastStatusUpdate: {
          by: 'supervisor',
          timestamp: Timestamp.now(),
          reason: 'Supervisor override'
        }
      });
      toast.success(`Force changed status of Unit ${unitId} to ${newStatus}`);
    } catch (error) {
      console.error('Error forcing status change:', error);
      toast.error('Failed to change unit status');
    }
  };

  const handleAddSupervisorNote = async (incidentId: string, note: string) => {
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      const timestamp = Timestamp.now();
      
      await updateDoc(incidentRef, {
        notes: arrayUnion({
          id: Date.now().toString(),
          text: note,
          timestamp,
          author: 'Supervisor',
          type: 'supervisor'
        }),
        updatedAt: timestamp
      });
      
      toast.success('Supervisor note added');
    } catch (error) {
      console.error('Error adding supervisor note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const timestamp = Timestamp.now();
      await addDoc(collection(db, 'incidents'), {
        ...newIncident,
        status: 'pending',
        timestamp,
        dispatcherId: 'supervisor',
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
      setShowNewCallForm(false);
      toast.success('Call created successfully');
    } catch (error) {
      console.error('Error creating call:', error);
      toast.error('Failed to create call');
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Supervisor Dashboard
              </h2>
              <div className="flex items-center space-x-4">
                <NewCallForm
                  showForm={showNewCallForm}
                  onToggleForm={() => setShowNewCallForm(!showNewCallForm)}
                  newIncident={newIncident}
                  onSubmit={handleCreateCall}
                  onIncidentChange={setNewIncident}
                />
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('incidents')}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      activeTab === 'incidents' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Active Incidents
                  </button>
                  <button
                    onClick={() => setActiveTab('metrics')}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      activeTab === 'metrics' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Unit Metrics
                  </button>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      activeTab === 'overview' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Shift Overview
                  </button>
                </div>
              </div>
            </div>

            <SupervisorActions
              onlineUnits={onlineUnits}
              onForceStatusChange={handleForceStatusChange}
              onAddSupervisorNote={handleAddSupervisorNote}
            />

            {activeTab === 'incidents' && (
              <>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Active Incidents</h3>
                  <div className="space-y-4">
                    {activeIncidents.map(incident => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        onAddSupervisorNote={(note) => handleAddSupervisorNote(incident.id, note)}
                        isSupervisor={true}
                        onAssignUnit={(id) => setSelectedIncidentId(id)}
                      />
                    ))}
                  </div>
                </div>

                {resolvedIncidents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-600">Recently Resolved ({resolvedIncidents.length})</h3>
                    <div className="space-y-4">
                      {resolvedIncidents.slice(0, 3).map(incident => (
                        <IncidentCard
                          key={incident.id}
                          incident={incident}
                          onAddSupervisorNote={(note) => handleAddSupervisorNote(incident.id, note)}
                          isSupervisor={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'metrics' && (
              <UnitMetrics units={onlineUnits} incidents={incidents} />
            )}

            {activeTab === 'overview' && (
              <ShiftOverview units={onlineUnits} incidents={incidents} />
            )}
          </div>

          <IncidentAnalytics incidents={incidents} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <WeatherWidget location={null} />
          
          <RadioChannels unitNumber="supervisor" />
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Online Units ({onlineUnits.length})</h2>
            </div>
            <OnlineUnits 
              units={onlineUnits}
              incidents={incidents}
              isSupervisor={true}
              onUnitSelect={setSelectedUnit}
            />
          </div>

          {selectedUnit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Unit {selectedUnit} Shift Log</h2>
              <ShiftLog unitNumber={selectedUnit} />
            </div>
          )}
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