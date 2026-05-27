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

export type ListPerformanceDto = z.infer<typeof listPerformanceSchema>;
export type CreatePerformanceDto = z.infer<typeof createPerformanceSchema>;
