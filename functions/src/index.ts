/*
 * Main entry point for Firebase Cloud Functions:
 * - Initializes Firebase Admin SDK
 * - Sets up an Express server with JSON, CORS, and no-cache middleware
 * - Mounts routers for bug reports, projects, test requests, users, and campuses
 * - Defines basic health check endpoints
 * - Exports as a Firebase HTTPS function
 *
 * All comments made in the file were done by OpenAI's o4-mini model
 */

import cors from 'cors';
import express from 'express';
import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK for accessing Firestore, Auth, etc.
admin.initializeApp();

import { onRequest } from 'firebase-functions/v2/https';

// Import route handlers for different API domains
import bugReportRouter from './routes/BugReport';
import campusRouter from './routes/Campus';
import projectRouter from './routes/Project';
import testRequestRouter from './routes/TestRequest';
import userRouter from './routes/User';

// Create the Express application
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());
// Enable Cross-Origin Resource Sharing
app.use(cors());

// Disable client-side caching for all responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Mount routers under their respective URL prefixes
app.use('/api/bug-reports/', bugReportRouter);
app.use('/api/projects/', projectRouter);
app.use('/api/test-requests/', testRequestRouter);
app.use('/api/users/', userRouter);
app.use('/api/campuses/', campusRouter);

// Health check endpoint under /api
app.get('/api/', (req, res) => {
  res.status(200).send('BugSnacks API');
});

// Health check endpoint at root
app.get('/', (req, res) => {
  res.status(200).send('BugSnacks API');
});

// Export the Express app as a Firebase HTTPS Cloud Function with CORS enabled
exports.main = onRequest({ cors: true }, app);
