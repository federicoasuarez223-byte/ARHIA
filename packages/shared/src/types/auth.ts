import type { UserRole } from './enums';

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  employeeId?: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  companyId: string;
  tenantSchema: string;
  iat?: number;
  exp?: number;
}

export interface RegisterCompanyRequest {
  companyName: string;
  companyCuit: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  plan: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
