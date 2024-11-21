import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Bolo } from '../types';
import BoloList from './BoloList';
import NewBoloForm from './NewBoloForm';

export default function BoloDashboard() {
  const [bolos, setBolos] = useState<Bolo[]>([]);
  const [showNewBoloForm, setShowNewBoloForm] = useState(false);
  const [editingBolo, setEditingBolo] = useState<Bolo | null>(null);

  useEffect(() => {
    const bolosQuery = query(
      collection(db, 'bolos'),
      where('status', '!=', 'expired')
    );

    const unsubscribe = onSnapshot(bolosQuery, (snapshot) => {
      const boloData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Bolo))
        .sort((a, b) => {
          // Sort by priority first
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by creation date
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
      
      setBolos(boloData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateBolo = async (boloData: Partial<Bolo>) => {
    try {
      const timestamp = Timestamp.now();
      await addDoc(collection(db, 'bolos'), {
        ...boloData,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
        notes: []
      });
      
      toast.success('BOLO created successfully');
      setShowNewBoloForm(false);
    } catch (error) {
      console.error('Error creating BOLO:', error);
      toast.error('Failed to create BOLO');
    }
  };

  const handleResolveBolo = async (boloId: string) => {
    try {
      const boloRef = doc(db, 'bolos', boloId);
      await updateDoc(boloRef, {
        status: 'resolved',
        updatedAt: Timestamp.now()
      });
      
      toast.success('BOLO resolved successfully');
    } catch (error) {
      console.error('Error resolving BOLO:', error);
      toast.error('Failed to resolve BOLO');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Active BOLOs</h2>
          <button
            onClick={() => setShowNewBoloForm(true)}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New BOLO
          </button>
        </div>

        <BoloList
          bolos={bolos}
          onEdit={setEditingBolo}
          onResolve={handleResolveBolo}
        />
      </div>

      {showNewBoloForm && (
        <NewBoloForm
          onSubmit={handleCreateBolo}
          onClose={() => setShowNewBoloForm(false)}
        />
      )}
    </div>
  );
}