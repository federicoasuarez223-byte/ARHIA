import type { Prisma } from '@prisma/client';

import type { CreateEmployeeDto, UpdateEmployeeDto, ListEmployeesDto } from './employees.schemas';

import { prisma } from '@/config/database';

export class EmployeeError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

// Full employee select — used for detail view
const employeeSelect = {
  id: true,
  legajo: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  dni: true,
  cuil: true,
  birthDate: true,
  gender: true,
  position: true,
  seniority: true,
  hireDate: true,
  terminationDate: true,
  employmentStatus: true,
  contractType: true,
  salary: true,
  currency: true,
  cct: true,
  cctCategory: true,
  vacationDays: true,
  usedVacationDays: true,
  city: true,
  province: true,
  address: true,
  avatarUrl: true,
  notes: true,
  documents: true,
  emergencyContact: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: {
    select: { id: true, name: true, code: true },
  },
  riskScores: {
    orderBy: { calculatedAt: 'desc' as const },
    take: 1,
    select: { level: true, overallScore: true, burnoutScore: true, trend: true },
  },
  contracts: {
    where: { status: 'ACTIVE' as const },
    take: 1,
    select: { id: true, type: true, status: true, startDate: true, endDate: true },
  },
} satisfies Prisma.EmployeeSelect;

// List select — lighter for table view
const listSelect = {
  id: true,
  legajo: true,
  firstName: true,
  lastName: true,
  email: true,
  avatarUrl: true,
  position: true,
  seniority: true,
  employmentStatus: true,
  contractType: true,
  hireDate: true,
  salary: true,
  currency: true,
  department: { select: { id: true, name: true } },
  riskScores: {
    orderBy: { calculatedAt: 'desc' as const },
    take: 1,
    select: { level: true, overallScore: true },
  },
} satisfies Prisma.EmployeeSelect;

export async function listEmployees(companyId: string, query: ListEmployeesDto) {
  const { page, limit, search, departmentId, status, contractType, riskLevel, sortBy, sortOrder } =
    query;
  const skip = (page - 1) * limit;

  const where: Prisma.EmployeeWhereInput = {
    companyId,
    isActive: true,
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { legajo: { contains: search, mode: 'insensitive' } },
      { position: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (departmentId) where.departmentId = departmentId;
  if (status) where.employmentStatus = status;
  if (contractType) where.contractType = contractType;

  if (riskLevel) {
    where.riskScores = { some: { level: riskLevel } };
  }

  const orderBy: Prisma.EmployeeOrderByWithRelationInput =
    sortBy === 'lastName'
      ? { lastName: sortOrder }
      : sortBy === 'hireDate'
        ? { hireDate: sortOrder }
        : sortBy === 'salary'
          ? { salary: sortOrder }
          : sortBy === 'createdAt'
            ? { createdAt: sortOrder }
            : { position: sortOrder };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({ where, select: listSelect, skip, take: limit, orderBy }),
    prisma.employee.count({ where }),
  ]);

  return { employees, total };
}

export async function getEmployee(companyId: string, id: string) {
  const employee = await prisma.employee.findFirst({
    where: { id, companyId, isActive: true },
    select: employeeSelect,
  });

  if (!employee) {
    throw new EmployeeError('NOT_FOUND', 'Empleado no encontrado', 404);
  }

  return employee;
}

