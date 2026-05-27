import { Router } from 'express';

import {
  handleListAttendance,
  handleCreateAttendance,
  handleListLeaves,
  handleCreateLeave,
  handleUpdateLeave,
} from './attendance.controller';

import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate, resolveTenant);

attendanceRouter.get('/attendance', handleListAttendance);
attendanceRouter.post('/attendance', handleCreateAttendance);

attendanceRouter.get('/attendance/leaves', handleListLeaves);
attendanceRouter.post('/attendance/leaves', handleCreateLeave);
attendanceRouter.patch('/attendance/leaves/:id', handleUpdateLeave);
