import type { Response } from 'express';

import {
  listAttendanceSchema,
  createAttendanceSchema,
  listLeavesSchema,
  createLeaveSchema,
  updateLeaveSchema,
} from './attendance.schemas';
import * as AttendanceService from './attendance.service';
import { AttendanceError } from './attendance.service';

import { fail, ok, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof AttendanceError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleListAttendance(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listAttendanceSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { records, total } = await AttendanceService.listAttendance(req.companyId, parsed.data);
    paginatedOk(res, records, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreateAttendance(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createAttendanceSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const record = await AttendanceService.createAttendance(req.companyId, parsed.data);
    created(res, record);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleListLeaves(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listLeavesSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { leaves, total } = await AttendanceService.listLeaves(req.companyId, parsed.data);
    paginatedOk(res, leaves, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreateLeave(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createLeaveSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const leave = await AttendanceService.createLeave(req.companyId, parsed.data);
    created(res, leave);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleUpdateLeave(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = updateLeaveSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const leave = await AttendanceService.updateLeave(req.companyId, req.params.id, parsed.data);
    ok(res, leave);
  } catch (err) {
    handleError(res, err);
  }
}
