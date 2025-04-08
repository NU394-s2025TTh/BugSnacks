import cors from 'cors';
import express from 'express';
import * as admin from 'firebase-admin';

admin.initializeApp();

import { onRequest } from 'firebase-functions/v2/https';

import bugReportRouter from './routes/BugReport';
import campusRouter from './routes/Campus';
import projectRouter from './routes/Project';
import rewardRouter from './routes/Reward';
import testRequestRouter from './routes/TestRequest';
import userRouter from './routes/User';

const app = express();

app.use(express.json());
app.use(cors({ origin: false }));

app.use('/api/bug-reports/', bugReportRouter);
app.use('/api/projects/', projectRouter);
app.use('/api/test-requests/', testRequestRouter);
app.use('/api/users/', userRouter);
app.use('/api/campuses/', campusRouter);
app.use('/api/rewards/', rewardRouter);

app.get('/api/', (req, res) => {
  res.status(200).send('BugSnacks API');
});

app.get('/', (req, res) => {
  res.status(200).send('BugSnacks API');
});

exports.main = onRequest(app);
