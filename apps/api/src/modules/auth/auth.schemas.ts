import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Nombre de empresa requerido'),
  companyCuit: z.string().regex(/^\d{2}-\d{8}-\d$/, 'CUIT con formato XX-XXXXXXXX-X'),
  adminName: z.string().min(2, 'Nombre requerido'),
  adminEmail: z.string().email('Email inválido'),
  adminPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  plan: z.enum(['STARTER', 'BUSINESS', 'ENTERPRISE']).default('STARTER'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
