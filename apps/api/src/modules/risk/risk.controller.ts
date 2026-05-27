import type { Response } from 'express';

import { listRiskSchema } from './risk.schemas';
import * as RiskService from './risk.service';
import { RiskError } from './risk.service';

import { fail, ok, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof RiskError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleListRiskScores(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listRiskSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { records, total } = await RiskService.listRiskScores(req.companyId, parsed.data);
    paginatedOk(res, records, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleGetRiskStats(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const stats = await RiskService.getRiskStats(req.companyId);
    ok(res, stats);
  } catch (err) {
    handleError(res, err);
  }
}
