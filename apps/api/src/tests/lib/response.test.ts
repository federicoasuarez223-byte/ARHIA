import { describe, it, expect, vi } from 'vitest';

import { ok, created, fail, paginatedOk } from '@/lib/response';

function mockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnThis();
  return { json, status, _body: () => json.mock.calls[0]?.[0] };
}

describe('response helpers', () => {
  describe('ok()', () => {
    it('responds 200 with success envelope', () => {
      const res = mockRes() as any;
      ok(res, { id: '1', name: 'Test' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._body()).toEqual({ success: true, data: { id: '1', name: 'Test' } });
    });

    it('includes meta when provided', () => {
      const res = mockRes() as any;
      ok(res, [], { total: 0, page: 1 });
      expect(res._body().meta).toEqual({ total: 0, page: 1 });
    });

    it('respects custom status code', () => {
      const res = mockRes() as any;
      ok(res, {}, undefined, 202);
      expect(res.status).toHaveBeenCalledWith(202);
    });
  });

  describe('created()', () => {
    it('responds 201 with created entity', () => {
      const res = mockRes() as any;
      created(res, { id: 'abc' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res._body()).toEqual({ success: true, data: { id: 'abc' } });
    });
  });

  describe('fail()', () => {
    it('responds with error envelope', () => {
      const res = mockRes() as any;
      fail(res, 404, 'NOT_FOUND', 'Resource not found');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res._body()).toEqual({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      });
    });

    it('includes details when provided', () => {
      const res = mockRes() as any;
      fail(res, 400, 'VALIDATION', 'Bad input', { field: 'email' });
      expect(res._body().error.details).toEqual({ field: 'email' });
    });
  });

  describe('paginatedOk()', () => {
    it('calculates pages correctly and includes meta', () => {
      const res = mockRes() as any;
      paginatedOk(res, [1, 2, 3], 25, 1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._body().meta).toEqual({ total: 25, page: 1, limit: 10, pages: 3 });
    });

    it('handles exact page boundary', () => {
      const res = mockRes() as any;
      paginatedOk(res, [], 20, 2, 10);
      expect(res._body().meta.pages).toBe(2);
    });

    it('rounds up pages', () => {
      const res = mockRes() as any;
      paginatedOk(res, [], 11, 1, 10);
      expect(res._body().meta.pages).toBe(2);
    });
  });
});