export async function createEmployee(companyId: string, dto: CreateEmployeeDto) {
  // Check email uniqueness within company
  const existing = await prisma.employee.findFirst({
    where: { companyId, email: dto.email.toLowerCase() },
  });
  if (existing) {
    throw new EmployeeError('EMAIL_TAKEN', 'Ya existe un empleado con ese email', 409);
  }

  // Verify department exists and belongs to company
  const dept = await prisma.department.findFirst({
    where: { id: dto.departmentId, companyId },
  });
  if (!dept) {
    throw new EmployeeError('DEPT_NOT_FOUND', 'Departamento no encontrado', 404);
  }

  // Auto-generate legajo if not provided — find next available number
  let legajo = dto.legajo;
  if (!legajo) {
    const existing = await prisma.employee.findMany({
      where: { companyId },
      select: { legajo: true },
    });
    const nums = existing
      .map((e) => parseInt(e.legajo?.replace(/\D/g, '') ?? '0', 10))
      .filter((n) => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    legajo = `TS-${String(next).padStart(3, '0')}`;
  }

  const employee = await prisma.employee.create({
    data: {
      companyId,
      legajo,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      dni: dto.dni,
      cuil: dto.cuil,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      gender: dto.gender,
      departmentId: dto.departmentId,
      position: dto.position,
      seniority: dto.seniority,
      hireDate: new Date(dto.hireDate),
      contractType: dto.contractType,
      salary: dto.salary,
      currency: dto.currency,
      cct: dto.cct,
      cctCategory: dto.cctCategory,
      vacationDays: dto.vacationDays,
      city: dto.city,
      province: dto.province,
      address: dto.address,
      notes: dto.notes,
      emergencyContact: dto.emergencyContact ?? undefined,
      isActive: true,
    },
    select: employeeSelect,
  });

  // Update department headcount
  await prisma.department.update({
    where: { id: dto.departmentId },
    data: { headcount: { increment: 1 } },
  });

  return employee;
}

export async function updateEmployee(companyId: string, id: string, dto: UpdateEmployeeDto) {
  const existing = await prisma.employee.findFirst({
    where: { id, companyId, isActive: true },
  });
  if (!existing) {
    throw new EmployeeError('NOT_FOUND', 'Empleado no encontrado', 404);
  }

  if (dto.email && dto.email.toLowerCase() !== existing.email) {
    const emailTaken = await prisma.employee.findFirst({
      where: { companyId, email: dto.email.toLowerCase(), id: { not: id } },
    });
    if (emailTaken) {
      throw new EmployeeError('EMAIL_TAKEN', 'Ya existe un empleado con ese email', 409);
    }
  }

  if (dto.departmentId && dto.departmentId !== existing.departmentId) {
    const dept = await prisma.department.findFirst({ where: { id: dto.departmentId, companyId } });
    if (!dept) throw new EmployeeError('DEPT_NOT_FOUND', 'Departamento no encontrado', 404);

    // Update headcounts
    await Promise.all([
      prisma.department.update({
        where: { id: existing.departmentId! },
        data: { headcount: { decrement: 1 } },
      }),
      prisma.department.update({
        where: { id: dto.departmentId },
        data: { headcount: { increment: 1 } },
      }),
    ]);
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      ...(dto.firstName && { firstName: dto.firstName }),
      ...(dto.lastName && { lastName: dto.lastName }),
      ...(dto.email && { email: dto.email.toLowerCase() }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.dni !== undefined && { dni: dto.dni }),
      ...(dto.cuil !== undefined && { cuil: dto.cuil }),
      ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
      ...(dto.gender && { gender: dto.gender }),
      ...(dto.departmentId && { departmentId: dto.departmentId }),
      ...(dto.position && { position: dto.position }),
      ...(dto.seniority !== undefined && { seniority: dto.seniority }),
      ...(dto.hireDate && { hireDate: new Date(dto.hireDate) }),
      ...(dto.contractType && { contractType: dto.contractType }),
      ...(dto.salary !== undefined && { salary: dto.salary }),
      ...(dto.currency && { currency: dto.currency }),
      ...(dto.cct !== undefined && { cct: dto.cct }),
      ...(dto.cctCategory !== undefined && { cctCategory: dto.cctCategory }),
      ...(dto.vacationDays !== undefined && { vacationDays: dto.vacationDays }),
      ...(dto.usedVacationDays !== undefined && { usedVacationDays: dto.usedVacationDays }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.province !== undefined && { province: dto.province }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.emergencyContact && { emergencyContact: dto.emergencyContact }),
      ...(dto.employmentStatus && { employmentStatus: dto.employmentStatus }),
      ...(dto.terminationDate && { terminationDate: new Date(dto.terminationDate) }),
    },
    select: employeeSelect,
  });

  return updated;
}

export async function deleteEmployee(companyId: string, id: string) {
  const existing = await prisma.employee.findFirst({
    where: { id, companyId, isActive: true },
    select: { id: true, departmentId: true },
  });
  if (!existing) {
    throw new EmployeeError('NOT_FOUND', 'Empleado no encontrado', 404);
  }

  // Soft delete
  await prisma.employee.update({
    where: { id },
    data: {
      isActive: false,
      employmentStatus: 'TERMINATED',
      terminationDate: new Date(),
    },
  });

  if (existing.departmentId) {
    await prisma.department.update({
      where: { id: existing.departmentId },
      data: { headcount: { decrement: 1 } },
    });
  }
}

export async function getEmployeeStats(companyId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    total,
    active,
    onLeave,
    terminated,
    newThisMonth,
    byDepartment,
    byContractType,
    riskCritical,
    riskHigh,
  ] = await Promise.all([
    prisma.employee.count({ where: { companyId, isActive: true } }),
    prisma.employee.count({ where: { companyId, isActive: true, employmentStatus: 'ACTIVE' } }),
    prisma.employee.count({ where: { companyId, isActive: true, employmentStatus: 'ON_LEAVE' } }),
    prisma.employee.count({ where: { companyId, isActive: true, employmentStatus: 'TERMINATED' } }),
    prisma.employee.count({
      where: { companyId, isActive: true, hireDate: { gte: startOfMonth } },
    }),
    prisma.department.findMany({
      where: { companyId },
      select: { name: true, headcount: true },
      orderBy: { headcount: 'desc' },
    }),
    prisma.employee.groupBy({
      by: ['contractType'],
      where: { companyId, isActive: true },
      _count: { contractType: true },
    }),
    prisma.riskScore.count({ where: { companyId, level: 'CRITICAL' } }),
    prisma.riskScore.count({ where: { companyId, level: 'HIGH' } }),
  ]);

  return {
    total,
    active,
    onLeave,
    terminated,
    newThisMonth,
    riskCritical,
    riskHigh,
    byDepartment: byDepartment.map((d) => ({ name: d.name, count: d.headcount })),
    byContractType: byContractType.map((c) => ({
      type: c.contractType,
      count: c._count.contractType,
    })),
  };
}
