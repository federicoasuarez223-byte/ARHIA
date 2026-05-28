import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/jwt';

const payload = {
  sub: 'user-123',
  email: 'test@arhia.ai',
  role: 'ADMIN' as const,
  companyId: 'company-abc',
  tenantSchema: 'company_abc',
};

describe('JWT helpers', () => {
  describe('signAccessToken / verifyAccessToken', () => {
    it('signs and verifies a valid token', () => {
      const token = signAccessToken(payload);
      expect(typeof token).toBe('string');
      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.companyId).toBe(payload.companyId);
    });

    it('throws on invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });

    it('throws on tampered token', () => {
      const token = signAccessToken(payload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAccessToken(tampered)).toThrow();
    });
  });

  describe('signRefreshToken / verifyRefreshToken', () => {
    it('signs and verifies a refresh token', () => {
      const token = signRefreshToken(payload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.companyId).toBe(payload.companyId);
    });

    it('access and refresh tokens are different', () => {
      const access = signAccessToken(payload);
      const refresh = signRefreshToken(payload);
      expect(access).not.toBe(refresh);
    });

    it('refresh token cannot be verified as access token (different secrets)', () => {
      const refresh = signRefreshToken(payload);
      // Should throw because secrets differ
      expect(() => verifyAccessToken(refresh)).toThrow();
    });
  });

  describe('token expiry', () => {
    it('expired token throws on verify', () => {
      // Sign with very short expiry
      const secret = 'test_access_secret_at_least_32_chars_long';
      const expired = jwt.sign(payload, secret, { expiresIn: '0s' });
      // Small delay to ensure expiry
      expect(() => verifyAccessToken(expired)).toThrow(/expired/i);
    });
  });
});
