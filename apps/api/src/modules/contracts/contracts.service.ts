import type { Prisma } from '@prisma/client';

import type { CreateContractDto, UpdateContractDto, ListContractsDto } from './contracts.schemas';

import { prisma } from '@/config/database';

export class ContractError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

const contractSelect = {
  id: true,
  companyId: true,
  employeeId: true,
  type: true,
  status: true,
  startDate: true,
  endDate: true,
  position: true,
  salary: true,
  currency: true,
  cct: true,
  cctCategory: true,
  workingHours: true,
  trialPeriod: true,
  fileUrl: true,
  signedAt: true,
  signerName: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  employee: {
    select: {
      firstName: true,
      lastName: true,
      legajo: true,
      department: {
        select: { name: true },
      },
    },
  },
} satisfies Prisma.ContractSelect;

export async function listContracts(companyId: string, query: ListContractsDto) {
  const { page, limit, employeeId, status, type, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ContractWhereInput = {
    companyId,
  };

  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (type) where.type = type;

  const orderBy: Prisma.ContractOrderByWithRelationInput =
    sortBy === 'startDate'
      ? { startDate: sortOrder }
      : sortBy === 'salary'
        ? { salary: sortOrder }
        : { createdAt: sortOrder };

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      select: contractSelect,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.contract.count({ where }),
  ]);

  return { contracts, total };
}

export async function getContract(companyId: string, id: string) {
  const contract = await prisma.contract.findFirst({
    where: { id, companyId },
    select: contractSelect,
  });

  if (!contract) {
    throw new ContractError('NOT_FOUND', 'Contrato no encontrado', 404);
  }

  return contract;
}

export async function createContract(companyId: string, dto: CreateContractDto) {
  // Verify employee exists and belongs to company
  const employee = await prisma.employee.findFirst({
    where: { id: dto.employeeId, companyId, isActive: true },
  });
  if (!employee) {
    throw new ContractError('EMPLOYEE_NOT_FOUND', 'Empleado no encontrado', 404);
  }

  const contract = await prisma.contract.create({
    data: {
      companyId,
      employeeId: dto.employeeId,
      type: dto.type,
      status: 'DRAFT',
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      position: dto.position,
      salary: dto.salary,
      currency: dto.currency,
      cct: dto.cct,
      cctCategory: dto.cctCategory,
      workingHours: dto.workingHours,
      trialPeriod: dto.trialPeriod,
      notes: dto.notes,
    },
    select: contractSelect,
  });

  // Update employee's contractType field to match new contract
  await prisma.employee.update({
    where: { id: dto.employeeId },
    data: { contractType: dto.type },
  });

  return contract;
}

export async function updateContract(companyId: string, id: string, dto: UpdateContractDto) {
  const existing = await prisma.contract.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    throw new ContractError('NOT_FOUND', 'Contrato no encontrado', 404);
  }

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      ...(dto.position !== undefined && { position: dto.position }),
      ...(dto.salary !== undefined && { salary: dto.salary }),
      ...(dto.currency !== undefined && { currency: dto.currency }),
      ...(dto.cct !== undefined && { cct: dto.cct }),
      ...(dto.cctCategory !== undefined && { cctCategory: dto.cctCategory }),
      ...(dto.workingHours !== undefined && { workingHours: dto.workingHours }),
      ...(dto.trialPeriod !== undefined && { trialPeriod: dto.trialPeriod }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.signedAt !== undefined && { signedAt: new Date(dto.signedAt) }),
      ...(dto.signerName !== undefined && { signerName: dto.signerName }),
    },
    select: contractSelect,
  });

  // If contract type changed, sync employee's contractType
  if (dto.type && dto.type !== existing.type) {
    await prisma.employee.update({
      where: { id: existing.employeeId },
      data: { contractType: dto.type },
    });
  }

  return updated;
}

export async function deleteContract(companyId: string, id: string) {
  const existing = await prisma.contract.findFirst({
    where: { id, companyId },
    select: { id: true },
  });
  if (!existing) {
    throw new ContractError('NOT_FOUND', 'Contrato no encontrado', 404);
  }

  // Soft delete: set status to TERMINATED
  await prisma.contract.update({
    where: { id },
    data: { status: 'TERMINATED' },
  });
}
