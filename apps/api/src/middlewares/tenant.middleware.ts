import type { Response, NextFunction } from 'express';

import type { AuthenticatedRequest } from './auth.middleware';
import { prisma } from '@/config/database';

export interface TenantRequest extends AuthenticatedRequest {
  tenantSchema?: string;
  companyId?: string;
}

export async function resolveTenant(req: TenantRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    next();
    return;
  }

  try {
    const tenantId =
      req.headers['x-tenant-id'] as string ||
      req.user.companyId;

    if (!tenantId) {
      res.status(400).json({ success: false, error: { code: 'TENANT_MISSING', message: 'Tenant no identificado' } });
      return;
    }

    const company = await prisma.company.findUnique({
      where: { id: tenantId },
      select: { id: true, tenantSchema: true, isActive: true },
    });

    if (!company || !company.isActive) {
      res.status(403).json({ success: false, error: { code: 'TENANT_INACTIVE', message: 'Empresa inactiva o no encontrada' } });
      return;
    }

    req.companyId = company.id;
    req.tenantSchema = company.tenantSchema;
    next();
  } catch {
    res.status(500).json({ success: false, error: { code: 'TENANT_ERROR', message: 'Error al resolver tenant' } });
  }
}
