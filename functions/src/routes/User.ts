import { Router } from 'express';

const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.send('Hello Users!');
});

export default userRouter;
