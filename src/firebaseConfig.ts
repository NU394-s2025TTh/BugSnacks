/*
 * This file initializes and configures a Firebase application with necessary services.
 * It sets up Firebase Analytics, Authentication, Firestore database, and Cloud Storage
 * using the provided project configuration.
 */
// All comments made in the file were done by OpenAI's o4-mini model

// Import Firebase Analytics to track user interactions and events
import { getAnalytics } from 'firebase/analytics';
// Import core Firebase app initialization function
import { initializeApp } from 'firebase/app';
// Import Firebase Authentication module for user sign-in and management
import { getAuth } from 'firebase/auth';
// Import Cloud Firestore module for NoSQL database operations
import { getFirestore } from 'firebase/firestore';
// Import Cloud Storage module for file uploads and downloads
import { getStorage } from 'firebase/storage';

// Firebase project configuration object (retrieved from Firebase console)
// Contains API key, project identifiers, and other settings
const firebaseConfig = {
  apiKey: 'AIzaSyAdjxX1g_EMcKs2nOb6SMtSLwug0eCbIdA',
  authDomain: 'bugsnacks2.firebaseapp.com',
  projectId: 'bugsnacks2',
  storageBucket: 'bugsnacks2.firebasestorage.app',
  messagingSenderId: '1037797028766',
  appId: '1:1037797028766:web:63787b3f9c556729f81c8f',
  measurementId: 'G-6LHJWXXL6H',
};

// Initialize the Firebase app instance with the above configuration
const app = initializeApp(firebaseConfig);
// Set up Cloud Storage service for handling user file uploads/downloads
const storage = getStorage(app);
// Enable Firebase Analytics for this app instance
const analytics = getAnalytics(app);
// Initialize Cloud Firestore for database operations
const db = getFirestore(app);
// Set up Firebase Authentication service
const auth = getAuth(app);

// Export initialized services so they can be used throughout the application
export { analytics, app, auth, db, storage };
