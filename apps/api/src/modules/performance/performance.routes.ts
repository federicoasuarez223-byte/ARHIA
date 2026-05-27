import { Router } from 'express';

import { handleListReviews, handleCreateReview } from './performance.controller';

import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const performanceRouter = Router();

performanceRouter.use(authenticate, resolveTenant);

performanceRouter.get('/performance', handleListReviews);
performanceRouter.post('/performance', handleCreateReview);
