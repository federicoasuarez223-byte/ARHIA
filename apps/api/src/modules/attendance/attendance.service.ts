import type { Prisma } from '@prisma/client';

import type {
  ListAttendanceDto,
  CreateAttendanceDto,
  CreateLeaveDto,
  UpdateLeaveDto,
  ListLeavesDto,
} from './attendance.schemas';

import { prisma } from '@/config/database';

export class AttendanceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

export async function listAttendance(companyId: string, query: ListAttendanceDto) {
  const { page, limit, employeeId, dateFrom, dateTo, status } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.AttendanceRecordWhereInput = { companyId };

  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.date = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    };
  }

  const [records, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        employeeId: true,
        date: true,
        status: true,
        checkIn: true,
        checkOut: true,
        hoursWorked: true,
        overtime: true,
        notes: true,
        createdAt: true,
        employee: {
          select: { firstName: true, lastName: true, legajo: true },
        },
      },
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return { records, total };
}

export async function createAttendance(companyId: string, dto: CreateAttendanceDto) {
  const record = await prisma.attendanceRecord.upsert({
    where: {
      companyId_employeeId_date: {
        companyId,
        employeeId: dto.employeeId,
        date: new Date(dto.date),
      },
    },
    update: {
      status: dto.status,
      ...(dto.checkIn !== undefined && { checkIn: dto.checkIn ? new Date(dto.checkIn) : null }),
      ...(dto.checkOut !== undefined && {
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
      }),
      ...(dto.hoursWorked !== undefined && { hoursWorked: dto.hoursWorked }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    },
    create: {
      companyId,
      employeeId: dto.employeeId,
      date: new Date(dto.date),
      status: dto.status,
      checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
      checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
      hoursWorked: dto.hoursWorked ?? undefined,
      notes: dto.notes,
    },
  });

  return record;
}

export async function listLeaves(companyId: string, query: ListLeavesDto) {
  const { page, limit, employeeId, status, type } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.LeaveRequestWhereInput = { companyId };

  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (type) where.type = type;

  const [leaves, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        employeeId: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        days: true,
        reason: true,
        approvedBy: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: { firstName: true, lastName: true, legajo: true },
        },
      },
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  return { leaves, total };
}

export async function createLeave(companyId: string, dto: CreateLeaveDto) {
  const leave = await prisma.leaveRequest.create({
    data: {
      companyId,
      employeeId: dto.employeeId,
      type: dto.type,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      days: dto.days,
      reason: dto.reason,
    },
  });

  return leave;
}

export async function updateLeave(companyId: string, id: string, dto: UpdateLeaveDto) {
  const existing = await prisma.leaveRequest.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    throw new AttendanceError('NOT_FOUND', 'Solicitud de licencia no encontrada', 404);
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      ...(dto.status && { status: dto.status }),
      ...(dto.approvedBy !== undefined && { approvedBy: dto.approvedBy }),
      ...(dto.reason !== undefined && { reason: dto.reason }),
      ...(dto.status === 'APPROVED' && { approvedAt: new Date() }),
    },
  });

  return updated;
}
