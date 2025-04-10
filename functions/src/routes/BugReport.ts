import { Request, Response, Router } from 'express';
import * as admin from 'firebase-admin';
import { createAssert } from 'typia';

import { BugReportSeverity, BugReportStatus } from '../models/enums';
import { BugReport, Reward } from '../models/models';
import { ParamsDictionary, validateRequest } from '../utils/typedreq';

const db = admin.firestore();
const bugsCollection = db.collection('bugs');

const bugReportRouter = Router();

bugReportRouter.get('/', (req, res) => {
  res.send('Hello BugReporter!');
});

// POST: Create bug report

interface CreateBugReportRequestBody {
  requestId: string;
  testerId: string;
  title: string;
  description: string;
  severity: BugReportSeverity;
  proposedReward: Reward;
  video?: string;
  attachments?: string[];
}

bugReportRouter.post(
  '/',
  validateRequest({ body: createAssert<CreateBugReportRequestBody>() }),
  async (req: Request<any, any, CreateBugReportRequestBody, any>, res: Response) => {
    const {
      requestId,
      testerId,
      title,
      description,
      severity,
      proposedReward,
      video,
      attachments,
    } = req.body;
    const createdAt = new Date();
    const reportId = bugsCollection.doc().id; // Generate a new document ID
    const bugReportData: Partial<BugReport> = {
      reportId,
      requestId,
      testerId,
      title,
      description,
      severity,
      proposedReward,
      status: BugReportStatus.SUBMITTED,
      createdAt,
      video,
      attachments,
    };
    try {
      await bugsCollection.doc(reportId).set(bugReportData);
      res.status(201).json({ message: 'Bug report created successfully', reportId });
    } catch (error) {
      console.error('Error creating bug report:', error);
      res.status(500).json({ error: 'Error creating bug report' });
    }
  },
);

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
