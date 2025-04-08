import { Router } from 'express';

const rewardRouter = Router();

rewardRouter.get('/', (req, res) => {
  res.send('Hello Reward!');
});

export default rewardRouter;
