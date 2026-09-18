import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore using the configured database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;

// Validate Connection to Firestore on startup as mandated by skill guidelines
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Cloud Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client is operating in offline mode or disconnected.');
    } else {
      console.log('[Firebase] Connection check completed (or collection empty).');
    }
    return false;
  }
}

// Automatically test connection on module load
testFirebaseConnection();

export default app;
