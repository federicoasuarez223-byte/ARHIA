import { Router } from 'express';

import {
  handleList,
  handleGetOne,
  handleCreate,
  handleUpdate,
  handleDelete,
} from './contracts.controller';

import { authenticate, requireRoles } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const contractsRouter = Router();

// All contract routes require authentication and tenant resolution
contractsRouter.use(authenticate, resolveTenant);

contractsRouter.get('/', handleList);
contractsRouter.get('/:id', handleGetOne);

contractsRouter.post('/', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleCreate);
contractsRouter.put('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleUpdate);
contractsRouter.patch('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleUpdate);
contractsRouter.delete('/:id', requireRoles('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), handleDelete);
