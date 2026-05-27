import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import type { JwtPayload } from '@arhia/shared';
import { env } from '@/config/env';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'Token inválido o expirado' } });
  }
}

export function requireRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No autenticado' } });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Sin permisos para esta acción' } });
      return;
    }

    next();
  };
}
