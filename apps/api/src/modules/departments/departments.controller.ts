import type { Response } from 'express';

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  listDepartmentsSchema,
} from './departments.schemas';
import * as DepartmentsService from './departments.service';
import { DepartmentError } from './departments.service';

import { fail, ok, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof DepartmentError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleList(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listDepartmentsSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { departments, total } = await DepartmentsService.listDepartments(
      req.companyId,
      parsed.data,
    );
    paginatedOk(res, departments, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleGetOne(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const department = await DepartmentsService.getDepartment(req.companyId, req.params.id);
    ok(res, department);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createDepartmentSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const department = await DepartmentsService.createDepartment(req.companyId, parsed.data);
    created(res, department);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleUpdate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = updateDepartmentSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const department = await DepartmentsService.updateDepartment(
      req.companyId,
      req.params.id,
      parsed.data,
    );
    ok(res, department);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleDelete(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    await DepartmentsService.deleteDepartment(req.companyId, req.params.id);
    ok(res, { message: 'Departamento desactivado correctamente' });
  } catch (err) {
    handleError(res, err);
  }
}
