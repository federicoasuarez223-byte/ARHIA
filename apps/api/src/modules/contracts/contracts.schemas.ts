import { z } from 'zod';

const contractTypeEnum = z.enum(['INDEFINIDO', 'PLAZO_FIJO', 'TEMPORADA', 'PASANTIA', 'EVENTUAL']);
const contractStatusEnum = z.enum([
  'DRAFT',
  'PENDING_SIGNATURE',
  'ACTIVE',
  'EXPIRED',
  'TERMINATED',
]);

export const createContractSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  type: contractTypeEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD')
    .optional(),
  position: z.string().min(1, 'Cargo requerido'),
  salary: z.number().positive('Salario debe ser positivo'),
  currency: z.string().default('ARS'),
  cct: z.string().optional(),
  cctCategory: z.string().optional(),
  workingHours: z.number().int().positive().default(48),
  trialPeriod: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const updateContractSchema = createContractSchema
  .omit({ employeeId: true })
  .partial()
  .extend({
    status: contractStatusEnum.optional(),
    signedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD')
      .optional(),
    signerName: z.string().optional(),
  });

export const listContractsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  employeeId: z.string().optional(),
  status: contractStatusEnum.optional(),
  type: contractTypeEnum.optional(),
  sortBy: z.enum(['startDate', 'salary', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateContractDto = z.infer<typeof createContractSchema>;
export type UpdateContractDto = z.infer<typeof updateContractSchema>;
export type ListContractsDto = z.infer<typeof listContractsSchema>;
