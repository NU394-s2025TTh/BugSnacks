/*
 * This module sets up Express routes to manage campus dining data and rewards.
 * - GET    /                 : Lists available campus IDs.
 * - GET    /:campusId        : Retrieves dining options for a campus.
 * - GET    /:campusId/rewards: Generates reward entries for each dining option.
 */
// All comments made in the file were done by OpenAI's o4-mini model

import { Request, Response, Router } from 'express';
// Using typia to perform runtime assertion of request parameters
import { createAssert } from 'typia';

import { RewardType } from '../models/enums';
import { Reward } from '../models/models';
import { ParamsDictionary, validateRequest } from '../utils/typedreq';

const campusRouter = Router();

// Static list of dining venues available on Northwestern's campus
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

// Mapping of campus identifiers to their dining option arrays
const DiningMap: Record<string, Array<string>> = {
  northwestern1: NorthwesternCampusDining,
};

// Returns a list of supported campus IDs (object keys of DiningMap)
campusRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json(Object.keys(DiningMap));
});

interface GetCampusParams extends ParamsDictionary {
  campusId: string;
}

// GET /:campusId — validate that campusId is provided and is a string
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
      return; // prevent further execution when campus is missing
    }
    res.status(200).json(diningOptions);
  },
);

// GET /:campusId/rewards — generate Reward objects for each dining venue
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
      return; // ensure we don't proceed if campus is invalid
    }

    const rewardsArray: Reward[] = [];
    // For each dining option, create two reward types
    diningOptions.forEach((diningOption) => {
      rewardsArray.push({
        name: `${diningOption} at ${campusId}`,
        location: diningOption,
        type: RewardType.GUEST_SWIPE,
      } as Reward);
      rewardsArray.push({
        name: `${diningOption} at ${campusId}`,
        location: diningOption,
        type: RewardType.MEAL_EXCHANGE,
      } as Reward);
    });

    res.status(200).json(rewardsArray);
  },
);

export default campusRouter;
