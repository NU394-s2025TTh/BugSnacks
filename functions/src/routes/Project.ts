/**
 * Most comments made in the file were done by OpenAI's o4-mini model
 *
 * This file defines an Express router for managing "projects" in Firestore.
 * It provides endpoints to create, retrieve, update, and delete projects,
 * query by campus, and retrieve associated test requests. Request bodies
 * and parameters are validated using typia and a custom validateRequest utility.
 */

import { Request, Response, Router } from 'express';
import * as admin from 'firebase-admin';
import { assert, createAssert } from 'typia';

import { Platform } from '../models/enums';
import { Project } from '../models/models'; // Project type imported for patch endpoint
import { ParamsDictionary, validateRequest } from '../utils/typedreq';

const projectRouter = Router();

const db = admin.firestore();
const projectCollection = db.collection('projects'); // Firestore collection reference

// POST: Create project
interface CreateProjectRequestBody {
  name: string;
  userId: string;
  description: string;
  campusId: string;
  platform?: Platform;
}

projectRouter.post(
  '/',
  validateRequest({ body: createAssert<CreateProjectRequestBody>() }),
  async (req: Request<any, any, CreateProjectRequestBody, any>, res: Response) => {
    const { name, userId, description, campusId, platform } = req.body;
    const developerId = userId; // using userId as developerId
    const createdAt = new Date(); // client timestamp; consider serverTimestamp for consistency
    const projectId = projectCollection.doc().id; // generate unique ID
    const projectData = {
      projectId,
      developerId,
      campusId,
      name,
      description,
      createdAt,
      platform,
    };
    try {
      await projectCollection.doc(projectId).set(projectData);
      res.status(201).json({ message: 'Project created successfully', projectId });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Error creating project' });
    }
  },
);

// GET: Get project by id
interface GetProjectRequestParams extends ParamsDictionary {
  id: string;
}

projectRouter.get(
  '/:id',
  validateRequest({ params: createAssert<GetProjectRequestParams>() }),
  async (req: Request<GetProjectRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const projectDoc = await projectCollection.doc(id).get();
      if (!projectDoc.exists) {
        res.status(404).json({ error: 'Project not found' });
        return; // ensure we don't continue after sending response
      }
      res.status(200).json(projectDoc.data());
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Error fetching project' });
    }
  },
);

// GET: Get project by campusId
interface GetProjectRequestCampusParams extends ParamsDictionary {
  campusId: string;
}

projectRouter.get(
  '/campus/:campusId',
  validateRequest({ params: createAssert<GetProjectRequestCampusParams>() }),
  async (req: Request<GetProjectRequestCampusParams, any, any, any>, res: Response) => {
    const { campusId } = req.params;
    try {
      const snapshot = await projectCollection
        .where('campusId', '==', campusId)
        .orderBy('createdAt', 'desc')
        .get();
      if (snapshot.empty) {
        res.status(404).json({ error: 'Projects not found in this campus' });
        return;
      }
      const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Error fetching project' });
    }
  },
);

interface UpdateProjectRequestParams extends ParamsDictionary {
  id: string;
}

projectRouter.patch(
  '/:id',
  validateRequest({
    body: createAssert<
      Omit<Partial<Project>, 'projectId' | 'developerId' | 'createdAt'>
    >(),
    params: createAssert<UpdateProjectRequestParams>(),
  }),
  async (
    req: Request<UpdateProjectRequestParams, any, Partial<Project>, any>,
    res: Response,
  ) => {
    assert<UpdateProjectRequestParams>(req); // validate params at runtime
    const { id } = req.params;
    try {
      const projectDoc = await projectCollection.doc(id).get();
      if (!projectDoc.exists) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      // Missing await means status will be a Promise; await for correct behavior
      await projectCollection.doc(id).update(req.body);
      res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Error updating project' });
    }
  },
);

// DELETE: Delete project by id
interface DeleteProjectRequestParams extends ParamsDictionary {
  id: string;
}

projectRouter.delete(
  '/:id',
  validateRequest({ params: createAssert<DeleteProjectRequestParams>() }),
  async (req: Request<DeleteProjectRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const projectDoc = await projectCollection.doc(id).get();
      if (!projectDoc.exists) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      await projectCollection.doc(id).delete();
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Error deleting project' });
    }
  },
);

// query for all testRequests
const testRequestCollection = db.collection('testRequests');

interface GetProjectsTestRequestParams extends ParamsDictionary {
  id: string; // projectId for test requests
}

projectRouter.get(
  '/:id/requests',
  validateRequest({ params: createAssert<GetProjectsTestRequestParams>() }),
  async (req: Request<GetProjectsTestRequestParams, any, any, any>, res: Response) => {
    const { id } = req.params;
    try {
      const testRequestsSnapshot = await testRequestCollection
        .where('projectId', '==', id)
        .get();
      if (testRequestsSnapshot.empty) {
        res.status(404).json({ error: 'No test requests found for this project' });
        return;
      }
      const testRequestsArray = testRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.status(200).json(testRequestsArray);
    } catch (error) {
      console.error('Error fetching test requests:', error);
      res.status(500).json({ error: 'Error fetching test requests' });
    }
  },
);

// Simple health-check or placeholder route
projectRouter.get('/', (req, res) => {
  res.send('Hello Project!');
});

export default projectRouter;
