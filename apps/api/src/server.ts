import 'dotenv/config';
import http from 'http';

import { Server as SocketServer } from 'socket.io';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Socket.io setup (chat module)
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'https://app.arhia.ai'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Attach io instance for use in routes
  app.set('io', io);

  // Basic socket auth (will be expanded in PASO 4)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('Authentication required'));
    next();
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { id: socket.id });
    socket.on('disconnect', () => logger.info('Socket disconnected', { id: socket.id }));
  });

  // Graceful shutdown
  async function shutdown(signal: string) {
    logger.info(`${signal} received — shutting down`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      redis.disconnect();
      logger.info('Server shut down cleanly');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Start
  httpServer.listen(env.PORT, () => {
    logger.info(`ARHIA API running on port ${env.PORT}`, { env: env.NODE_ENV });
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
