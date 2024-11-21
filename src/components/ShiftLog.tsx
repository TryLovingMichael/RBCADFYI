import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LogEntry {
  id: string;
  unitNumber: string;
  timestamp: any;
  type: 'status' | 'incident' | 'break' | 'note';
  description: string;
}

interface ShiftLogProps {
  unitNumber: string;
}

export default function ShiftLog({ unitNumber }: ShiftLogProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const logsQuery = query(
      collection(db, 'shiftLogs'),
      where('unitNumber', '==', unitNumber),
      where('timestamp', '>=', new Date(new Date().setHours(0, 0, 0, 0))),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LogEntry));
      setEntries(logData);
      setIsScrollable(logData.length > 5);
    });

    return () => unsubscribe();
  }, [unitNumber]);

  const addLogNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addDoc(collection(db, 'shiftLogs'), {
        unitNumber,
        timestamp: Timestamp.now(),
        type: 'note',
        description: newNote
      });
      setNewNote('');
    } catch (error) {
      console.error('Error adding log note:', error);
    }
  };

  const displayedEntries = showAll ? entries : entries.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2 text-blue-600" />
        Shift Log
      </h2>

      <form onSubmit={addLogNote} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a log entry..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>

      <div className={`space-y-3 ${showAll ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
        {displayedEntries.map((entry) => (
          <div
            key={entry.id}
            className={`p-3 rounded-lg ${
              entry.type === 'incident'
                ? 'bg-red-50'
                : entry.type === 'status'
                ? 'bg-blue-50'
                : entry.type === 'break'
                ? 'bg-green-50'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium capitalize">{entry.type}</span>
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(entry.timestamp.toDate(), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700">{entry.description}</p>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-center text-gray-500 py-4">No log entries for today</p>
        )}

        {isScrollable && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Show More ({entries.length - 5} more entries)
          </button>
        )}

        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}