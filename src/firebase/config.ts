import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Añadir declaración de tipos para import.meta.env
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Configuración para solucionar problemas de CORS
const firestoreSettings = {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true, // Usar long polling en lugar de WebSockets
  useFetchStreams: false // Deshabilitar streams para evitar problemas de CORS
};

// Inicializar Firestore con opciones para evitar problemas de CORS
// En lugar de usar getFirestore y luego settings, usamos initializeFirestore directamente
const db = initializeFirestore(app, firestoreSettings);

export { app, db }; 