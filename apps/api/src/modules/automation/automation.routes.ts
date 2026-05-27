import type { Prisma } from '@prisma/client';
import { Router, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '@/config/database';
import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant, type TenantRequest } from '@/middlewares/tenant.middleware';

export const automationRouter = Router();

automationRouter.use(authenticate, resolveTenant);

const ruleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.enum(['SCHEDULE', 'EVENT', 'THRESHOLD', 'MANUAL', 'WEBHOOK']),
  triggerConfig: z.record(z.unknown()).default({}),
  actions: z.array(z.record(z.unknown())).default([]),
  tags: z.array(z.string()).default([]),
});

automationRouter.get('/stats', async (req: TenantRequest, res: Response, next) => {
  try {
    const companyId = req.companyId!;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [activeRules, executions] = await Promise.all([
      prisma.automationRule.count({ where: { companyId, status: 'ACTIVE' } }),
      prisma.automationExecution.findMany({
        where: { companyId, executedAt: { gte: startOfMonth } },
        select: { status: true },
      }),
    ]);

    const successCount = executions.filter((e) => e.status === 'SUCCESS').length;
    const successRate =
      executions.length > 0 ? Math.round((successCount / executions.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        activeRules,
        executionsThisMonth: executions.length,
        successRate,
      },
    });
  } catch (e) {
    next(e);
  }
});

automationRouter.get('/', async (req: TenantRequest, res: Response, next) => {
  try {
    const rules = await prisma.automationRule.findMany({
      where: { companyId: req.companyId! },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { executions: true } } },
    });
    res.json({ success: true, data: rules });
  } catch (e) {
    next(e);
  }
});

automationRouter.post('/', async (req: TenantRequest, res: Response, next) => {
  try {
    const body = ruleSchema.parse(req.body);
    const rule = await prisma.automationRule.create({
      data: {
        ...body,
        companyId: req.companyId!,
        triggerConfig: body.triggerConfig as Prisma.InputJsonValue,
        actions: body.actions as Prisma.InputJsonValue,
      },
    });
    res.status(201).json({ success: true, data: rule });
  } catch (e) {
    next(e);
  }
});

automationRouter.patch('/:id', async (req: TenantRequest, res: Response, next) => {
  try {
    const body = ruleSchema
      .extend({ status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']) })
      .partial()
      .parse(req.body);
    const { triggerConfig, actions, ...rest } = body;
    const updated = await prisma.automationRule.updateMany({
      where: { id: req.params.id, companyId: req.companyId! },
      data: {
        ...rest,
        ...(triggerConfig !== undefined && {
          triggerConfig: triggerConfig as Prisma.InputJsonValue,
        }),
        ...(actions !== undefined && { actions: actions as Prisma.InputJsonValue }),
      },
    });
    if (updated.count === 0) {
      res.status(404).json({ success: false, error: { message: 'Regla no encontrada' } });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

automationRouter.delete('/:id', async (req: TenantRequest, res: Response, next) => {
  try {
    await prisma.automationRule.updateMany({
      where: { id: req.params.id, companyId: req.companyId! },
      data: { status: 'INACTIVE' },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});
