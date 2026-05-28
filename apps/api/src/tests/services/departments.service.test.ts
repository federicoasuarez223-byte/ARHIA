import { describe, it, expect, vi, beforeEach } from 'vitest';

import { prisma } from '@/config/database';
import {
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  DepartmentError,
} from '@/modules/departments/departments.service';

const COMPANY_ID = 'company-abc';

const baseDept = {
  id: 'dept-1',
  name: 'Ingeniería',
  code: 'ENG',
  companyId: COMPANY_ID,
  isActive: true,
  headcount: 5,
};

describe('departments.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getDepartment ──────────────────────────────────────────────────────────

  describe('getDepartment()', () => {
    it('returns department when found', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(baseDept as any);
      const result = await getDepartment(COMPANY_ID, 'dept-1');
      expect(result.id).toBe('dept-1');
      expect(result.name).toBe('Ingeniería');
    });

    it('throws 404 when not found', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(null);
      await expect(getDepartment(COMPANY_ID, 'bad-id')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
      });
    });

    it('scopes query to companyId', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(baseDept as any);
      await getDepartment(COMPANY_ID, 'dept-1');
      expect(vi.mocked(prisma.department.findFirst)).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ companyId: COMPANY_ID }) }),
      );
    });
  });

  // ── createDepartment ───────────────────────────────────────────────────────

  describe('createDepartment()', () => {
    it('creates department successfully', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(null); // code not taken
      vi.mocked(prisma.department.create).mockResolvedValue({ ...baseDept, id: 'dept-new' } as any);

      const result = await createDepartment(COMPANY_ID, { name: 'Ingeniería', code: 'ENG' });
      expect(result.id).toBe('dept-new');
    });

    it('throws 409 when code already exists in company', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(baseDept as any);

      await expect(
        createDepartment(COMPANY_ID, { name: 'Engineering 2', code: 'ENG' }),
      ).rejects.toMatchObject({ code: 'CODE_TAKEN', status: 409 });
    });

    it('allows duplicate code across companies', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.department.create).mockResolvedValue({
        ...baseDept,
        id: 'dept-other',
      } as any);

      // Different company — should not throw
      const result = await createDepartment('other-company', { name: 'Engineering', code: 'ENG' });
      expect(result.id).toBe('dept-other');
    });
  });

  // ── updateDepartment ───────────────────────────────────────────────────────

  describe('updateDepartment()', () => {
    it('throws 404 when department not found', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(null);

      await expect(
        updateDepartment(COMPANY_ID, 'bad-id', { name: 'New Name' }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    });

    it('throws 409 on code conflict with a different department', async () => {
      vi.mocked(prisma.department.findFirst)
        .mockResolvedValueOnce(baseDept as any) // find existing dept
        .mockResolvedValueOnce({ id: 'dept-2', code: 'HR' } as any); // code taken by other dept

      await expect(updateDepartment(COMPANY_ID, 'dept-1', { code: 'HR' })).rejects.toMatchObject({
        code: 'CODE_TAKEN',
        status: 409,
      });
    });
  });

  // ── deleteDepartment ───────────────────────────────────────────────────────

  describe('deleteDepartment()', () => {
    it('throws 404 when department not found', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(null);

      await expect(deleteDepartment(COMPANY_ID, 'bad-id')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: 404,
      });
    });

    it('soft-deletes by setting isActive=false', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(baseDept as any);
      vi.mocked(prisma.department.update).mockResolvedValue({
        ...baseDept,
        isActive: false,
      } as any);

      await deleteDepartment(COMPANY_ID, 'dept-1');

      expect(vi.mocked(prisma.department.update)).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } }),
      );
    });

    it('does not call update when department is not found', async () => {
      vi.mocked(prisma.department.findFirst).mockResolvedValue(null);

      await expect(deleteDepartment(COMPANY_ID, 'bad-id')).rejects.toThrow();
      expect(vi.mocked(prisma.department.update)).not.toHaveBeenCalled();
    });
  });

  // ── DepartmentError ────────────────────────────────────────────────────────

  describe('DepartmentError', () => {
    it('is an instance of Error with code and status', () => {
      const err = new DepartmentError('CODE_TAKEN', 'Code in use', 409);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe('CODE_TAKEN');
      expect(err.status).toBe(409);
    });
  });
});
