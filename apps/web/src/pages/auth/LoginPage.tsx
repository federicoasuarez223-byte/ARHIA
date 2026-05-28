import type { LoginResponse } from '@arhia/shared';
import { Button, Input } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import apiClient from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const res = await apiClient.post<{ success: boolean; data: LoginResponse }>(
        '/api/auth/login',
        data,
      );
      setAuth(res.data.data.user, res.data.data.accessToken, res.data.data.refreshToken);
      navigate(from, { replace: true });
    } catch {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="bg-navy-900 flex min-h-screen items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-gold-500/5 absolute -right-40 -top-40 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-gold-500/5 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="bg-gold-500 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <span className="font-display text-navy-900 text-xl font-black">AR</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Bienvenido a ARHIA</h1>
          <p className="text-navy-400 mt-1 text-sm">Tu plataforma de HR Intelligence</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@empresa.com"
              error={errors.email?.message}
              className="placeholder:text-navy-400 focus:border-gold-400 border-white/20 bg-white/10 text-white"
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              className="placeholder:text-navy-400 focus:border-gold-400 border-white/20 bg-white/10 text-white"
              {...register('password')}
            />

            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Ingresar
            </Button>
          </form>

          <p className="text-navy-500 mt-4 text-center text-xs">
            Demo: admin@techsur.com.ar / demo1234
          </p>
        </div>
      </div>
    </div>
  );
}
