import { describe, it, expect, vi, beforeEach } from 'vitest';

import { prisma } from '@/config/database';
import { updateReview, PerformanceError } from '@/modules/performance/performance.service';

const COMPANY_ID = 'company-abc';

const baseReview = {
  id: 'review-1',
  companyId: COMPANY_ID,
  employeeId: 'emp-1',
  status: 'IN_PROGRESS',
  score: null,
  completedAt: null,
  strengths: [],
  improvements: [],
};

describe('performance.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.performanceReview.update).mockResolvedValue({ id: 'review-1' } as any);
  });

  describe('updateReview()', () => {
    it('throws 404 when review not found', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(null);

      await expect(
        updateReview(COMPANY_ID, 'bad-id', { status: 'COMPLETED' }),
      ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    });

    it('sets completedAt when transitioning to COMPLETED', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(baseReview as any);

      await updateReview(COMPANY_ID, 'review-1', { status: 'COMPLETED' });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeInstanceOf(Date);
    });

    it('does not override completedAt if already set', async () => {
      const alreadyCompleted = { ...baseReview, completedAt: new Date('2025-01-01') };
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(alreadyCompleted as any);

      await updateReview(COMPANY_ID, 'review-1', { status: 'COMPLETED' });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      // completedAt should not be set in update data since it's already set
      expect(updateCall.data.completedAt).toBeUndefined();
    });

    it('wraps strengths in Prisma set syntax', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(baseReview as any);

      await updateReview(COMPANY_ID, 'review-1', {
        strengths: ['Comunicación', 'Liderazgo'],
      });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      expect(updateCall.data.strengths).toEqual({ set: ['Comunicación', 'Liderazgo'] });
    });

    it('wraps improvements in Prisma set syntax', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(baseReview as any);

      await updateReview(COMPANY_ID, 'review-1', {
        improvements: ['Puntualidad'],
      });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      expect(updateCall.data.improvements).toEqual({ set: ['Puntualidad'] });
    });

    it('connects reviewer when reviewerId is provided', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(baseReview as any);

      await updateReview(COMPANY_ID, 'review-1', { reviewerId: 'emp-2' });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      expect(updateCall.data.reviewer).toEqual({ connect: { id: 'emp-2' } });
    });

    it('disconnects reviewer when reviewerId is null', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(baseReview as any);

      await updateReview(COMPANY_ID, 'review-1', { reviewerId: null });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      expect(updateCall.data.reviewer).toEqual({ disconnect: true });
    });

    it('updates score and potential', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(baseReview as any);

      await updateReview(COMPANY_ID, 'review-1', { score: 85, potential: 'HIGH' });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      expect(updateCall.data.score).toBe(85);
      expect(updateCall.data.potential).toBe('HIGH');
    });

    it('does not include undefined fields in update', async () => {
      vi.mocked(prisma.performanceReview.findFirst).mockResolvedValue(baseReview as any);

      await updateReview(COMPANY_ID, 'review-1', { score: 90 });

      const updateCall = vi.mocked(prisma.performanceReview.update).mock.calls[0][0];
      expect('strengths' in updateCall.data).toBe(false);
      expect('improvements' in updateCall.data).toBe(false);
      expect('reviewer' in updateCall.data).toBe(false);
    });
  });

  describe('PerformanceError', () => {
    it('is an Error with code and status', () => {
      const err = new PerformanceError('NOT_FOUND', 'Not found', 404);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe('NOT_FOUND');
      expect(err.status).toBe(404);
    });
  });
});
