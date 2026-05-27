import type { Response } from 'express';

import {
  listPayrollSchema,
  createPayrollSchema,
  updatePayrollSchema,
  generatePayrollSchema,
} from './payroll.schemas';
import * as PayrollService from './payroll.service';
import { PayrollError } from './payroll.service';

import { fail, ok, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof PayrollError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleList(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listPayrollSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { records, total } = await PayrollService.listPayroll(req.companyId, parsed.data);
    paginatedOk(res, records, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleGetOne(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const record = await PayrollService.getPayrollRecord(req.companyId, req.params.id);
    ok(res, record);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createPayrollSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const record = await PayrollService.createPayrollRecord(req.companyId, parsed.data);
    created(res, record);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleUpdate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = updatePayrollSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const record = await PayrollService.updatePayrollRecord(
      req.companyId,
      req.params.id,
      parsed.data,
    );
    ok(res, record);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleGenerate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = generatePayrollSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const result = await PayrollService.generatePeriodPayroll(req.companyId, parsed.data);
    ok(res, result);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleStats(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const periodYear = req.query.periodYear ? Number(req.query.periodYear) : undefined;
  const periodMonth = req.query.periodMonth ? Number(req.query.periodMonth) : undefined;

  try {
    const stats = await PayrollService.getPayrollStats(req.companyId, periodYear, periodMonth);
    ok(res, stats);
  } catch (err) {
    handleError(res, err);
  }
}
