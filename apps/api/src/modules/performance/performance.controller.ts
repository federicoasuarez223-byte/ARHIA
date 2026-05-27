import type { Response } from 'express';

import { listPerformanceSchema, createPerformanceSchema } from './performance.schemas';
import * as PerformanceService from './performance.service';
import { PerformanceError } from './performance.service';

import { fail, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof PerformanceError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleListReviews(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listPerformanceSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { reviews, total } = await PerformanceService.listReviews(req.companyId, parsed.data);
    paginatedOk(res, reviews, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreateReview(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createPerformanceSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const review = await PerformanceService.createReview(req.companyId, parsed.data);
    created(res, review);
  } catch (err) {
    handleError(res, err);
  }
}
