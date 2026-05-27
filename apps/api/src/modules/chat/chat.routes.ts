import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import {
  handleListThreads,
  handleCreateThread,
  handleGetThread,
  handleDeleteThread,
  handleListMessages,
  handleSendMessage,
} from './chat.controller';

import { env } from '@/config/env';
import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant } from '@/middlewares/tenant.middleware';

export const chatRouter = Router();

const chatRateLimit = rateLimit({
  windowMs: 60_000,
  max: env.CHAT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  keyGenerator: (req) => {
    const r = req as typeof req & { user?: { sub?: string } };
    return r.user?.sub ?? req.ip ?? 'unknown';
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMIT', message: 'Demasiadas solicitudes al chat. Esperá un momento.' },
    });
  },
});

chatRouter.use(authenticate, resolveTenant);

// Thread management
chatRouter.get('/threads', handleListThreads);
chatRouter.post('/threads', handleCreateThread);
chatRouter.get('/threads/:threadId', handleGetThread);
chatRouter.delete('/threads/:threadId', handleDeleteThread);

// Messages
chatRouter.get('/threads/:threadId/messages', handleListMessages);
chatRouter.post('/threads/:threadId/messages', chatRateLimit, handleSendMessage);
