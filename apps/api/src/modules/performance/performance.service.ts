import type { Prisma } from '@prisma/client';

import type { ListPerformanceDto, CreatePerformanceDto } from './performance.schemas';

import { prisma } from '@/config/database';

export class PerformanceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

export async function listReviews(companyId: string, query: ListPerformanceDto) {
  const { page, limit, employeeId, period, status, type } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.PerformanceReviewWhereInput = { companyId };

  if (employeeId) where.employeeId = employeeId;
  if (period) where.period = period;
  if (status) where.status = status;
  if (type) where.type = type;

  const [reviews, total] = await Promise.all([
    prisma.performanceReview.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        employeeId: true,
        reviewerId: true,
        period: true,
        type: true,
        status: true,
        score: true,
        potential: true,
        goals: true,
        competencies: true,
        strengths: true,
        improvements: true,
        developmentPlan: true,
        comments: true,
        submittedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            legajo: true,
            department: { select: { name: true } },
          },
        },
        reviewer: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    prisma.performanceReview.count({ where }),
  ]);

  return { reviews, total };
}

export async function createReview(companyId: string, dto: CreatePerformanceDto) {
  const review = await prisma.performanceReview.create({
    data: {
      companyId,
      employeeId: dto.employeeId,
      reviewerId: dto.reviewerId ?? null,
      period: dto.period,
      type: dto.type,
      goals: dto.goals ?? [],
      comments: dto.comments,
    },
  });

  return review;
}
