import type { Response } from 'express';

import {
  createThreadSchema,
  sendMessageSchema,
  listThreadsSchema,
  listMessagesSchema,
} from './chat.schemas';
import * as ChatService from './chat.service';
import { ChatError } from './chat.service';

import { fail, ok, created, paginatedOk } from '@/lib/response';
import type { TenantRequest } from '@/middlewares/tenant.middleware';

function handleError(res: Response, err: unknown) {
  if (err instanceof ChatError) {
    return fail(res, err.status, err.code, err.message);
  }
  console.error('Chat error:', err);
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

function getUserId(req: TenantRequest): string | undefined {
  return req.user?.sub;
}

export async function handleListThreads(req: TenantRequest, res: Response) {
  const companyId = req.companyId;
  const userId = getUserId(req);
  if (!companyId || !userId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listThreadsSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { threads, total } = await ChatService.listThreads(companyId, userId, parsed.data);
    paginatedOk(res, threads, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleCreateThread(req: TenantRequest, res: Response) {
  const companyId = req.companyId;
  const userId = getUserId(req);
  if (!companyId || !userId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const thread = await ChatService.createThread(companyId, userId, parsed.data);
    created(res, thread);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleGetThread(req: TenantRequest, res: Response) {
  const companyId = req.companyId;
  const userId = getUserId(req);
  if (!companyId || !userId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const thread = await ChatService.getThread(companyId, userId, req.params.threadId);
    ok(res, thread);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleDeleteThread(req: TenantRequest, res: Response) {
  const companyId = req.companyId;
  const userId = getUserId(req);
  if (!companyId || !userId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    await ChatService.deleteThread(companyId, userId, req.params.threadId);
    ok(res, { message: 'Conversación eliminada' });
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleListMessages(req: TenantRequest, res: Response) {
  const companyId = req.companyId;
  const userId = getUserId(req);
  if (!companyId || !userId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = listMessagesSchema.safeParse(req.query);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Parámetros inválidos', parsed.error.flatten());

  try {
    const { messages, total } = await ChatService.listMessages(
      companyId,
      userId,
      req.params.threadId,
      parsed.data,
    );
    paginatedOk(res, messages, total, parsed.data.page, parsed.data.limit);
  } catch (err) {
    handleError(res, err);
  }
}

export async function handleSendMessage(req: TenantRequest, res: Response) {
  const companyId = req.companyId;
  const userId = getUserId(req);
  if (!companyId || !userId) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());

  try {
    const result = await ChatService.sendMessage(
      companyId,
      userId,
      req.params.threadId,
      parsed.data,
      res,
    );

    // null means streaming was initiated and res is already handled
    if (result !== null) {
      ok(res, result);
    }
  } catch (err) {
    if (!res.headersSent) {
      handleError(res, err);
    }
  }
}
