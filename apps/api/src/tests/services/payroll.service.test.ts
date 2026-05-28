import { describe, it, expect, vi, beforeEach } from 'vitest';

import { prisma } from '@/config/database';
import {
  createPayrollRecord,
  updatePayrollRecord,
  PayrollError,
} from '@/modules/payroll/payroll.service';

// Argentine social contribution rates
const JUBILACION = 0.11;
const OBRA_SOCIAL = 0.03;
const ANSSAL = 0.005;
const LEY19032 = 0.015;

describe('payroll.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Deduction math ─────────────────────────────────────────────────────────

  describe('deduction calculations (via createPayrollRecord)', () => {
    it('calculates Argentine deductions correctly on a 100000 salary', async () => {
      const gross = 100_000;
      const expectedJubilacion = gross * JUBILACION;
      const expectedObraSocial = gross * OBRA_SOCIAL;
      const expectedAnssal = gross * ANSSAL;
      const expectedLey = gross * LEY19032;
      const expectedTotal = expectedJubilacion + expectedObraSocial + expectedAnssal + expectedLey;
      const expectedNet = gross - expectedTotal;

      vi.mocked(prisma.employee.findFirst).mockResolvedValue({ id: 'emp-1' } as any);
      vi.mocked(prisma.payrollRecord.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.payrollRecord.create).mockResolvedValue({
        id: 'rec-1',
        grossSalary: gross,
        jubilacion: expectedJubilacion,
        obraSocial: expectedObraSocial,
        anssal: expectedAnssal,
        ley19032: expectedLey,
        totalDeductions: expectedTotal,
        netSalary: expectedNet,
      } as any);

      await createPayrollRecord('company-1', {
        employeeId: 'emp-1',
        periodYear: 2025,
        periodMonth: 1,
        grossSalary: gross,
        currency: 'ARS',
      });

      const createCall = vi.mocked(prisma.payrollRecord.create).mock.calls[0][0];
      expect(createCall.data.jubilacion).toBeCloseTo(11_000);
      expect(createCall.data.obraSocial).toBeCloseTo(3_000);
      expect(createCall.data.anssal).toBeCloseTo(500);
      expect(createCall.data.ley19032).toBeCloseTo(1_500);
      expect(createCall.data.totalDeductions).toBeCloseTo(16_000);
      expect(createCall.data.netSalary).toBeCloseTo(84_000);
    });

    it('formats period string as YYYY-MM with zero-padding', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue({ id: 'emp-1' } as any);
      vi.mocked(prisma.payrollRecord.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.payrollRecord.create).mockResolvedValue({} as any);

      await createPayrollRecord('company-1', {
        employeeId: 'emp-1',
        periodYear: 2025,
        periodMonth: 3,
        grossSalary: 50_000,
        currency: 'ARS',
      });

      const createCall = vi.mocked(prisma.payrollRecord.create).mock.calls[0][0];
      expect(createCall.data.period).toBe('2025-03');
    });
  });

  // ── Validation errors ──────────────────────────────────────────────────────

  describe('createPayrollRecord errors', () => {
    it('throws 404 when employee not found', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue(null);

      await expect(
        createPayrollRecord('company-1', {
          employeeId: 'bad-id',
          periodYear: 2025,
          periodMonth: 1,
          grossSalary: 50_000,
          currency: 'ARS',
        }),
      ).rejects.toMatchObject({ code: 'EMPLOYEE_NOT_FOUND', status: 404 });
    });

    it('throws 409 when duplicate period record exists', async () => {
      vi.mocked(prisma.employee.findFirst).mockResolvedValue({ id: 'emp-1' } as any);
      vi.mocked(prisma.payrollRecord.findFirst).mockResolvedValue({ id: 'existing' } as any);

      await expect(
        createPayrollRecord('company-1', {
          employeeId: 'emp-1',
          periodYear: 2025,
          periodMonth: 1,
          grossSalary: 50_000,
          currency: 'ARS',
        }),
      ).rejects.toMatchObject({ code: 'DUPLICATE_PERIOD', status: 409 });
    });
  });

  // ── updatePayrollRecord ────────────────────────────────────────────────────

  describe('updatePayrollRecord', () => {
    it('throws 404 when record not found', async () => {
      vi.mocked(prisma.payrollRecord.findFirst).mockResolvedValue(null);

      await expect(
        updatePayrollRecord('company-1', 'bad-id', { status: 'APPROVED' }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    });

    it('sets paidAt when status is PAID', async () => {
      vi.mocked(prisma.payrollRecord.findFirst).mockResolvedValue({
        id: 'rec-1',
        status: 'APPROVED',
      } as any);
      vi.mocked(prisma.payrollRecord.update).mockResolvedValue({ id: 'rec-1' } as any);

      await updatePayrollRecord('company-1', 'rec-1', { status: 'PAID' });

      const updateCall = vi.mocked(prisma.payrollRecord.update).mock.calls[0][0];
      expect(updateCall.data.status).toBe('PAID');
      expect(updateCall.data.paidAt).toBeInstanceOf(Date);
    });

    it('sets processedAt when status is APPROVED', async () => {
      vi.mocked(prisma.payrollRecord.findFirst).mockResolvedValue({
        id: 'rec-1',
        status: 'DRAFT',
      } as any);
      vi.mocked(prisma.payrollRecord.update).mockResolvedValue({ id: 'rec-1' } as any);

      await updatePayrollRecord('company-1', 'rec-1', { status: 'APPROVED' });

      const updateCall = vi.mocked(prisma.payrollRecord.update).mock.calls[0][0];
      expect(updateCall.data.processedAt).toBeInstanceOf(Date);
    });
  });

  describe('PayrollError', () => {
    it('is an instance of Error', () => {
      const err = new PayrollError('TEST', 'message', 400);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe('TEST');
      expect(err.status).toBe(400);
      expect(err.message).toBe('message');
    });
  });
});
