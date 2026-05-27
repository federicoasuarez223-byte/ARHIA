import crypto from 'crypto';

import type { AuthUser } from '@arhia/shared';
import bcrypt from 'bcryptjs';

import type { LoginDto, RegisterDto } from './auth.schemas';

import { prisma } from '@/config/database';
import {
  signAccessToken,
  signRefreshToken,
  refreshTokenExpiresAt,
  verifyRefreshToken,
} from '@/lib/jwt';

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
  }
}

function buildJwtPayload(
  user: { id: string; email: string; role: string; companyId: string },
  tenantSchema: string,
) {
  return {
    sub: user.id,
    email: user.email,
    role: user.role as AuthUser['role'],
    companyId: user.companyId,
    tenantSchema,
  };
}

export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({
    where: { email: dto.email.toLowerCase() },
    include: { company: { select: { id: true, name: true, tenantSchema: true, isActive: true } } },
  });

  if (!user || !user.isActive) {
    throw new AuthError('INVALID_CREDENTIALS', 'Email o contraseña incorrectos', 401);
  }

  if (!user.company.isActive) {
    throw new AuthError('COMPANY_INACTIVE', 'La empresa está inactiva', 403);
  }

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) {
    throw new AuthError('INVALID_CREDENTIALS', 'Email o contraseña incorrectos', 401);
  }

  const payload = buildJwtPayload(user, user.company.tenantSchema);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken: refreshToken,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AuthUser['role'],
    companyId: user.companyId,
    companyName: user.company.name,
    employeeId: user.employeeId ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    permissions: getRolePermissions(user.role),
  };

  return { accessToken, refreshToken, user: authUser };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('TOKEN_INVALID', 'Refresh token inválido o expirado', 401);
  }

  const session = await prisma.session.findUnique({ where: { refreshToken } });
  if (!session || session.expiresAt < new Date()) {
    throw new AuthError('SESSION_EXPIRED', 'Sesión expirada', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { company: { select: { name: true, tenantSchema: true, isActive: true } } },
  });

  if (!user || !user.isActive || !user.company.isActive) {
    throw new AuthError('USER_INACTIVE', 'Usuario inactivo', 401);
  }

  // Rotate refresh token
  const newPayload = buildJwtPayload(user, user.company.tenantSchema);
  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshToken: newRefreshToken, expiresAt: refreshTokenExpiresAt() },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await prisma.session.deleteMany({ where: { refreshToken } });
}

export async function logoutAll(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: { select: { id: true, name: true, logoUrl: true } } },
  });

  if (!user) throw new AuthError('USER_NOT_FOUND', 'Usuario no encontrado', 404);

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AuthUser['role'],
    companyId: user.companyId,
    companyName: user.company.name,
    employeeId: user.employeeId ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    permissions: getRolePermissions(user.role),
  };

  return authUser;
}

export async function register(dto: RegisterDto) {
  const existing = await prisma.company.findUnique({ where: { cuit: dto.companyCuit } });
  if (existing) {
    throw new AuthError('CUIT_TAKEN', 'Ya existe una empresa con ese CUIT', 409);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: dto.adminEmail.toLowerCase() },
  });
  if (existingUser) {
    throw new AuthError('EMAIL_TAKEN', 'El email ya está registrado', 409);
  }

  const tenantSchema = `tenant_${crypto.randomUUID().replace(/-/g, '')}`;
  const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

  const company = await prisma.company.create({
    data: {
      name: dto.companyName,
      legalName: dto.companyName,
      cuit: dto.companyCuit,
      plan: dto.plan as 'STARTER' | 'BUSINESS' | 'ENTERPRISE',
      tenantSchema,
      isActive: true,
      users: {
        create: {
          email: dto.adminEmail.toLowerCase(),
          passwordHash,
          name: dto.adminName,
          role: 'ADMIN',
          isActive: true,
        },
      },
    },
    include: { users: true },
  });

  const user = company.users[0];
  const payload = buildJwtPayload(user, tenantSchema);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.session.create({
    data: { userId: user.id, refreshToken, expiresAt: refreshTokenExpiresAt() },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser['role'],
      companyId: company.id,
      companyName: company.name,
      permissions: getRolePermissions(user.role),
    } as AuthUser,
  };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AuthError('USER_NOT_FOUND', 'Usuario no encontrado', 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AuthError('WRONG_PASSWORD', 'Contraseña actual incorrecta', 400);

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

  // Invalidate all sessions so user must re-login
  await prisma.session.deleteMany({ where: { userId } });
}

function getRolePermissions(role: string): string[] {
  const permissions: Record<string, string[]> = {
    SUPER_ADMIN: ['*'],
    ADMIN: [
      'employees:*',
      'contracts:*',
      'payroll:*',
      'reports:*',
      'settings:*',
      'automation:*',
      'recruitment:*',
      'training:*',
    ],
    HR_MANAGER: [
      'employees:read',
      'employees:write',
      'contracts:read',
      'contracts:write',
      'payroll:read',
      'reports:read',
      'recruitment:*',
      'training:*',
    ],
    MANAGER: ['employees:read', 'reports:read'],
    EMPLOYEE: ['profile:read', 'profile:write'],
  };
  return permissions[role] ?? [];
}
