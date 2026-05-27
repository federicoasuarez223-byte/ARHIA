import { Router, type Response } from 'express';

import { handleListRiskScores, handleGetRiskStats } from './risk.controller';
import { calculateRiskForAll } from './risk.service';

import { authenticate, requireRoles } from '@/middlewares/auth.middleware';
import { resolveTenant, type TenantRequest } from '@/middlewares/tenant.middleware';

export const riskRouter = Router();

riskRouter.use(authenticate, resolveTenant);

riskRouter.get('/risk/scores', handleListRiskScores);
riskRouter.get('/risk/stats', handleGetRiskStats);

riskRouter.post(
  '/risk/calculate',
  requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'),
  async (req: TenantRequest, res: Response, next) => {
    try {
      const result = await calculateRiskForAll(req.companyId!);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
);
