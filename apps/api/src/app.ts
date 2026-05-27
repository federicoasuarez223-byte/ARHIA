import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { logger } from './config/logger';
import { redis } from './config/redis';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { attendanceRouter } from './modules/attendance/attendance.routes';
import { authRouter } from './modules/auth/auth.routes';
import { chatRouter } from './modules/chat/chat.routes';
import { contractsRouter } from './modules/contracts/contracts.routes';
import { departmentsRouter } from './modules/departments/departments.routes';
import { employeesRouter } from './modules/employees/employees.routes';
import { performanceRouter } from './modules/performance/performance.routes';
import { riskRouter } from './modules/risk/risk.routes';

export function createApp() {
  const app = express();

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS
  app.use(
    cors({
      origin: ['http://localhost:5173', 'https://app.arhia.ai', /\.arhia\.ai$/],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    }),
  );

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  app.use(
    morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    }),
  );

  // Global rate limiting
  app.use(
    '/api',
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      skip: () => env.NODE_ENV === 'test',
      handler: (_req, res) => {
        res.status(429).json({
          success: false,
          error: { code: 'RATE_LIMIT', message: 'Demasiadas solicitudes. Intentá más tarde.' },
        });
      },
    }),
  );

  // Health check
  app.get('/health', async (_req, res) => {
    const redisOk = await redis
      .ping()
      .then(() => true)
      .catch(() => false);
    res.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: { redis: redisOk ? 'ok' : 'error' },
    });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/employees', employeesRouter);
  app.use('/api/departments', departmentsRouter);
  app.use('/api/contracts', contractsRouter);
  app.use('/api', attendanceRouter);
  app.use('/api', riskRouter);
  app.use('/api/performance', performanceRouter);
  app.use('/api/chat', chatRouter);

  // 404 + error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
