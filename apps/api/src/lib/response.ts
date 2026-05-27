import type { Response } from 'express';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>, status = 200) {
  const body: ApiSuccess<T> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(status).json(body);
}

export function created<T>(res: Response, data: T) {
  ok(res, data, undefined, 201);
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ApiError = { success: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;
  res.status(status).json(body);
}

export function paginatedOk<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  ok(res, data, { total, page, limit, pages: Math.ceil(total / limit) });
}
