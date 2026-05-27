import { Router, type Response } from 'express';

import { prisma } from '@/config/database';
import { authenticate } from '@/middlewares/auth.middleware';
import { resolveTenant, type TenantRequest } from '@/middlewares/tenant.middleware';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate, resolveTenant);

notificationsRouter.get('/', async (req: TenantRequest, res: Response, next) => {
  try {
    const companyId = req.companyId!;
    const now = new Date();
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);

    const [criticalRisks, expiringContracts, recentHires] = await Promise.all([
      prisma.riskScore.findMany({
        where: {
          companyId,
          level: { in: ['CRITICAL', 'HIGH'] },
          calculatedAt: { gte: last7Days },
        },
        orderBy: { overallScore: 'desc' },
        take: 5,
        include: { employee: { select: { firstName: true, lastName: true } } },
      }),
      prisma.contract.findMany({
        where: {
          companyId,
          status: 'ACTIVE',
          endDate: { gte: now, lte: in30Days },
        },
        orderBy: { endDate: 'asc' },
        take: 5,
        include: { employee: { select: { firstName: true, lastName: true } } },
      }),
      prisma.employee.findMany({
        where: { companyId, hireDate: { gte: last7Days }, isActive: true },
        orderBy: { hireDate: 'desc' },
        take: 3,
        select: { id: true, firstName: true, lastName: true, position: true, hireDate: true },
      }),
    ]);

    const notifications = [
      ...criticalRisks.map((r) => ({
        id: `risk-${r.id}`,
        type: r.level === 'CRITICAL' ? ('danger' as const) : ('warning' as const),
        title:
          r.level === 'CRITICAL'
            ? `Riesgo crítico: ${r.employee.firstName} ${r.employee.lastName}`
            : `Riesgo alto: ${r.employee.firstName} ${r.employee.lastName}`,
        body: `Score ${r.overallScore}/100 · Burnout ${r.burnoutScore} · Fuga ${r.flightRiskScore}`,
        href: '/risk',
        createdAt: r.calculatedAt.toISOString(),
      })),
      ...expiringContracts.map((c) => {
        const daysLeft = Math.ceil(
          (new Date(c.endDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          id: `contract-${c.id}`,
          type: 'warning' as const,
          title: `Contrato vence pronto: ${c.employee.firstName} ${c.employee.lastName}`,
          body: `Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''} · ${c.type}`,
          href: '/contracts',
          createdAt: c.updatedAt.toISOString(),
        };
      }),
      ...recentHires.map((e) => ({
        id: `hire-${e.id}`,
        type: 'info' as const,
        title: `Nuevo ingreso: ${e.firstName} ${e.lastName}`,
        body: e.position,
        href: `/employees/${e.id}`,
        createdAt: new Date(e.hireDate).toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: notifications });
  } catch (e) {
    next(e);
  }
});
