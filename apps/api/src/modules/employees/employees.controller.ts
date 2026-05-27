import type { Response } from 'express';

import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeesSchema,
} from './employees.schemas';
import * as EmployeesService from './employees.service';
import { EmployeeError } from './employees.service';

import { fail, ok, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof EmployeeError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleList(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listEmployeesSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { employees, total } = await EmployeesService.listEmployees(req.companyId, parsed.data);
    paginatedOk(res, employees, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleGetOne(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const employee = await EmployeesService.getEmployee(req.companyId, req.params.id);
    ok(res, employee);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createEmployeeSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const employee = await EmployeesService.createEmployee(req.companyId, parsed.data);
    created(res, employee);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleUpdate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = updateEmployeeSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const employee = await EmployeesService.updateEmployee(
      req.companyId,
      req.params.id,
      parsed.data,
    );
    ok(res, employee);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleDelete(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    await EmployeesService.deleteEmployee(req.companyId, req.params.id);
    ok(res, { message: 'Empleado desactivado correctamente' });
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleStats(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const stats = await EmployeesService.getEmployeeStats(req.companyId);
    ok(res, stats);
  } catch (err) {
    handleError(res, err);
  }
}
