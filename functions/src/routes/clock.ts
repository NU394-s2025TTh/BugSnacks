import { Request, Response } from 'express';

export const GetClock = (req: Request, res: Response) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  res.send({
    bongs: 'RING '.repeat(hours),
  });
};
