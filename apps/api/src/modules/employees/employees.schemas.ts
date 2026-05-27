import { z } from 'zod';

const contractTypeEnum = z.enum(['INDEFINIDO', 'PLAZO_FIJO', 'TEMPORADA', 'PASANTIA', 'EVENTUAL']);
const employmentStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']);
const genderEnum = z.enum(['MASCULINO', 'FEMENINO', 'NO_BINARIO', 'PREFIERO_NO_DECIR']);

export const createEmployeeSchema = z.object({
  legajo: z.string().optional(),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  dni: z.string().optional(),
  cuil: z.string().optional(),
  birthDate: z.string().optional(),
  gender: genderEnum.optional(),
  departmentId: z.string().min(1, 'Departamento requerido'),
  position: z.string().min(1, 'Cargo requerido'),
  seniority: z.string().optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD'),
  contractType: contractTypeEnum.default('INDEFINIDO'),
  salary: z.number().positive('Salario debe ser positivo'),
  currency: z.string().default('ARS'),
  cct: z.string().optional(),
  cctCategory: z.string().optional(),
  vacationDays: z.number().int().min(14).default(14),
  city: z.string().optional(),
  province: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  emergencyContact: z
    .object({ name: z.string(), phone: z.string(), relation: z.string() })
    .optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  employmentStatus: employmentStatusEnum.optional(),
  terminationDate: z.string().optional(),
  usedVacationDays: z.number().int().min(0).optional(),
});

export const listEmployeesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  status: employmentStatusEnum.optional(),
  contractType: contractTypeEnum.optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  sortBy: z.enum(['lastName', 'hireDate', 'position', 'salary', 'createdAt']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesDto = z.infer<typeof listEmployeesSchema>;
