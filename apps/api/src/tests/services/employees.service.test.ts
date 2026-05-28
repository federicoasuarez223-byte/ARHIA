import { describe, it, expect, vi, beforeEach } from 'vitest';

import { prisma } from '@/config/database';
import {
  getEmployee,
  createEmployee,
  updateEmployee,
  EmployeeError,
} from '@/modules/employees/employees.service';

const COMPANY_ID = 'company-abc';

const baseEmployee = {
  id: 'emp-1',
  legajo: 'TS-001',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  companyId: COMPANY_ID,
  isActive: true,
  departmentId: 'dept-1',
};

const createDto = {
  firstName: 'María',
  lastName: 'García',
  email: 'maria@example.com',
  departmentId: 'dept-1',
  position: 'Developer',
  seniority: 'SENIOR' as const,
  contractType: 'FULL_TIME' as const,
  hireDate: '2025-01-15',
  salary: 150_000,
  currency: 'ARS' as const,
};

describe('employees.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getEmployee ────────────────────────────────────────────────────────────

  describe('getEmployee()', () => {
    it('returns employee when found', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(baseEmployee as any);

      const result = await getEmployee(COMPANY_ID, 'emp-1');
      expect(result.id).toBe('emp-1');
      expect(result.firstName).toBe('Juan');
    });

    it('throws 404 when employee not found', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(null);

      await expect(getEmployee(COMPANY_ID, 'bad-id')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
      });
    });

    it('queries with correct companyId scope', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(baseEmployee as any);
      await getEmployee(COMPANY_ID, 'emp-1');

      expect(vi.mocked(prisma.employee.findFirst)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: COMPANY_ID }),
        }),
      );
    });
  });

  // ── createEmployee ─────────────────────────────────────────────────────────

  describe('createEmployee()', () => {
    beforeEach(() => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(null); // no existing email
      vi.mocked(prisma.department.findFirst).mockResolvedValue({ id: 'dept-1' } as any);
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]); // for legajo generation
      vi.mocked(prisma.employee.create).mockResolvedValue({
        ...baseEmployee,
        ...createDto,
        id: 'emp-new',
      } as any);
    });

    it('creates employee successfully', async () => {
      const result = await createEmployee(COMPANY_ID, createDto);
      expect(result.id).toBe('emp-new');
      expect(vi.mocked(prisma.employee.create)).toHaveBeenCalledOnce();
    });

    it('throws 409 when email already exists', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce(baseEmployee as any);

      await expect(createEmployee(COMPANY_ID, createDto)).rejects.toMatchObject({
        code: 'EMAIL_TAKEN',
        status: 409,
      });
    });

    it('throws 404 when department not found', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.department.findFirst).mockResolvedValue(null);

      await expect(createEmployee(COMPANY_ID, createDto)).rejects.toMatchObject({
        code: 'DEPT_NOT_FOUND',
        status: 404,
      });
    });

    it('auto-generates legajo TS-001 when no employees exist', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
      vi.mocked(prisma.employee.create).mockResolvedValue({ id: 'new', legajo: 'TS-001' } as any);

      await createEmployee(COMPANY_ID, createDto);

      const createCall = vi.mocked(prisma.employee.create).mock.calls[0][0];
      expect(createCall.data.legajo).toBe('TS-001');
    });

    it('increments legajo when employees already exist', async () => {
      vi.mocked(prisma.employee.findMany).mockResolvedValue([
        { legajo: 'TS-001' },
        { legajo: 'TS-002' },
        { legajo: 'TS-003' },
      ] as any);
      vi.mocked(prisma.employee.create).mockResolvedValue({ id: 'new', legajo: 'TS-004' } as any);

      await createEmployee(COMPANY_ID, createDto);

      const createCall = vi.mocked(prisma.employee.create).mock.calls[0][0];
      expect(createCall.data.legajo).toBe('TS-004');
    });

    it('uses provided legajo when given', async () => {
      vi.mocked(prisma.employee.create).mockResolvedValue({
        id: 'new',
        legajo: 'CUSTOM-99',
      } as any);

      await createEmployee(COMPANY_ID, { ...createDto, legajo: 'CUSTOM-99' });

      const createCall = vi.mocked(prisma.employee.create).mock.calls[0][0];
      expect(createCall.data.legajo).toBe('CUSTOM-99');
    });
  });

  // ── updateEmployee ─────────────────────────────────────────────────────────

  describe('updateEmployee()', () => {
    it('throws 404 when employee not found', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(null);

      await expect(
        updateEmployee(COMPANY_ID, 'bad-id', { position: 'Manager' }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
      });
    });

    it('throws 409 when new email already taken by another employee', async () => {
      vi.mocked(prisma.employee.findFirst)
        .mockResolvedValueOnce(baseEmployee as any) // existing employee found
        .mockResolvedValueOnce({ id: 'emp-2', email: 'taken@example.com' } as any); // email taken

      await expect(
        updateEmployee(COMPANY_ID, 'emp-1', { email: 'taken@example.com' }),
      ).rejects.toMatchObject({ code: 'EMAIL_TAKEN', status: 409 });
    });
  });

  // ── EmployeeError ──────────────────────────────────────────────────────────

  describe('EmployeeError', () => {
    it('exposes code, status and message', () => {
      const err = new EmployeeError('EMAIL_TAKEN', 'Email in use', 409);
      expect(err.code).toBe('EMAIL_TAKEN');
      expect(err.status).toBe(409);
      expect(err.message).toBe('Email in use');
      expect(err).toBeInstanceOf(Error);
    });
  });
});
