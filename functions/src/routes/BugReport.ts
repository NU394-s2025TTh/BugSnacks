import { Router } from 'express';

const bugReportRouter = Router();

bugReportRouter.get('/', (req, res) => {
  res.send('Hello BugReporter!');
});

export default bugReportRouter;
