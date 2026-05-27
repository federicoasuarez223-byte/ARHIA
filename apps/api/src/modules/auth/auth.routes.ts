import { Router } from 'express';

export const authRouter = Router();

// Placeholder — full implementation in PASO 3
authRouter.get('/status', (_req, res) => {
  res.json({ success: true, data: { status: 'Auth module — coming in PASO 3' } });
});
