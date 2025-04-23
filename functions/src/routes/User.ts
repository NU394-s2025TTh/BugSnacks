/**
 * All comments made in the file were done by OpenAI's o4-mini model
 *
 * This file defines an Express router for CRUD operations on users,
 * as well as endpoints to fetch projects and bug reports associated
 * with a given user. It uses Firebase Firestore as the data store
 * and typia for runtime request validation.
 */

import { Request, Response, Router } from 'express';
import * as admin from 'firebase-admin';
import { createAssert } from 'typia';

import { User } from '../models/models';
import { ParamsDictionary, validateRequest } from '../utils/typedreq';

const db = admin.firestore();

// Notice: userCollection is pointing at 'bugs' collection — likely a typo,
// should probably be 'users'.
const userCollection = db.collection('bugs');

const userRouter = Router();

interface CreateUserRequestBody {
  name: string;
  email: string;
  campusId: string;
}

userRouter.post(
  '/',
  // Using typia's createAssert to validate and narrow the request body
  validateRequest({ body: createAssert<CreateUserRequestBody>() }),
  async (req: Request<any, any, CreateUserRequestBody, any>, res: Response) => {
    const { email, campusId, name } = req.body;
    const createdAt = new Date();
    const userData = {
      email,
      campusId,
      name,
      createdAt,
    };
    try {
      // Generating a new document ID before writing
      const userId = userCollection.doc().id;
      await userCollection.doc(userId).set(userData);

      res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error creating user' });
    }
  },
);

// GET: Get user by id

interface GetUserRequestParams extends ParamsDictionary {
  id: string;
}

userRouter.get(
  '/:id',
  // Validating route params for 'id'
  validateRequest({ params: createAssert<GetUserRequestParams>() }),
  async (req: Request<GetUserRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const userDoc = await userCollection.doc(id).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return; // Prevents sending two responses
      }
      res.status(200).json(userDoc.data());
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error fetching user' });
    }
  },
);

interface UpdateUserRequestParams extends ParamsDictionary {
  id: string;
}

userRouter.patch(
  '/:id',
  validateRequest({
    // Partial update: omit userId and createdAt from updatable fields
    body: createAssert<Partial<Omit<User, 'userId' | 'createdAt'>>>(),
    params: createAssert<UpdateUserRequestParams>(),
  }),
  async (
    req: Request<UpdateUserRequestParams, any, Partial<User>, any>,
    res: Response,
  ) => {
    const { id } = req.params;
    try {
      const userDoc = await userCollection.doc(id).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return; // Ensure no further execution
      }
      const status = await userCollection.doc(id).update(req.body);
      res.status(200).json({ message: 'User updated successfully', status });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Error updating user' });
    }
  },
);

// DELETE: Delete user by id

interface DeleteUserRequestParams extends ParamsDictionary {
  id: string;
}

userRouter.delete(
  '/:id',
  validateRequest({ params: createAssert<DeleteUserRequestParams>() }),
  async (req: Request<DeleteUserRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const userDoc = await userCollection.doc(id).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return; // Avoid double send
      }
      await userCollection.doc(id).delete();
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  },
);

// query all projects a user owns

const projectCollection = db.collection('projects');

interface GetUserProjectRequestParams extends ParamsDictionary {
  id: string;
}

userRouter.get(
  '/:id/projects',
  validateRequest({ params: createAssert<GetUserProjectRequestParams>() }),
  async (req: Request<GetUserRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const projectsSnapshot = await projectCollection
        .where('developerId', '==', id)
        .get();
      if (projectsSnapshot.empty) {
        res.status(404).json({ error: 'No projects found for this user' });
        return; // Prevent empty fall-through
      } else {
        const projectsArray = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        res.status(200).json(projectsArray);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Error fetching projects' });
    }
  },
);

// query all bug reports a user has submitted

const bugCollection = db.collection('bugs');

interface GetUserBugReportRequestParams extends ParamsDictionary {
  id: string;
}

userRouter.get(
  '/:id/bugReports',
  validateRequest({ params: createAssert<GetUserBugReportRequestParams>() }),
  async (req: Request<GetUserRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const bugReportsSnapshot = await bugCollection.where('testerId', '==', id).get();
      if (bugReportsSnapshot.empty) {
        res.status(404).json({ error: 'No bug reports found for this user' });
        return; // Add return to avoid multiple sends
      } else {
        const bugReportsArray = bugReportsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        res.status(200).json(bugReportsArray);
      }
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      res.status(500).json({ error: 'Error fetching bug reports' });
    }
  },
);

userRouter.get('/', (req, res) => {
  // Simple health-check or placeholder endpoint
  res.send('Hello Users!');
});

export default userRouter;
