import { z } from 'zod';

const attendanceStatusEnum = z.enum([
  'PRESENT',
  'ABSENT',
  'LATE',
  'HALF_DAY',
  'REMOTE',
  'HOLIDAY',
  'LEAVE',
]);

const leaveTypeEnum = z.enum([
  'VACACIONES',
  'ENFERMEDAD',
  'LICENCIA_PERSONAL',
  'LICENCIA_MATERNIDAD',
  'LICENCIA_PATERNIDAD',
  'ESTUDIO',
  'DUELO',
]);

const leaveStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

export const listAttendanceSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  employeeId: z.string().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD')
    .optional(),
  status: attendanceStatusEnum.optional(),
});

export const createAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'employeeId requerido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD'),
  status: attendanceStatusEnum.default('PRESENT'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  hoursWorked: z.number().optional(),
  notes: z.string().optional(),
});

export const createLeaveSchema = z.object({
  employeeId: z.string().min(1, 'employeeId requerido'),
  type: leaveTypeEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD'),
  days: z.number().int().min(1),
  reason: z.string().optional(),
});

export const updateLeaveSchema = z.object({
  status: leaveStatusEnum.optional(),
  approvedBy: z.string().optional(),
  reason: z.string().optional(),
});

export const listLeavesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  employeeId: z.string().optional(),
  status: leaveStatusEnum.optional(),
  type: leaveTypeEnum.optional(),
});

export type ListAttendanceDto = z.infer<typeof listAttendanceSchema>;
export type CreateAttendanceDto = z.infer<typeof createAttendanceSchema>;
export type CreateLeaveDto = z.infer<typeof createLeaveSchema>;
export type UpdateLeaveDto = z.infer<typeof updateLeaveSchema>;
export type ListLeavesDto = z.infer<typeof listLeavesSchema>;
