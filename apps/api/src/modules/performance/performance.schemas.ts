import { z } from 'zod';

export const listPerformanceSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  employeeId: z.string().optional(),
  period: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
});

export const createPerformanceSchema = z.object({
  employeeId: z.string().min(1, 'employeeId requerido'),
  reviewerId: z.string().optional(),
  period: z.string().min(1, 'Período requerido'),
  type: z.enum(['ANNUAL', 'QUARTERLY', '180', '360']).default('ANNUAL'),
  goals: z.array(z.any()).optional(),
  comments: z.string().optional(),
});

export const updatePerformanceSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  score: z.number().int().min(0).max(100).optional(),
  potential: z.enum(['LOW', 'MEDIUM', 'HIGH', 'STAR']).optional().nullable(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  comments: z.string().optional(),
  reviewerId: z.string().optional().nullable(),
});

export type ListPerformanceDto = z.infer<typeof listPerformanceSchema>;
export type CreatePerformanceDto = z.infer<typeof createPerformanceSchema>;
export type UpdatePerformanceDto = z.infer<typeof updatePerformanceSchema>;
