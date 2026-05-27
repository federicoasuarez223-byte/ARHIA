import type { Prisma } from '@prisma/client';
import { Router, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '@/config/database';
import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant, type TenantRequest } from '@/middlewares/tenant.middleware';

export const settingsRouter = Router();

settingsRouter.use(authenticate, resolveTenant);

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  legalName: z.string().min(1).optional(),
  cuit: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

const updatePreferencesSchema = z.object({
  currency: z.enum(['ARS', 'USD']).optional(),
  timezone: z.string().optional(),
});

settingsRouter.get('/', async (req: TenantRequest, res: Response, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId! },
      select: {
        id: true,
        name: true,
        legalName: true,
        cuit: true,
        phone: true,
        address: true,
        website: true,
        settings: true,
        plan: true,
        planExpiresAt: true,
        logoUrl: true,
      },
    });
    res.json({ success: true, data: company });
  } catch (e) {
    next(e);
  }
});

settingsRouter.patch('/company', async (req: TenantRequest, res: Response, next) => {
  try {
    const body = updateCompanySchema.parse(req.body);
    const { contactEmail, ...rest } = body;

    const currentSettings = await prisma.company.findUnique({
      where: { id: req.companyId! },
      select: { settings: true },
    });

    const existingSettings =
      typeof currentSettings?.settings === 'object' && currentSettings.settings !== null
        ? (currentSettings.settings as Prisma.JsonObject)
        : {};

    const updated = await prisma.company.update({
      where: { id: req.companyId! },
      data: {
        ...rest,
        settings: contactEmail ? { ...existingSettings, contactEmail } : existingSettings,
      },
      select: {
        id: true,
        name: true,
        legalName: true,
        cuit: true,
        phone: true,
        address: true,
        website: true,
        settings: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
});

settingsRouter.patch('/preferences', async (req: TenantRequest, res: Response, next) => {
  try {
    const body = updatePreferencesSchema.parse(req.body);

    const currentSettings = await prisma.company.findUnique({
      where: { id: req.companyId! },
      select: { settings: true },
    });

    const existingSettings =
      typeof currentSettings?.settings === 'object' && currentSettings.settings !== null
        ? (currentSettings.settings as Prisma.JsonObject)
        : {};

    const updated = await prisma.company.update({
      where: { id: req.companyId! },
      data: { settings: { ...existingSettings, ...body } },
      select: { id: true, settings: true },
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
});
