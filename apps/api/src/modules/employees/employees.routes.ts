import { Router } from 'express';

import {
  handleList,
  handleGetOne,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleStats,
} from './employees.controller';

import { authenticate, requireRoles } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const employeesRouter = Router();

// All employee routes require authentication and tenant resolution
employeesRouter.use(authenticate, resolveTenant);

employeesRouter.get('/stats', handleStats);

employeesRouter.get('/', handleList);
employeesRouter.get('/:id', handleGetOne);

employeesRouter.post('/', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleCreate);
employeesRouter.put('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleUpdate);
employeesRouter.patch('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleUpdate);
employeesRouter.delete('/:id', requireRoles('SUPER_ADMIN', 'ADMIN'), handleDelete);
