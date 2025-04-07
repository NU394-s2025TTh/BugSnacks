import { Router } from 'express';

const testRequestRouter = Router();

testRequestRouter.get('/', (req, res) => {
  res.send('Hello TestRequest!');
});

export default testRequestRouter;
