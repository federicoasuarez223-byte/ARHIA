import { Router } from 'express';

import {
  handleLogin,
  handleRefresh,
  handleLogout,
  handleLogoutAll,
  handleMe,
  handleRegister,
  handleChangePassword,
} from './auth.controller';

import { authenticate } from '@/middlewares/auth.middleware';

export const authRouter = Router();

// Public
authRouter.post('/login', handleLogin);
authRouter.post('/refresh', handleRefresh);
authRouter.post('/logout', handleLogout);
authRouter.post('/register', handleRegister);

// Protected
authRouter.get('/me', authenticate, handleMe);
authRouter.post('/logout-all', authenticate, handleLogoutAll);
authRouter.post('/change-password', authenticate, handleChangePassword);
