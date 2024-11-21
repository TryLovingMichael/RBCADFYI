import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db, initializeUnitStatus } from '../lib/firebase';
import { Users, MapPin, Shield, Car, Coffee, FileText, Radio, History } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Incident, Unit, UnitStatus } from '../types';
import { TenCodesPanel } from './TenCodesPanel';
import { QuickStatusButtons } from './QuickStatusButtons';
import EditIncidentModal from './EditIncidentModal';
import OnlineUnits from './OnlineUnits';
import ActiveIncidentCard from './ActiveIncidentCard';
import NewCallForm from './NewCallForm';
import UnitStatusSelect from './UnitStatusSelect';
import NoActiveCall from './NoActiveCall';
import { useSound } from '../hooks';
import panicSound from '../sounds/panic.ogg';
import WeatherWidget from './WeatherWidget';
import QuickActions from './QuickActions';
import UnitMap from './UnitMap';
import ShiftLog from './ShiftLog';
import RadioChannels from './RadioChannels';
import PastCallsModal from './PastCallModal';
import { useNavigate } from 'react-router-dom';

interface UnitDashboardProps {
  unitNumber: string;
}

const STATUS_ORDER: Record<UnitStatus, number> = {
  panic: 0,
  busy: 1,
  available: 2,
  out_of_service: 3,
  offline: 4
};

