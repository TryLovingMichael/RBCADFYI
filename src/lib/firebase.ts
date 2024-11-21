import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const initializeUnitStatus = async (unitId: string, status: 'available' | 'busy' | 'out_of_service' | 'panic' | 'offline' = 'available') => {
  const unitRef = doc(collection(db, 'units'), unitId);
  try {
    await setDoc(unitRef, {
      id: unitId,
      unitNumber: unitId,
      type: 'patrol',
      status,
      lastUpdated: Timestamp.now(),
      lastKnownLocation: null,
      bodyCamera: true,
      dashCamera: true,
      maintenanceStatus: 'good'
    }, { merge: true });
  } catch (error) {
    console.error('Error initializing unit status:', error);
    throw error;
  }
};