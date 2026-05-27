import { Router, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '@/config/database';
import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant, type TenantRequest } from '@/middlewares/tenant.middleware';

export const trainingRouter = Router();

trainingRouter.use(authenticate, resolveTenant);

const planSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['SKILL', 'COMPLIANCE', 'LEADERSHIP', 'TECHNICAL', 'ONBOARDING']).default('SKILL'),
  provider: z.string().optional(),
  skills: z.array(z.string()).default([]),
  duration: z.coerce.number().int().positive().optional(),
  durationUnit: z.enum(['HOURS', 'DAYS', 'WEEKS']).default('HOURS'),
  cost: z.coerce.number().nonnegative().optional(),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  url: z.string().optional(),
});

trainingRouter.get('/stats', async (req: TenantRequest, res: Response, next) => {
  try {
    const companyId = req.companyId!;

    const [activePlans, enrollments] = await Promise.all([
      prisma.trainingPlan.count({ where: { companyId, isActive: true } }),
      prisma.trainingEnrollment.findMany({
        where: { companyId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
        select: { employeeId: true, progress: true, status: true },
      }),
    ]);

    const uniqueEmployees = new Set(enrollments.map((e) => e.employeeId)).size;
    const completed = await prisma.trainingEnrollment.findMany({
      where: { companyId, status: 'COMPLETED' },
      select: { progress: true },
    });
    const avgProgress =
      completed.length > 0
        ? Math.round(completed.reduce((sum, e) => sum + e.progress, 0) / completed.length)
        : 0;

    res.json({
      success: true,
      data: { activePlans, employeesInTraining: uniqueEmployees, avgCompletionPct: avgProgress },
    });
  } catch (e) {
    next(e);
  }
});

trainingRouter.get('/', async (req: TenantRequest, res: Response, next) => {
  try {
    const plans = await prisma.trainingPlan.findMany({
      where: { companyId: req.companyId!, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { enrollments: true } } },
    });
    res.json({ success: true, data: plans });
  } catch (e) {
    next(e);
  }
});

trainingRouter.post('/', async (req: TenantRequest, res: Response, next) => {
  try {
    const body = planSchema.parse(req.body);
    const plan = await prisma.trainingPlan.create({
      data: { ...body, companyId: req.companyId! },
    });
    res.status(201).json({ success: true, data: plan });
  } catch (e) {
    next(e);
  }
});

trainingRouter.patch('/:id', async (req: TenantRequest, res: Response, next) => {
  try {
    const body = planSchema.partial().parse(req.body);
    const plan = await prisma.trainingPlan.updateMany({
      where: { id: req.params.id, companyId: req.companyId! },
      data: body,
    });
    if (plan.count === 0) {
      res.status(404).json({ success: false, error: { message: 'Plan no encontrado' } });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

trainingRouter.delete('/:id', async (req: TenantRequest, res: Response, next) => {
  try {
    await prisma.trainingPlan.updateMany({
      where: { id: req.params.id, companyId: req.companyId! },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

trainingRouter.get('/:id/enrollments', async (req: TenantRequest, res: Response, next) => {
  try {
    const enrollments = await prisma.trainingEnrollment.findMany({
      where: { planId: req.params.id, companyId: req.companyId! },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: enrollments });
  } catch (e) {
    next(e);
  }
});
