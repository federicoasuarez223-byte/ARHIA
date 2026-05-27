import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { logger } from '@/config/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code, details: err.details });
    }
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Recurso no encontrado' },
  });
}
