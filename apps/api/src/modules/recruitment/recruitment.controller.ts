import type { Response } from 'express';

import {
  listSearchesSchema,
  createSearchSchema,
  updateSearchSchema,
  listCandidatesSchema,
  createCandidateSchema,
  updateCandidateSchema,
} from './recruitment.schemas';
import * as RecruitmentService from './recruitment.service';
import { RecruitmentError } from './recruitment.service';

import { fail, ok, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof RecruitmentError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

// ─── Searches ────────────────────────────────────────────────────────────────

export async function handleListSearches(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listSearchesSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { searches, total } = await RecruitmentService.listSearches(req.companyId, parsed.data);
    paginatedOk(res, searches, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreateSearch(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createSearchSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const search = await RecruitmentService.createSearch(req.companyId, parsed.data);
    created(res, search);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleUpdateSearch(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = updateSearchSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const search = await RecruitmentService.updateSearch(req.companyId, req.params.id, parsed.data);
    ok(res, search);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleDeleteSearch(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    await RecruitmentService.deleteSearch(req.companyId, req.params.id);
    ok(res, { message: 'Búsqueda cancelada correctamente' });
  } catch (err) {
    handleError(res, err);
  }
}

// ─── Candidates ──────────────────────────────────────────────────────────────

export async function handleListCandidates(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listCandidatesSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { candidates, total } = await RecruitmentService.listCandidates(
      req.companyId,
      parsed.data,
    );
    paginatedOk(res, candidates, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreateCandidate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createCandidateSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const candidate = await RecruitmentService.createCandidate(req.companyId, parsed.data);
    created(res, candidate);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleUpdateCandidate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = updateCandidateSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const candidate = await RecruitmentService.updateCandidate(
      req.companyId,
      req.params.id,
      parsed.data,
    );
    ok(res, candidate);
  } catch (err) {
    handleError(res, err);
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function handleGetStats(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const stats = await RecruitmentService.getStats(req.companyId);
    ok(res, stats);
  } catch (err) {
    handleError(res, err);
  }
}
