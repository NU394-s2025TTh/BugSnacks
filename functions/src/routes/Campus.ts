import { Router } from 'express';

const campusRouter = Router();

campusRouter.get('/', (req, res) => {
  res.send('Hello Campus!');
});

export default campusRouter;
