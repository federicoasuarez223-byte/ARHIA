import type { Prisma } from '@prisma/client';

import type { ListRiskDto } from './risk.schemas';

import { prisma } from '@/config/database';

// ─── Risk calculation ─────────────────────────────────────────────────────────

function toLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 70) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export async function calculateRiskForAll(companyId: string) {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [employees, absenceCounts] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId, isActive: true, employmentStatus: 'ACTIVE' },
      select: {
        id: true,
        hireDate: true,
        contractType: true,
        employmentStatus: true,
        seniority: true,
      },
    }),
    prisma.attendanceRecord.groupBy({
      by: ['employeeId'],
      where: { companyId, status: 'ABSENT', date: { gte: sixMonthsAgo } },
      _count: { id: true },
    }),
  ]);

  const absenceMap = new Map(absenceCounts.map((a) => [a.employeeId, a._count.id]));

  const previousScores = await prisma.riskScore.findMany({
    where: { companyId },
    orderBy: { calculatedAt: 'desc' },
    select: { employeeId: true, overallScore: true, calculatedAt: true },
  });
  const prevMap = new Map<string, number>();
  const seen = new Set<string>();
  for (const s of previousScores) {
    if (!seen.has(s.employeeId)) {
      prevMap.set(s.employeeId, s.overallScore);
      seen.add(s.employeeId);
    }
  }

  const created = await Promise.all(
    employees.map(async (emp) => {
      const tenureMonths = Math.floor(
        (now.getTime() - new Date(emp.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30),
      );

      // Flight risk: very low tenure or temporary contracts increase risk
      const tenureRisk = tenureMonths < 6 ? 60 : tenureMonths < 24 ? 30 : 15;
      const contractRisk =
        emp.contractType === 'PLAZO_FIJO' || emp.contractType === 'TEMPORADA' ? 25 : 0;
      const pasantiaRisk =
        emp.contractType === 'PASANTIA' || emp.contractType === 'EVENTUAL' ? 35 : 0;
      const flightRiskScore = Math.min(100, tenureRisk + contractRisk + pasantiaRisk);

      // Burnout risk: absences drive this
      const absences = absenceMap.get(emp.id) ?? 0;
      const burnoutScore = Math.min(100, absences * 8);

      // Engagement score: inverse of flight risk, modified by seniority
      const seniorityBonus =
        emp.seniority === 'SENIOR' || emp.seniority === 'LEAD' || emp.seniority === 'MANAGER'
          ? 15
          : 0;
      const engagementScore = Math.max(
        0,
        100 - flightRiskScore * 0.6 - burnoutScore * 0.2 + seniorityBonus,
      );

      // Satisfaction: rough heuristic
      const satisfactionScore = Math.max(0, 100 - burnoutScore * 0.5 - flightRiskScore * 0.3);

      const overallScore = Math.round(
        flightRiskScore * 0.4 + burnoutScore * 0.35 + (100 - engagementScore) * 0.25,
      );

      const prev = prevMap.get(emp.id);
      const trend =
        prev === undefined
          ? 'STABLE'
          : overallScore > prev + 5
            ? 'WORSENING'
            : overallScore < prev - 5
              ? 'IMPROVING'
              : 'STABLE';

      return prisma.riskScore.create({
        data: {
          companyId,
          employeeId: emp.id,
          level: toLevel(overallScore),
          overallScore,
          burnoutScore: Math.round(burnoutScore),
          flightRiskScore: Math.round(flightRiskScore),
          engagementScore: Math.round(engagementScore),
          satisfactionScore: Math.round(satisfactionScore),
          trend,
          calculatedAt: now,
        },
      });
    }),
  );

  return { calculated: created.length };
}

export class RiskError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

export async function listRiskScores(companyId: string, query: ListRiskDto) {
  const { page, limit, level, employeeId, trend, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.RiskScoreWhereInput = { companyId };

  if (level) where.level = level;
  if (employeeId) where.employeeId = employeeId;
  if (trend) where.trend = trend;

  // Get latest score per employee: fetch all matching, then deduplicate client-side
  // using a subquery approach: find max calculatedAt per employeeId
  const allScores = await prisma.riskScore.findMany({
    where,
    orderBy: { calculatedAt: 'desc' },
    select: {
      id: true,
      employeeId: true,
      level: true,
      overallScore: true,
      burnoutScore: true,
      flightRiskScore: true,
      engagementScore: true,
      satisfactionScore: true,
      factors: true,
      trend: true,
      aiAnalysis: true,
      recommendations: true,
      calculatedAt: true,
      createdAt: true,
      employee: {
        select: {
          firstName: true,
          lastName: true,
          legajo: true,
          position: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  // Deduplicate: keep only latest per employee
  const seen = new Set<string>();
  const deduplicated: typeof allScores = [];
  for (const score of allScores) {
    if (!seen.has(score.employeeId)) {
      seen.add(score.employeeId);
      deduplicated.push(score);
    }
  }

  // Apply secondary sort after deduplication
  deduplicated.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'overallScore') {
      comparison = a.overallScore - b.overallScore;
    } else if (sortBy === 'calculatedAt') {
      comparison = a.calculatedAt.getTime() - b.calculatedAt.getTime();
    } else {
      // level — sort by enum order
      const levelOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
      comparison = (levelOrder[a.level] ?? 0) - (levelOrder[b.level] ?? 0);
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const total = deduplicated.length;
  const records = deduplicated.slice(skip, skip + limit);

  return { records, total };
}

export async function getRiskStats(companyId: string) {
  const [countByLevel, avgScores, topAtRisk] = await Promise.all([
    prisma.riskScore.groupBy({
      by: ['level'],
      where: { companyId },
      _count: { level: true },
    }),
    prisma.riskScore.aggregate({
      where: { companyId },
      _avg: {
        overallScore: true,
        burnoutScore: true,
        flightRiskScore: true,
        engagementScore: true,
        satisfactionScore: true,
      },
    }),
    prisma.riskScore.findMany({
      where: { companyId, level: { in: ['HIGH', 'CRITICAL'] } },
      orderBy: { overallScore: 'desc' },
      take: 5,
      select: {
        id: true,
        level: true,
        overallScore: true,
        trend: true,
        calculatedAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            legajo: true,
            position: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const row of countByLevel) {
    counts[row.level] = row._count.level;
  }

  return {
    byLevel: {
      LOW: counts['LOW'] ?? 0,
      MEDIUM: counts['MEDIUM'] ?? 0,
      HIGH: counts['HIGH'] ?? 0,
      CRITICAL: counts['CRITICAL'] ?? 0,
    },
    averageScores: {
      overall: avgScores._avg.overallScore ?? 0,
      burnout: avgScores._avg.burnoutScore ?? 0,
      flightRisk: avgScores._avg.flightRiskScore ?? 0,
      engagement: avgScores._avg.engagementScore ?? 0,
      satisfaction: avgScores._avg.satisfactionScore ?? 0,
    },
    topAtRisk,
  };
}
