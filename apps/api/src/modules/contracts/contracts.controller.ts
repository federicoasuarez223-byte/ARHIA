import type { Response } from 'express';

import {
  createContractSchema,
  updateContractSchema,
  listContractsSchema,
} from './contracts.schemas';
import * as ContractsService from './contracts.service';
import { ContractError } from './contracts.service';

import { fail, ok, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof ContractError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleList(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listContractsSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { contracts, total } = await ContractsService.listContracts(req.companyId, parsed.data);
    paginatedOk(res, contracts, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleGetOne(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const contract = await ContractsService.getContract(req.companyId, req.params.id);
    ok(res, contract);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createContractSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const contract = await ContractsService.createContract(req.companyId, parsed.data);
    created(res, contract);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleUpdate(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = updateContractSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const contract = await ContractsService.updateContract(
      req.companyId,
      req.params.id,
      parsed.data,
    );
    ok(res, contract);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleDelete(req: TenantRequest, res: Response) {
  if (!req.companyId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    await ContractsService.deleteContract(req.companyId, req.params.id);
    ok(res, { message: 'Contrato terminado correctamente' });
  } catch (err) {
    handleError(res, err);
  }
}
