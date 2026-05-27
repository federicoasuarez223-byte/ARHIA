import type { Prisma } from '@prisma/client';

import type {
  ListPayrollDto,
  CreatePayrollDto,
  UpdatePayrollDto,
  GeneratePayrollDto,
} from './payroll.schemas';

import { prisma } from '@/config/database';

export class PayrollError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

// ─── Argentine deduction constants ───────────────────────────────────────────

const JUBILACION_RATE = 0.11;
const OBRA_SOCIAL_RATE = 0.03;
const ANSSAL_RATE = 0.005;
const LEY19032_RATE = 0.015;

function calculateDeductions(grossSalary: number) {
  const jubilacion = grossSalary * JUBILACION_RATE;
  const obraSocial = grossSalary * OBRA_SOCIAL_RATE;
  const anssal = grossSalary * ANSSAL_RATE;
  const ley19032 = grossSalary * LEY19032_RATE;
  const totalDeductions = jubilacion + obraSocial + anssal + ley19032;
  const netSalary = grossSalary - totalDeductions;

  return {
    jubilacion,
    obraSocial,
    anssal,
    ley19032,
    totalDeductions,
    netSalary,
  };
}

// ─── Selects ─────────────────────────────────────────────────────────────────

const payrollListSelect = {
  id: true,
  companyId: true,
  employeeId: true,
  period: true,
  periodYear: true,
  periodMonth: true,
  grossSalary: true,
  jubilacion: true,
  obraSocial: true,
  anssal: true,
  ley19032: true,
  totalDeductions: true,
  netSalary: true,
  extras: true,
  status: true,
  processedAt: true,
  paidAt: true,
  currency: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      legajo: true,
      department: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.PayrollRecordSelect;

// ─── Service functions ────────────────────────────────────────────────────────

export async function listPayroll(companyId: string, query: ListPayrollDto) {
  const { page, limit, employeeId, periodYear, periodMonth, status } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.PayrollRecordWhereInput = { companyId };

  if (employeeId) where.employeeId = employeeId;
  if (periodYear !== undefined) where.periodYear = periodYear;
  if (periodMonth !== undefined) where.periodMonth = periodMonth;
  if (status) where.status = status;

  const [records, total] = await Promise.all([
    prisma.payrollRecord.findMany({
      where,
      select: payrollListSelect,
      skip,
      take: limit,
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.payrollRecord.count({ where }),
  ]);

  return { records, total };
}

export async function getPayrollRecord(companyId: string, id: string) {
  const record = await prisma.payrollRecord.findFirst({
    where: { id, companyId },
    select: payrollListSelect,
  });

  if (!record) {
    throw new PayrollError('NOT_FOUND', 'Registro de nómina no encontrado', 404);
  }

  return record;
}

export async function createPayrollRecord(companyId: string, dto: CreatePayrollDto) {
  // Verify employee belongs to company
  const employee = await prisma.employee.findFirst({
    where: { id: dto.employeeId, companyId, isActive: true },
    select: { id: true },
  });
  if (!employee) {
    throw new PayrollError('EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
  }

  // Check uniqueness: one record per employee per period
  const existing = await prisma.payrollRecord.findFirst({
    where: {
      companyId,
      employeeId: dto.employeeId,
      periodYear: dto.periodYear,
      periodMonth: dto.periodMonth,
    },
    select: { id: true },
  });
  if (existing) {
    throw new PayrollError(
      'DUPLICATE_PERIOD',
      'Ya existe un registro de nómina para este empleado en el período indicado',
      409,
    );
  }

  const period = `${dto.periodYear}-${String(dto.periodMonth).padStart(2, '0')}`;
  const deductions = calculateDeductions(dto.grossSalary);

  const record = await prisma.payrollRecord.create({
    data: {
      companyId,
      employeeId: dto.employeeId,
      period,
      periodYear: dto.periodYear,
      periodMonth: dto.periodMonth,
      grossSalary: dto.grossSalary,
      jubilacion: deductions.jubilacion,
      obraSocial: deductions.obraSocial,
      anssal: deductions.anssal,
      ley19032: deductions.ley19032,
      totalDeductions: deductions.totalDeductions,
      netSalary: deductions.netSalary,
      extras: dto.extras ?? [],
      currency: dto.currency,
      notes: dto.notes,
    },
    select: payrollListSelect,
  });

  return record;
}

export async function updatePayrollRecord(companyId: string, id: string, dto: UpdatePayrollDto) {
  const existing = await prisma.payrollRecord.findFirst({
    where: { id, companyId },
    select: { id: true, status: true },
  });
  if (!existing) {
    throw new PayrollError('NOT_FOUND', 'Registro de nómina no encontrado', 404);
  }

  const updated = await prisma.payrollRecord.update({
    where: { id },
    data: {
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.paidAt !== undefined && { paidAt: new Date(dto.paidAt) }),
      ...(dto.status === 'PAID' && { paidAt: new Date() }),
      ...(dto.status === 'APPROVED' && { processedAt: new Date() }),
    },
    select: payrollListSelect,
  });

  return updated;
}

export async function generatePeriodPayroll(companyId: string, dto: GeneratePayrollDto) {
  const { periodYear, periodMonth } = dto;
  const period = `${periodYear}-${String(periodMonth).padStart(2, '0')}`;

  // Find all active employees for the company
  const employees = await prisma.employee.findMany({
    where: { companyId, isActive: true, employmentStatus: 'ACTIVE' },
    select: { id: true, salary: true, currency: true },
  });

  if (employees.length === 0) {
    return { created: 0, skipped: 0, total: 0 };
  }

  // Find employees that already have a record for this period
  const existingRecords = await prisma.payrollRecord.findMany({
    where: {
      companyId,
      periodYear,
      periodMonth,
    },
    select: { employeeId: true },
  });
  const existingEmployeeIds = new Set(existingRecords.map((r) => r.employeeId));

  const toCreate = employees.filter((e) => !existingEmployeeIds.has(e.id));

  if (toCreate.length === 0) {
    return { created: 0, skipped: employees.length, total: employees.length };
  }

  // Bulk create records
  await prisma.payrollRecord.createMany({
    data: toCreate.map((employee) => {
      const grossSalary = Number(employee.salary);
      const deductions = calculateDeductions(grossSalary);

      return {
        companyId,
        employeeId: employee.id,
        period,
        periodYear,
        periodMonth,
        grossSalary: deductions.netSalary + deductions.totalDeductions, // = grossSalary
        jubilacion: deductions.jubilacion,
        obraSocial: deductions.obraSocial,
        anssal: deductions.anssal,
        ley19032: deductions.ley19032,
        totalDeductions: deductions.totalDeductions,
        netSalary: deductions.netSalary,
        extras: [],
        currency: employee.currency,
        status: 'DRAFT',
      };
    }),
    skipDuplicates: true,
  });

  return {
    created: toCreate.length,
    skipped: existingEmployeeIds.size,
    total: employees.length,
  };
}

export async function getPayrollStats(
  companyId: string,
  periodYear?: number,
  periodMonth?: number,
) {
  const where: Prisma.PayrollRecordWhereInput = { companyId };
  if (periodYear !== undefined) where.periodYear = periodYear;
  if (periodMonth !== undefined) where.periodMonth = periodMonth;

  const [aggregate, employeeCount, byStatusGroups] = await Promise.all([
    prisma.payrollRecord.aggregate({
      where,
      _sum: {
        grossSalary: true,
        netSalary: true,
        totalDeductions: true,
      },
    }),
    prisma.payrollRecord.findMany({
      where,
      distinct: ['employeeId'],
      select: { employeeId: true },
    }),
    prisma.payrollRecord.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),
  ]);

  const byStatus: Record<string, number> = {
    DRAFT: 0,
    APPROVED: 0,
    PAID: 0,
  };
  for (const row of byStatusGroups) {
    byStatus[row.status] = row._count.status;
  }

  return {
    totalGross: aggregate._sum.grossSalary ?? 0,
    totalNet: aggregate._sum.netSalary ?? 0,
    totalDeductions: aggregate._sum.totalDeductions ?? 0,
    employeeCount: employeeCount.length,
    byStatus,
  };
}
