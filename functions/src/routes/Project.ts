import { Router } from 'express';

const projectRouter = Router();

projectRouter.get('/', (req, res) => {
  res.send('Hello Project!');
});

export default projectRouter;
