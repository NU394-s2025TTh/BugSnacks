import { Request, Response, Router } from 'express';
import * as admin from 'firebase-admin';
import { createAssert } from 'typia';

import { TestRequestStatus } from '../models/enums';
import { Reward, TestRequest } from '../models/models';
import { ParamsDictionary, validateRequest } from '../utils/typedreq';

const testRequestRouter = Router();

const db = admin.firestore();
const testRequestCollection = db.collection('testRequests');

testRequestRouter.get('/', (req, res) => {
  res.send('Hello TestRequest!');
});

interface CreateTestRequestBody {
  projectId: string;
  developerId: string;
  title: string;
  description: string;
  demoUrl: string;
  reward: Reward | Array<Reward>;
  status: TestRequestStatus;
}

testRequestRouter.post(
  '/',
  validateRequest({ body: createAssert<CreateTestRequestBody>() }),
  async (req: Request<any, any, CreateTestRequestBody, any>, res: Response) => {
    const { projectId, developerId, title, description, demoUrl, reward, status } =
      req.body;
    const createdAt = new Date();
    const requestId = testRequestCollection.doc().id; // Generate a new document ID
    const testRequestData = {
      requestId,
      projectId,
      developerId,
      title,
      description,
      demoUrl,
      reward,
      status,
      createdAt,
    };
    try {
      await testRequestCollection.doc(requestId).set(testRequestData);
      res.status(201).json({ message: 'Test request created successfully', requestId });
    } catch (error) {
      console.error('Error creating test request:', error);
      res.status(500).json({ error: 'Error creating test request' });
    }
  },
);

interface GetTestRequestParams extends ParamsDictionary {
  id: string;
}

testRequestRouter.get(
  '/:id',
  validateRequest({ params: createAssert<GetTestRequestParams>() }),
  async (req: Request<GetTestRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const testRequestDoc = await testRequestCollection.doc(id).get();
      if (!testRequestDoc.exists) {
        res.status(404).json({ error: 'Test request not found' });
      } else {
        res.status(200).json(testRequestDoc.data());
      }
    } catch (error) {
      console.error('Error fetching test request:', error);
      res.status(500).json({ error: 'Error fetching test request' });
    }
  },
);

interface UpdateTestRequestParams extends ParamsDictionary {
  id: string;
}

testRequestRouter.patch(
  '/:id',
  validateRequest({
    body: createAssert<
      Omit<Partial<TestRequest>, 'requestId' | 'projectId' | 'developerId' | 'createdAt'>
    >(),
    params: createAssert<UpdateTestRequestParams>(),
  }),
  async (
    req: Request<UpdateTestRequestParams, any, Partial<CreateTestRequestBody>, any>,
    res: Response,
  ) => {
    const { id } = req.params;
    try {
      const testRequestDoc = await testRequestCollection.doc(id).get();
      if (!testRequestDoc.exists) {
        res.status(404).json({ error: 'Test request not found' });
      } else {
        await admin.firestore().collection('testRequests').doc(id).update(req.body);
        res.status(200).json({ message: 'Test request updated successfully' });
      }
    } catch (error) {
      console.error('Error updating test request:', error);
      res.status(500).json({ error: 'Error updating test request' });
    }
  },
);

interface DeleteTestRequestParams extends ParamsDictionary {
  id: string;
}

testRequestRouter.delete(
  '/:id',
  validateRequest({ params: createAssert<DeleteTestRequestParams>() }),
  async (req: Request<DeleteTestRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const testRequestDoc = await testRequestCollection.doc(id).get();
      if (!testRequestDoc.exists) {
        res.status(404).json({ error: 'Test request not found' });
      } else {
        await admin.firestore().collection('testRequests').doc(id).delete();
        res.status(200).json({ message: 'Test request deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting test request:', error);
      res.status(500).json({ error: 'Error deleting test request' });
    }
  },
);

// find all bugReports by testRequestId

const bugCollection = db.collection('bugs');

interface GetTestRequestBugsParams extends ParamsDictionary {
  id: string;
}

testRequestRouter.get(
  '/:id/bugs',
  validateRequest({ params: createAssert<GetTestRequestBugsParams>() }),
  async (req: Request<DeleteTestRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const bugsSnapshot = await bugCollection.where('requestId', '==', id).get();
      if (bugsSnapshot.empty) {
        res.status(404).json({ error: 'No bugs found for this test request' });
      } else {
        const bugsArray = bugsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        res.status(200).json(bugsArray);
      }
    } catch (error) {
      console.error('Error fetching bugs:', error);
      res.status(500).json({ error: 'Error fetching bugs' });
    }
  },
);

export default testRequestRouter;
