import { Router, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '@/config/database';
import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant, type TenantRequest } from '@/middlewares/tenant.middleware';

export const cultureRouter = Router();

cultureRouter.use(authenticate, resolveTenant);

const recognitionSchema = z.object({
  recipientId: z.string().uuid(),
  giverId: z.string().uuid(),
  type: z.enum(['LOGRO', 'ANTIGUEDAD', 'COMPANERO', 'LIDERAZGO', 'INNOVACION', 'CLIENTE']),
  title: z.string().min(1),
  message: z.string().min(1),
  isPublic: z.boolean().default(true),
  points: z.coerce.number().int().nonnegative().default(0),
});

cultureRouter.get('/stats', async (req: TenantRequest, res: Response, next) => {
  try {
    const companyId = req.companyId!;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [thisMonth, byType] = await Promise.all([
      prisma.recognition.count({ where: { companyId, createdAt: { gte: startOfMonth } } }),
      prisma.recognition.groupBy({
        by: ['type'],
        where: { companyId },
        _count: { id: true },
      }),
    ]);

    const typeCounts = Object.fromEntries(byType.map((r) => [r.type, r._count.id]));

    res.json({ success: true, data: { thisMonth, byType: typeCounts } });
  } catch (e) {
    next(e);
  }
});

cultureRouter.get('/recognitions', async (req: TenantRequest, res: Response, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const [total, items] = await Promise.all([
      prisma.recognition.count({ where: { companyId: req.companyId! } }),
      prisma.recognition.findMany({
        where: { companyId: req.companyId! },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          giver: { select: { id: true, firstName: true, lastName: true } },
          recipient: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    next(e);
  }
});

cultureRouter.post('/recognitions', async (req: TenantRequest, res: Response, next) => {
  try {
    const body = recognitionSchema.parse(req.body);
    const recognition = await prisma.recognition.create({
      data: { ...body, companyId: req.companyId! },
      include: {
        giver: { select: { id: true, firstName: true, lastName: true } },
        recipient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    res.status(201).json({ success: true, data: recognition });
  } catch (e) {
    next(e);
  }
});
