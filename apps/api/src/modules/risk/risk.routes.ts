import { Router } from 'express';

import { handleListRiskScores, handleGetRiskStats } from './risk.controller';

import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const riskRouter = Router();

riskRouter.use(authenticate, resolveTenant);

riskRouter.get('/risk/scores', handleListRiskScores);
riskRouter.get('/risk/stats', handleGetRiskStats);
