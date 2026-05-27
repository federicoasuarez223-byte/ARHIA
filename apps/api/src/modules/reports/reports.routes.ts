import { Router, type Response } from 'express';

import { headcountByDepartment, turnoverReport, seniorityReport } from './reports.service';

import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant, type TenantRequest } from '@/middlewares/tenant.middleware';

export const reportsRouter = Router();

reportsRouter.use(authenticate, resolveTenant);

reportsRouter.get('/headcount', async (req: TenantRequest, res: Response, next) => {
  try {
    const data = await headcountByDepartment(req.companyId!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

reportsRouter.get('/turnover', async (req: TenantRequest, res: Response, next) => {
  try {
    const data = await turnoverReport(req.companyId!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

reportsRouter.get('/seniority', async (req: TenantRequest, res: Response, next) => {
  try {
    const data = await seniorityReport(req.companyId!);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
