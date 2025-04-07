import * as express from 'express';
import { onRequest } from 'firebase-functions/v2/https';

import { GetClock } from './routes/clock';

const app = express.default();

app.get('/', GetClock);

const main = express.default();

main.use('/api', app);

exports.main = onRequest(main);
