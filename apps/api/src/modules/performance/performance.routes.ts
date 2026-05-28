import { Router } from 'express';

import {
  handleListReviews,
  handleCreateReview,
  handleUpdateReview,
} from './performance.controller';

import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const performanceRouter = Router();

performanceRouter.use(authenticate, resolveTenant);

performanceRouter.get('/', handleListReviews);
performanceRouter.post('/', handleCreateReview);
performanceRouter.patch('/:id', handleUpdateReview);