export default function UnitDashboard({ unitNumber }: UnitDashboardProps) {
  const navigate = useNavigate();
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [status, setStatus] = useState<UnitStatus>('available');
  const [showEditModal, setShowEditModal] = useState(false);
  const [onlineUnits, setOnlineUnits] = useState<Unit[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showPastCalls, setShowPastCalls] = useState(false);
  const [pastCalls, setPastCalls] = useState<Incident[]>([]);
  const [show10Codes, setShow10Codes] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: '',
    location: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const { play: playPanicSound } = useSound(panicSound);

  // Add new useEffect for past calls
  useEffect(() => {
    const pastCallsQuery = query(
      collection(db, 'incidents'),
      where('assignedUnits', 'array-contains', unitNumber),
      where('status', '==', 'resolved'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(pastCallsQuery, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Incident));
      setPastCalls(calls);
    });

    return () => unsubscribe();
  }, [unitNumber]);

  const logShiftActivity = async (type: 'status' | 'incident' | 'break' | 'note', description: string) => {
    try {
      await addDoc(collection(db, 'shiftLogs'), {
        unitNumber,
        timestamp: Timestamp.now(),
        type,
        description
      });
    } catch (error) {
      console.error('Error logging shift activity:', error);
    }
  };

  // Add listener for unit status changes and kick events
  useEffect(() => {
    const unitRef = doc(db, 'units', unitNumber);
    const unsubscribe = onSnapshot(unitRef, (doc) => {
      const unitData = doc.data();
      if (unitData?.status === 'offline' && unitData?.kickedBy === 'dispatch') {
        toast.error('You have been kicked by dispatch');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [unitNumber, navigate]);

  useEffect(() => {
    const initializeUnit = async () => {
      try {
        await initializeUnitStatus(unitNumber);
        await logShiftActivity('status', 'Unit initialized and started shift');
        toast.success('Unit initialized successfully');
      } catch (error) {
        console.error('Error initializing unit:', error);
        toast.error('Failed to initialize unit');
      }
    };

    initializeUnit();

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          
          const unitRef = doc(db, 'units', unitNumber);
          updateDoc(unitRef, {
            location: newLocation,
            lastUpdated: Timestamp.now()
          });
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        const cleanupUnit = async () => {
          try {
            const unitRef = doc(db, 'units', unitNumber);
            await updateDoc(unitRef, {
              status: 'offline',
              lastUpdated: Timestamp.now()
            });
            await logShiftActivity('status', 'End of shift');
          } catch (error) {
            console.error('Error cleaning up unit status:', error);
          }
        };
        cleanupUnit();
      };
    }
  }, [unitNumber]);

  useEffect(() => {
    const unitsQuery = query(
      collection(db, 'units'),
      where('status', '!=', 'offline')
    );

    const unsubscribe = onSnapshot(unitsQuery, (snapshot) => {
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

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const incidentsQuery = query(
      collection(db, 'incidents'),
      where('status', '!=', 'resolved')
    );

    const unsubscribe = onSnapshot(incidentsQuery, (snapshot) => {
      const allIncidents = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Incident))
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis() ?? 0;
          const timeB = b.timestamp?.toMillis() ?? 0;
          return timeB - timeA;
        });
      
      setIncidents(allIncidents);
      const unitIncident = allIncidents.find(
        incident => incident.assignedUnits?.includes(unitNumber)
      );
      setActiveIncident(unitIncident || null);
    });

    return () => unsubscribe();
  }, [unitNumber]);

  const handleCompleteCall = async () => {
    if (!activeIncident) return;

    try {
      const incidentRef = doc(db, 'incidents', activeIncident.id);
      const timestamp = Timestamp.now();
      
      await updateDoc(incidentRef, {
        status: 'resolved',
        updatedAt: timestamp
      });

      const unitRef = doc(db, 'units', unitNumber);
      await updateDoc(unitRef, {
        status: 'available',
        lastUpdated: timestamp
      });
      
      await logShiftActivity('incident', `Completed call: ${activeIncident.type}`);
      
      setStatus('available');
      toast.success('Call completed successfully');
    } catch (error) {
      console.error('Error completing call:', error);
      toast.error('Failed to complete call');
    }
  };

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const timestamp = Timestamp.now();
      await addDoc(collection(db, 'incidents'), {
        ...newIncident,
        status: 'dispatched',
        timestamp,
        dispatcherId: unitNumber,
        assignedUnits: [unitNumber],
        notes: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        location: location ? `${location.lat}, ${location.lng}` : newIncident.location
      });
      
      const unitRef = doc(db, 'units', unitNumber);
      await updateDoc(unitRef, {
        status: 'busy',
        lastUpdated: timestamp
      });
      
      await logShiftActivity('incident', `Created new call: ${newIncident.type}`);
      
      setStatus('busy');
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

  const handleStatusChange = async (newStatus: UnitStatus) => {
    try {
      const timestamp = Timestamp.now();
      const unitRef = doc(db, 'units', unitNumber);
      await updateDoc(unitRef, {
        status: newStatus,
        lastUpdated: timestamp
      });

      setStatus(newStatus);
      await logShiftActivity('status', `Status changed to ${newStatus}`);
      
      if (newStatus === 'panic') {
        playPanicSound();
        
        if (activeIncident) {
          const incidentRef = doc(db, 'incidents', activeIncident.id);
          const panicNote = {
            id: Date.now().toString(),
            text: '🚨 PANIC BUTTON ACTIVATED 🚨',
            timestamp,
            author: `Unit ${unitNumber}`,
            type: 'panic'
          };
          
          await updateDoc(incidentRef, {
            notes: [...(activeIncident.notes || []), panicNote],
            panicStatus: true,
            updatedAt: timestamp
          });
        }
        toast.error('🚨 PANIC ALERT ACTIVATED 🚨');
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleQuickAction = async (action: 'backup' | 'traffic' | 'break') => {
    const timestamp = Timestamp.now();
    
    switch (action) {
      case 'backup':
        if (activeIncident) {
          const incidentRef = doc(db, 'incidents', activeIncident.id);
          await updateDoc(incidentRef, {
            backupRequested: true,
            updatedAt: timestamp,
            notes: [...(activeIncident.notes || []), {
              id: Date.now().toString(),
              text: '🚔 BACKUP REQUESTED',
              timestamp,
              author: `Unit ${unitNumber}`,
              type: 'backup'
            }]
          });
          await logShiftActivity('incident', 'Backup requested');
          toast.success('Backup requested');
        }
        break;
        
      case 'traffic':
        setNewIncident({
          type: 'Traffic Stop',
          location: location ? `${location.lat}, ${location.lng}` : '',
          description: 'Traffic stop initiated',
          priority: 'medium'
        });
        await logShiftActivity('incident', 'Traffic stop initiated');
        setShowNewCallForm(true);
        break;
        
      case 'break':
        const unitRef = doc(db, 'units', unitNumber);
        await updateDoc(unitRef, {
          status: 'out_of_service',
          lastUpdated: timestamp
        });
        await logShiftActivity('break', 'Break started');
        setStatus('out_of_service');
        toast.success('Break status set');
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Unit {unitNumber}</h2>
                <div className="mt-2">
                  <QuickStatusButtons
                    currentStatus={status}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <TenCodesPanel
                  show={show10Codes}
                  onToggle={() => setShow10Codes(!show10Codes)}
                />
                <button
                  onClick={() => setShowPastCalls(true)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <History className="h-4 w-4 mr-2" />
                  Past Calls
                </button>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
                <NewCallForm
                  showForm={showNewCallForm}
                  onToggleForm={() => setShowNewCallForm(!showNewCallForm)}
                  newIncident={newIncident}
                  onSubmit={handleCreateCall}
                  onIncidentChange={setNewIncident}
                />
              </div>
            </div>

            {showMap && location && (
              <div className="mb-6 h-64 rounded-lg overflow-hidden">
                <UnitMap location={location} />
              </div>
            )}

            <QuickActions onAction={handleQuickAction} />

            {activeIncident ? (
              <ActiveIncidentCard
                incident={activeIncident}
                unitNumber={unitNumber}
                onEdit={() => setShowEditModal(true)}
                onComplete={handleCompleteCall}
              />
            ) : (
              <NoActiveCall />
            )}

            <ShiftLog unitNumber={unitNumber} />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <WeatherWidget location={location} />
          
          <RadioChannels unitNumber={unitNumber} />
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Online Units</h2>
            </div>
            <OnlineUnits units={onlineUnits} incidents={incidents} />
          </div>
        </div>
      </div>

      {showEditModal && activeIncident && (
        <EditIncidentModal
          incident={activeIncident}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showPastCalls && (
        <PastCallsModal
          calls={pastCalls}
          onClose={() => setShowPastCalls(false)}
        />
      )}
    </div>
  );
}