import React, { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Incident, Note, NoteType } from '../types';

interface IncidentNotesProps {
  incident: Incident;
  unitNumber: string;
}

export default function IncidentNotes({ incident, unitNumber }: IncidentNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('info');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      const timestamp = Timestamp.now();
      const newNoteObj: Note = {
        id: Date.now().toString(),
        text: newNote,
        timestamp,
        author: `Unit ${unitNumber}`,
        type: noteType,
        category: noteType,
        priority: incident.priority,
        location: incident.location,
        relatedUnits: [unitNumber],
        followUp: false,
        private: false
      };

      await updateDoc(incidentRef, {
        notes: [...(incident.notes || []), newNoteObj],
        updatedAt: timestamp
      });

      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {incident.notes?.map((note) => (
        <div key={note.id} className={`p-2 rounded border ${
          note.type === 'panic' 
            ? 'bg-red-50 border-red-200 animate-pulse' 
            : note.type === 'warning'
            ? 'bg-yellow-50 border-yellow-200'
            : note.type === 'update'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">{note.type?.toUpperCase()}</span>
            {note.followUp && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                Follow-up Required
              </span>
            )}
          </div>
          <p className="text-sm">{note.text}</p>
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
            <span>{note.author}</span>
            <span>{note.timestamp?.toDate().toLocaleString()}</span>
          </div>
        </div>
      ))}
      
      <form onSubmit={handleAddNote} className="mt-2 space-y-2">
        <div className="flex gap-2">
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteType)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="update">Update</option>
            <option value="evidence">Evidence</option>
            <option value="medical">Medical</option>
            <option value="fire">Fire</option>
            <option value="supervisor">Supervisor</option>
          </select>
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
        </div>
      </form>
    </div>
  );
}