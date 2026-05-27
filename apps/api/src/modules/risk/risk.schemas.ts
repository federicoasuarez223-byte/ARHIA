import { z } from 'zod';

const riskLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const trendEnum = z.enum(['IMPROVING', 'STABLE', 'WORSENING']);

export const listRiskSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  level: riskLevelEnum.optional(),
  employeeId: z.string().optional(),
  trend: trendEnum.optional(),
  sortBy: z.enum(['level', 'overallScore', 'calculatedAt']).default('calculatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListRiskDto = z.infer<typeof listRiskSchema>;
