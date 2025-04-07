import * as express from 'express';
import { onRequest } from 'firebase-functions/v2/https';

import bugReportRouter from './routes/BugReport';
import campusRouter from './routes/Campus';
import projectRouter from './routes/Project';
import testRequestRouter from './routes/TestRequest';
import userRouter from './routes/User';

const app = express.default();

app.use('/bug-reports/', bugReportRouter);
app.use('/projects/', projectRouter);
app.use('/test-requests/', testRequestRouter);
app.use('/users/', userRouter);
app.use('/campuses/', campusRouter);

const main = express.default();

main.use('/api', app);

exports.main = onRequest(main);
