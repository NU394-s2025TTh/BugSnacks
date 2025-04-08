import { Request, Response, Router } from 'express';

const campusRouter = Router();

const NorthwesternCampusDining = [
  'Café Bergson',
  'Dining Commons',
  'Norris Center',
  'Retail Dining',
  'Chicago Campus',
  'Protein Bar',
  '847 Burger',
  'Buen Dia',
  'Shake Smart',
  'Chicken & Boba',
  'Allison Dining Commons',
  'Sargent Dining Commons',
  "847 Late Night at Fran's",
  'Wildcat Deli',
  'Tech Express',
  'Backlot at Kresge Cafe',
  'Starbucks',
  'Foster Walker Plex East',
  'Foster Walker Plex West & Market',
  'MOD Pizza',
  'Cafe Coralie',
  'Market at Norris',
  'Elder Dining Commons',
  "Lisa's Cafe",
];

const DiningMap: Record<string, Array<string>> = {
  northwestern1: NorthwesternCampusDining,
};

interface GetCampusRequest extends Request {
  params: Required<{
    campusId: string;
  }>;
}

campusRouter.get('/:campusId', (req: GetCampusRequest, res: Response) => {
  const campusId = req.params.campusId;
  const diningOptions = DiningMap[campusId];
  if (!diningOptions) {
    res.status(404).json({ error: 'campus not found' });
  }
  res.status(200).json(diningOptions);
});

export default campusRouter;
