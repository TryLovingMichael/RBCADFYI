// Basic type definitions
export type Priority = 'high' | 'medium' | 'low';
export type IncidentStatus = 'pending' | 'dispatched' | 'resolved';
export type UnitStatus = 'available' | 'busy' | 'out_of_service' | 'panic' | 'offline';
export type NoteType = 'info' | 'warning' | 'update' | 'panic' | 'backup' | 'evidence' | 'medical' | 'fire' | 'supervisor';
export type MaintenanceStatus = 'good' | 'needs-service' | 'out-of-service';
export type ShiftType = 'day' | 'night' | 'swing';
export type BoloType = 'person' | 'vehicle' | 'property' | 'other';
export type BoloStatus = 'active' | 'resolved' | 'expired';
export type UserRole = 'dispatch' | 'unit' | 'supervisor';

export interface Note {
  id: string;
  text: string;
  timestamp: any;
  author: string;
  type?: NoteType;
  category?: string;
  priority?: Priority;
  attachments?: string[];
  location?: string;
  relatedUnits?: string[];
  status?: string;
  followUp?: boolean;
  private?: boolean;
}

export interface Incident {
  id: string;
  type: string;
  location: string;
  description: string;
  priority: Priority;
  status: IncidentStatus;
  timestamp: any;
  assignedUnits: string[];
  dispatcherId: string;
  notes?: Note[];
  createdAt?: any;
  updatedAt?: any;
  codeRed?: boolean;
  eta?: number;
  crossStreets?: string;
  hazards?: string[];
  respondingCode?: number;
  panicStatus?: boolean;
  backupRequested?: boolean;
  weatherConditions?: string;
  nearestCrossStreet?: string;
  involvedParties?: string[];
  vehicleDetails?: string;
  weaponsInvolved?: boolean;
  supervisor?: string;
  k9Requested?: boolean;
  airSupportRequested?: boolean;
  swatRequested?: boolean;
  trafficControlNeeded?: boolean;
  detectives?: string[];
  evidenceCollected?: boolean;
  bodyCamera?: boolean;
  dashCamera?: boolean;
  licensePlate?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  suspectDescription?: string;
  victimInformation?: string;
  witnessInformation?: string;
  propertyDamage?: string;
  injuriesReported?: boolean;
  medicalResponse?: boolean;
  fireResponse?: boolean;
  hazmatResponse?: boolean;
  searchWarrantNeeded?: boolean;
  evidenceType?: string[];
  reportNumber?: string;
  jurisdiction?: string;
  sector?: string;
  beat?: string;
  grid?: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  status: UnitStatus;
  currentIncidentId?: string;
  lastStatusUpdate?: any;
  lastUpdated?: any;
  location?: string;
  respondingCode?: number;
  panicStatus?: boolean;
  lastKnownLocation?: string;
  backupRequested?: boolean;
  supervisor?: string;
  partner?: string;
  shift?: ShiftType;
  vehicle?: string;
  equipment?: string[];
  certifications?: string[];
  specialties?: string[];
  notes?: string;
  bodyCamera?: boolean;
  dashCamera?: boolean;
  mileage?: number;
  fuelLevel?: number;
  maintenanceStatus?: MaintenanceStatus;
}

export interface Bolo {
  id: string;
  type: BoloType;
  status: BoloStatus;
  title: string;
  description: string;
  createdAt: any;
  updatedAt: any;
  expiresAt: any;
  createdBy: string;
  priority: Priority;
  location?: string;
  lastSeen?: string;
  images?: string[];
  attachments?: string[];
  relatedIncidents?: string[];
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: string;
    color?: string;
    licensePlate?: string;
    state?: string;
    identifyingFeatures?: string;
  };
  personDetails?: {
    name?: string;
    age?: string;
    height?: string;
    weight?: string;
    race?: string;
    sex?: string;
    hair?: string;
    eyes?: string;
    clothing?: string;
    identifyingFeatures?: string;
    lastKnownLocation?: string;
    knownAssociates?: string[];
    warrants?: boolean;
    armed?: boolean;
    dangerous?: boolean;
  };
  propertyDetails?: {
    type?: string;
    serialNumber?: string;
    value?: string;
    identifyingFeatures?: string;
  };
  notes?: Note[];
}