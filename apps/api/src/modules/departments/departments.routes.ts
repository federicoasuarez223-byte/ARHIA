import { Router } from 'express';

import {
  handleList,
  handleGetOne,
  handleCreate,
  handleUpdate,
  handleDelete,
} from './departments.controller';

import { authenticate, requireRoles } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const departmentsRouter = Router();

// All department routes require authentication and tenant resolution
departmentsRouter.use(authenticate, resolveTenant);

departmentsRouter.get('/', handleList);
departmentsRouter.get('/:id', handleGetOne);

departmentsRouter.post('/', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleCreate);
departmentsRouter.put('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleUpdate);
departmentsRouter.patch('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleUpdate);
departmentsRouter.delete('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleDelete);
