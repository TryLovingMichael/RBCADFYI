import React, { useState } from 'react';
import { doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Clock, MapPin, MessageSquare, AlertTriangle, Shield, Siren, Edit2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Incident } from '../types';
import EditIncidentModal from './EditIncidentModal';

interface IncidentCardProps {
  incident: Incident;
  onAssignUnit?: (incidentId: string) => void;
  onAddSupervisorNote?: (note: string) => Promise<void>;
  isSupervisor?: boolean;
}

export default function IncidentCard({ 
  incident, 
  onAssignUnit,
  onAddSupervisorNote,
  isSupervisor 
}: IncidentCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [supervisorNote, setSupervisorNote] = useState('');
  const [isCodeRed, setIsCodeRed] = useState(incident.codeRed || false);
  const [respondingCode, setRespondingCode] = useState(incident.respondingCode || 2);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      await deleteDoc(incidentRef);
      toast.success('Call completed and removed');
    } catch (error) {
      toast.error('Failed to complete call');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      const newNoteObj = {
        id: Date.now().toString(),
        text: newNote,
        timestamp: Timestamp.now(),
        author: isSupervisor ? 'Supervisor' : 'Dispatch',
        type: isSupervisor ? 'supervisor' : 'info'
      };

      await updateDoc(incidentRef, {
        notes: [...(incident.notes || []), newNoteObj],
        updatedAt: Timestamp.now()
      });

      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleAddSupervisorNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddSupervisorNote && supervisorNote.trim()) {
      await onAddSupervisorNote(supervisorNote);
      setSupervisorNote('');
    }
  };

  const handleCodeRedToggle = async () => {
    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      await updateDoc(incidentRef, {
        codeRed: !isCodeRed,
        updatedAt: Timestamp.now()
      });
      setIsCodeRed(!isCodeRed);
      toast.success(`Code Red ${!isCodeRed ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update Code Red status');
    }
  };

  const handleRespondingCodeChange = async (code: number) => {
    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      await updateDoc(incidentRef, {
        respondingCode: code,
        updatedAt: Timestamp.now()
      });
      setRespondingCode(code);
      toast.success(`Response Code updated to Code ${code}`);
    } catch (error) {
      toast.error('Failed to update Response Code');
    }
  };

  return (
    <>
      <div className={`p-4 rounded-lg border ${
        incident.priority === 'high'
          ? 'border-red-200 bg-red-50'
          : incident.priority === 'medium'
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-green-200 bg-green-50'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{incident.type}</h3>
            {isCodeRed && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                CODE RED
              </span>
            )}
            {isSupervisor && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                SUPERVISOR
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Edit Incident"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              incident.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : incident.status === 'dispatched'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {incident.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <p className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {incident.location}
          </p>
          <p className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {incident.timestamp?.toDate().toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{incident.description}</p>

          {incident.assignedUnits && incident.assignedUnits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {incident.assignedUnits.map((unit) => (
                <span
                  key={unit}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  Unit {unit}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2 mt-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Notes ({incident.notes?.length || 0})
            </button>
            {incident.status !== 'resolved' && (
              <>
                <button
                  onClick={handleCodeRedToggle}
                  className={`flex items-center px-2 py-1 rounded text-sm ${
                    isCodeRed
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Code Red
                </button>
                <select
                  value={respondingCode}
                  onChange={(e) => handleRespondingCodeChange(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1 bg-white"
                >
                  <option value={1}>Code 1</option>
                  <option value={2}>Code 2</option>
                  <option value={3}>Code 3</option>
                </select>
              </>
            )}
          </div>

          {showNotes && (
            <div className="mt-2 space-y-2">
              {incident.notes?.map((note) => (
                <div 
                  key={note.id} 
                  className={`p-2 rounded border ${
                    note.type === 'supervisor' 
                      ? 'bg-blue-50 border-blue-200' 
                      : note.type === 'panic'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <p className="text-sm">{note.text}</p>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span className={note.type === 'supervisor' ? 'font-semibold text-blue-600' : ''}>
                      {note.author}
                    </span>
                    <span>{note.timestamp?.toDate().toLocaleString()}</span>
                  </div>
                </div>
              ))}
              
              {isSupervisor ? (
                <form onSubmit={handleAddSupervisorNote} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={supervisorNote}
                    onChange={(e) => setSupervisorNote(e.target.value)}
                    placeholder="Add supervisor note..."
                    className="flex-1 rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            {incident.status === 'pending' && onAssignUnit && (
              <button
                onClick={() => onAssignUnit(incident.id)}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-1" />
                Assign Unit
              </button>
            )}
            {incident.status === 'dispatched' && !isSupervisor && (
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Complete Call
              </button>
            )}
          </div>
        </div>
      </div>
      {showEditModal && (
        <EditIncidentModal
          incident={incident}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}