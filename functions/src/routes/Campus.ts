import { Request, Response, Router } from 'express';
import { createAssert } from 'typia';

import { RewardType } from '../models/enums';
import { Reward } from '../models/models';
import { ParamsDictionary, validateRequest } from '../utils/typedreq';

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

campusRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json(Object.keys(DiningMap));
});

interface GetCampusParams extends ParamsDictionary {
  campusId: string;
}

campusRouter.get(
  '/:campusId',
  validateRequest({
    params: createAssert<GetCampusParams>(),
  }),
  (req: Request<GetCampusParams, any, any, any>, res: Response) => {
    const campusId = req.params.campusId;
    const diningOptions = DiningMap[campusId];
    if (!diningOptions) {
      res.status(404).json({ error: 'campus not found' });
    }
    res.status(200).json(diningOptions);
  },
);

campusRouter.get(
  '/:campusId/rewards',
  validateRequest({
    params: createAssert<GetCampusParams>(),
  }),
  (req: Request<GetCampusParams, any, any, any>, res: Response) => {
    const campusId = req.params.campusId;
    const diningOptions = DiningMap[campusId];
    if (!diningOptions) {
      res.status(404).json({ error: 'campus not found' });
    }

    const rewardsArray: Reward[] = [];
    diningOptions.forEach((diningOption) => {
      rewardsArray.push({
        name: diningOption + 'at ' + campusId,
        location: diningOption,
        type: RewardType.GUEST_SWIPE,
      } as Reward);
      rewardsArray.push({
        name: diningOption + 'at ' + campusId,
        location: diningOption,
        type: RewardType.MEAL_EXCHANGE,
      } as Reward);
    });

    res.status(200).json(rewardsArray);
  },
);

export default campusRouter;
