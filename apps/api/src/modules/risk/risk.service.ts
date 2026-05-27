import type { Prisma } from '@prisma/client';

import type { ListRiskDto } from './risk.schemas';

import { prisma } from '@/config/database';

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
