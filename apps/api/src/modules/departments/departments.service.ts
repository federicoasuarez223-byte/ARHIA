import type { Prisma } from '@prisma/client';

import type {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  ListDepartmentsDto,
} from './departments.schemas';

import { prisma } from '@/config/database';

export class DepartmentError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const departmentSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  headcount: true,
  budget: true,
  costCenter: true,
  isActive: true,
  managerId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DepartmentSelect;

export async function listDepartments(companyId: string, query: ListDepartmentsDto) {
  const { page, limit, search, isActive } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DepartmentWhereInput = {
    companyId,
    isActive,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where,
      select: departmentSelect,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.department.count({ where }),
  ]);

  return { departments, total };
}

export async function getDepartment(companyId: string, id: string) {
  const department = await prisma.department.findFirst({
    where: { id, companyId },
    select: departmentSelect,
  });

  if (!department) {
    throw new DepartmentError('NOT_FOUND', 'Departamento no encontrado', 404);
  }

  return department;
}

export async function createDepartment(companyId: string, dto: CreateDepartmentDto) {
  // Check code uniqueness within company if provided
  if (dto.code) {
    const existing = await prisma.department.findFirst({
      where: { companyId, code: dto.code },
    });
    if (existing) {
      throw new DepartmentError('CODE_TAKEN', 'Ya existe un departamento con ese código', 409);
    }
  }

  // Verify manager exists and belongs to company if provided
  if (dto.managerId) {
    const manager = await prisma.employee.findFirst({
      where: { id: dto.managerId, companyId, isActive: true },
    });
    if (!manager) {
      throw new DepartmentError('MANAGER_NOT_FOUND', 'Manager no encontrado', 404);
    }
  }

  const department = await prisma.department.create({
    data: {
      companyId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      budget: dto.budget,
      costCenter: dto.costCenter,
      managerId: dto.managerId,
      isActive: true,
    },
    select: departmentSelect,
  });

  return department;
}

export async function updateDepartment(companyId: string, id: string, dto: UpdateDepartmentDto) {
  const existing = await prisma.department.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    throw new DepartmentError('NOT_FOUND', 'Departamento no encontrado', 404);
  }

  if (dto.code && dto.code !== existing.code) {
    const codeTaken = await prisma.department.findFirst({
      where: { companyId, code: dto.code, id: { not: id } },
    });
    if (codeTaken) {
      throw new DepartmentError('CODE_TAKEN', 'Ya existe un departamento con ese código', 409);
    }
  }

  if (dto.managerId && dto.managerId !== existing.managerId) {
    const manager = await prisma.employee.findFirst({
      where: { id: dto.managerId, companyId, isActive: true },
    });
    if (!manager) {
      throw new DepartmentError('MANAGER_NOT_FOUND', 'Manager no encontrado', 404);
    }
  }

  const updated = await prisma.department.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.code !== undefined && { code: dto.code }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.budget !== undefined && { budget: dto.budget }),
      ...(dto.costCenter !== undefined && { costCenter: dto.costCenter }),
      ...(dto.managerId !== undefined && { managerId: dto.managerId }),
    },
    select: departmentSelect,
  });

  return updated;
}

export async function deleteDepartment(companyId: string, id: string) {
  const existing = await prisma.department.findFirst({
    where: { id, companyId },
    select: { id: true },
  });
  if (!existing) {
    throw new DepartmentError('NOT_FOUND', 'Departamento no encontrado', 404);
  }

  // Soft delete
  await prisma.department.update({
    where: { id },
    data: { isActive: false },
  });
}
