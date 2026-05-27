import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  code: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().positive('Presupuesto debe ser positivo').optional(),
  costCenter: z.string().optional(),
  managerId: z.string().uuid('ID de manager inválido').optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const listDepartmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
export type ListDepartmentsDto = z.infer<typeof listDepartmentsSchema>;
