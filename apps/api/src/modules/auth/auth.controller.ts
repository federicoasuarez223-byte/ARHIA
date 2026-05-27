import type { Request, Response } from 'express';

import { loginSchema, refreshSchema, registerSchema, changePasswordSchema } from './auth.schemas';
import * as AuthService from './auth.service';
import { AuthError } from './auth.service';

import { fail, ok, created } from '@/lib/response';
import type { AuthenticatedRequest } from '@/middlewares/auth.middleware';

function handleAuthError(res: Response, err: unknown) {
  if (err instanceof AuthError) {
    return fail(res, err.status, err.code, err.message);
  }
  return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
}

export async function handleLogin(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());
  }

  try {
    const result = await AuthService.login(parsed.data);
    ok(res, result);
  } catch (err) {
    handleAuthError(res, err);
  }
}

export async function handleRefresh(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());
  }

  try {
    const tokens = await AuthService.refresh(parsed.data.refreshToken);
    ok(res, tokens);
  } catch (err) {
    handleAuthError(res, err);
  }
}

export async function handleLogout(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await AuthService.logout(refreshToken).catch(() => null);
  }
  ok(res, { message: 'Sesión cerrada' });
}

export async function handleLogoutAll(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');
  await AuthService.logoutAll(req.user.sub);
  ok(res, { message: 'Todas las sesiones cerradas' });
}

export async function handleMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  try {
    const user = await AuthService.me(req.user.sub);
    ok(res, user);
  } catch (err) {
    handleAuthError(res, err);
  }
}

export async function handleRegister(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());
  }

  try {
    const result = await AuthService.register(parsed.data);
    created(res, result);
  } catch (err) {
    handleAuthError(res, err);
  }
}

export async function handleChangePassword(req: AuthenticatedRequest, res: Response) {
  if (!req.user) return fail(res, 401, 'UNAUTHORIZED', 'No autenticado');

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', parsed.error.flatten());
  }

  try {
    await AuthService.changePassword(
      req.user.sub,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    ok(res, { message: 'Contraseña actualizada. Por seguridad, volvé a iniciar sesión.' });
  } catch (err) {
    handleAuthError(res, err);
  }
}
