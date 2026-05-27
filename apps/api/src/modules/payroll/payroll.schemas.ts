import { z } from 'zod';

const payrollStatusEnum = z.enum(['DRAFT', 'APPROVED', 'PAID']);

export const listPayrollSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  employeeId: z.string().optional(),
  periodYear: z.coerce.number().int().optional(),
  periodMonth: z.coerce.number().int().optional(),
  status: payrollStatusEnum.optional(),
});

export const createPayrollSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  periodYear: z.number().int(),
  periodMonth: z.number().int().min(1).max(12),
  grossSalary: z.number().positive('El salario bruto debe ser positivo'),
  currency: z.string().default('ARS'),
  extras: z.array(z.object({ concept: z.string(), amount: z.number() })).optional(),
  notes: z.string().optional(),
});

export const updatePayrollSchema = z.object({
  status: payrollStatusEnum.optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional(),
});

export const generatePayrollSchema = z.object({
  periodYear: z.number().int(),
  periodMonth: z.number().int().min(1).max(12),
});

export type ListPayrollDto = z.infer<typeof listPayrollSchema>;
export type CreatePayrollDto = z.infer<typeof createPayrollSchema>;
export type UpdatePayrollDto = z.infer<typeof updatePayrollSchema>;
export type GeneratePayrollDto = z.infer<typeof generatePayrollSchema>;
