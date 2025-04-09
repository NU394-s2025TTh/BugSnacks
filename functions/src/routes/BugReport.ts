import { Request, Response, Router } from 'express';
import * as admin from 'firebase-admin';
import { createAssert } from 'typia';

import { BugReport } from '../models/models';
import { ParamsDictionary, validateRequest } from '../utils/typedreq';

const db = admin.firestore();
const bugsCollection = db.collection('bugs');

const bugReportRouter = Router();

bugReportRouter.get('/', (req, res) => {
  res.send('Hello BugReporter!');
});

interface GetBugReportParams extends ParamsDictionary {
  id: string;
}

bugReportRouter.get(
  '/:id',
  validateRequest({ params: createAssert<GetBugReportParams>() }),
  async (req: Request<GetBugReportParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const bugReportDoc = await bugsCollection.doc(id).get();
      if (!bugReportDoc.exists) {
        res.status(404).json({ error: 'Bug report not found' });
      }
      res.status(200).json(bugReportDoc.data());
    } catch (error) {
      console.error('Error fetching bug report:', error);
      res.status(500).json({ error: 'Error fetching bug report' });
    }
  },
);

bugReportRouter.patch(
  '/:id',
  validateRequest({
    body: createAssert<Omit<Partial<BugReport>, 'reportId' | 'testerId' | 'createdAt'>>(),
    params: createAssert<GetBugReportParams>(),
  }),
  async (
    req: Request<GetBugReportParams, any, Partial<BugReport>, any>,
    res: Response,
  ) => {
    const { id } = req.params;
    try {
      const bugReportDoc = await bugsCollection.doc(id).get();
      if (!bugReportDoc.exists) {
        res.status(404).json({ error: 'Bug report not found' });
        return;
      }
      await bugsCollection.doc(id).update(req.body);
      res.status(200).json({ message: 'Bug report updated successfully' });
    } catch (error) {
      console.error('Error updating bug report:', error);
      res.status(500).json({ error: 'Error updating bug report' });
    }
  },
);

// DELETE: Delete bug report by id

bugReportRouter.delete(
  '/:id',
  validateRequest({ params: createAssert<GetBugReportParams>() }),
  async (req: Request<GetBugReportParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const bugReportDoc = await bugsCollection.doc(id).get();
      if (!bugReportDoc.exists) {
        res.status(404).json({ error: 'Bug report not found' });
        return;
      }
      await bugsCollection.doc(id).delete();
      res.status(200).json({ message: 'Bug report deleted successfully' });
    } catch (error) {
      console.error('Error deleting bug report:', error);
      res.status(500).json({ error: 'Error deleting bug report' });
    }
  },
);

export default bugReportRouter;
