import { Router } from 'express';

import {
  handleList,
  handleGetOne,
  handleCreate,
  handleUpdate,
  handleGenerate,
  handleStats,
} from './payroll.controller';

import { authenticate, requireRoles } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const payrollRouter = Router();

// All payroll routes require authentication and tenant resolution
payrollRouter.use(authenticate, resolveTenant);

// Stats — must be before /:id to avoid param conflict
payrollRouter.get('/stats', handleStats);

// Bulk generate
payrollRouter.post('/generate', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleGenerate);

// CRUD
payrollRouter.get('/', handleList);
payrollRouter.get('/:id', handleGetOne);

payrollRouter.post('/', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleCreate);
payrollRouter.patch('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleUpdate);
