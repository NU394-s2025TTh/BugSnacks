import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAdjxX1g_EMcKs2nOb6SMtSLwug0eCbIdA',
  authDomain: 'bugsnacks2.firebaseapp.com',
  projectId: 'bugsnacks2',
  storageBucket: 'bugsnacks2.firebasestorage.app',
  messagingSenderId: '1037797028766',
  appId: '1:1037797028766:web:63787b3f9c556729f81c8f',
  measurementId: 'G-6LHJWXXL6H',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { analytics, app, db };
