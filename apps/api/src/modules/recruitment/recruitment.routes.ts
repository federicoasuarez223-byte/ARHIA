import { Router } from 'express';

import {
  handleListSearches,
  handleCreateSearch,
  handleUpdateSearch,
  handleDeleteSearch,
  handleListCandidates,
  handleCreateCandidate,
  handleUpdateCandidate,
  handleGetStats,
} from './recruitment.controller';

import { authenticate, requireRoles } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const recruitmentRouter = Router();

// All recruitment routes require authentication and tenant resolution
recruitmentRouter.use(authenticate, resolveTenant);

// Stats
recruitmentRouter.get('/stats', handleGetStats);

// Searches
recruitmentRouter.get('/searches', handleListSearches);
recruitmentRouter.post(
  '/searches',
  requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'),
  handleCreateSearch,
);
recruitmentRouter.patch(
  '/searches/:id',
  requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'),
  handleUpdateSearch,
);
recruitmentRouter.delete(
  '/searches/:id',
  requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'),
  handleDeleteSearch,
);

// Candidates
recruitmentRouter.get('/candidates', handleListCandidates);
recruitmentRouter.post(
  '/candidates',
  requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'),
  handleCreateCandidate,
);
recruitmentRouter.patch(
  '/candidates/:id',
  requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'),
  handleUpdateCandidate,
);
