import { Request, Response, Router } from 'express';
import * as admin from 'firebase-admin';

import { Project } from '../models/models';

const projectRouter = Router();

const db = admin.firestore();
const projectCollection = db.collection('projects');

// POST: Create project

interface CreateProjectRequest extends Request {
  body: Required<{
    name: string;
    userId: string;
    description: string;
    campusId: string;
  }>;
}

projectRouter.post('/', async (req: CreateProjectRequest, res: Response) => {
  const { name, userId, description, campusId } = req.body;
  const developerId = userId; // Assuming userId is set in the request
  const createdAt = new Date();
  const projectId = projectCollection.doc().id; // Generate a new document ID
  const projectData = {
    projectId,
    developerId,
    campusId,
    name,
    description,
    createdAt,
  };
  try {
    await projectCollection.doc(projectId).set(projectData);
    res.status(201).json({ message: 'Project created successfully', projectId });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Error creating project' });
  }
});

// GET: Get project by id

interface GetProjectRequest extends Request {
  params: {
    id: string;
  };
}

projectRouter.get('/:id', async (req: GetProjectRequest, res: Response) => {
  const { id } = req.params;
  try {
    const projectDoc = await projectCollection.doc(id).get();
    if (!projectDoc.exists) {
      res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(projectDoc.data());
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error fetching project' });
  }
});

interface UpdateProjectRequest extends Request {
  params: {
    id: string;
  };
  body: Omit<Partial<Project>, 'projectId' | 'developerId' | 'createdAt'>;
}
projectRouter.patch('/:id', async (req: UpdateProjectRequest, res: Response) => {
  const { id } = req.params;
  try {
    const projectDoc = await projectCollection.doc(id).get();
    if (!projectDoc.exists) {
      res.status(404).json({ error: 'Project not found' });
    }
    const status = projectCollection.doc(id).update(req.body);
    res.status(200).json({ message: 'Project updated successfully', status });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error updating project' });
  }
});

// DELETE: Delete project by id

interface DeleteProjectRequest extends Request {
  params: {
    id: string;
  };
}
projectRouter.delete('/:id', async (req: DeleteProjectRequest, res: Response) => {
  const { id } = req.params;
  try {
    const projectDoc = await projectCollection.doc(id).get();
    if (!projectDoc.exists) {
      res.status(404).json({ error: 'Project not found' });
    }
    await projectCollection.doc(id).delete();
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
});

projectRouter.get('/', (req, res) => {
  res.send('Hello Project!');
});

export default projectRouter;
