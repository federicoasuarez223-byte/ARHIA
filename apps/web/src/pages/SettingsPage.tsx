import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Palette, Save, Settings, Shield, Users, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

// ── Types ──────────────────────────────────────────────────────────────────────

interface CompanySettings {
  id: string;
  name: string;
  legalName: string;
  cuit: string;
  phone?: string;
  address?: string;
  website?: string;
  settings: {
    contactEmail?: string;
    currency?: 'ARS' | 'USD';
    timezone?: string;
  };
  plan: string;
}

// ── Schemas ────────────────────────────────────────────────────────────────────

const companySchema = z.object({
  name: z.string().min(1, 'Requerido'),
  legalName: z.string().min(1, 'Requerido'),
  cuit: z.string().optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
});

const preferencesSchema = z.object({
  currency: z.enum(['ARS', 'USD']),
  timezone: z.string(),
});

type CompanyFormValues = z.infer<typeof companySchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;

// ── Sidebar tabs (display only for now) ───────────────────────────────────────

const TABS = [
  { id: 'company', label: 'Empresa', icon: Building2 },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
];

// ── Company form ───────────────────────────────────────────────────────────────

function CompanyForm({ data }: { data: CompanySettings }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: data.name,
      legalName: data.legalName,
      cuit: data.cuit ?? '',
      contactEmail: data.settings?.contactEmail ?? '',
      phone: data.phone ?? '',
      website: data.website ?? '',
      address: data.address ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: data.name,
      legalName: data.legalName,
      cuit: data.cuit ?? '',
      contactEmail: data.settings?.contactEmail ?? '',
      phone: data.phone ?? '',
      website: data.website ?? '',
      address: data.address ?? '',
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (dto: CompanyFormValues) => apiClient.patch('/api/settings/company', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Datos de empresa actualizados');
    },
    onError: () => toast.error('No se pudieron guardar los cambios.'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 size={16} className="text-navy-500" />
          Datos de la empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v: CompanyFormValues) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre de la empresa *"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input label="CUIT" placeholder="XX-XXXXXXXX-X" {...register('cuit')} />
            <Input
              label="Razón social *"
              placeholder="Nombre legal"
              {...register('legalName')}
              error={errors.legalName?.message}
            />
            <Input
              label="Email de contacto"
              type="email"
              placeholder="contacto@empresa.com"
              {...register('contactEmail')}
              error={errors.contactEmail?.message}
            />
            <Input label="Teléfono" placeholder="+54 11 XXXX-XXXX" {...register('phone')} />
            <Input label="Sitio web" placeholder="https://empresa.com" {...register('website')} />
          </div>
          <Input
            label="Domicilio fiscal"
            placeholder="Dirección completa"
            {...register('address')}
          />
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!isDirty || isSubmitting || mutation.isPending}
            >
              <Save size={14} />
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Preferences form ───────────────────────────────────────────────────────────

function PreferencesForm({ data }: { data: CompanySettings }) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      currency: (data.settings?.currency as 'ARS' | 'USD') ?? 'ARS',
      timezone: data.settings?.timezone ?? 'America/Argentina/Buenos_Aires',
    },
  });

  useEffect(() => {
    reset({
      currency: (data.settings?.currency as 'ARS' | 'USD') ?? 'ARS',
      timezone: data.settings?.timezone ?? 'America/Argentina/Buenos_Aires',
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (dto: PreferencesFormValues) => apiClient.patch('/api/settings/preferences', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Preferencias actualizadas');
    },
    onError: () => toast.error('No se pudieron guardar las preferencias.'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings size={16} className="text-navy-500" />
          Preferencias del sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v: PreferencesFormValues) => mutation.mutate(v))}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-navy-700 mb-1.5 block text-sm font-medium">
                Moneda principal
              </label>
              <select
                {...register('currency')}
                className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
              >
                <option value="ARS">ARS — Peso argentino</option>
                <option value="USD">USD — Dólar estadounidense</option>
              </select>
            </div>
            <div>
              <label className="text-navy-700 mb-1.5 block text-sm font-medium">Zona horaria</label>
              <select
                {...register('timezone')}
                className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
              >
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
                <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                <option value="America/New_York">Nueva York (UTC-5)</option>
                <option value="Europe/Madrid">Madrid (UTC+1)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!isDirty || isSubmitting || mutation.isPending}
            >
              <Save size={14} />
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  GROWTH: 'Growth',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
};

// ── Users tab ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  HR_MANAGER: 'RRHH Manager',
  HR_ANALYST: 'RRHH Analista',
  MANAGER: 'Manager',
  EMPLOYEE: 'Empleado',
};

const ROLE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  SUPER_ADMIN: 'success',
  ADMIN: 'warning',
  HR_MANAGER: 'info',
  HR_ANALYST: 'info',
  MANAGER: 'default',
  EMPLOYEE: 'default',
};

function UsersTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings-users'],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          role: string;
          isActive: boolean;
          legajo: string;
        }[];
        meta: { total: number };
      }>('/api/employees', { params: { limit: 100, sortBy: 'lastName', sortOrder: 'asc' } });
      return r.data;
    },
  });

  const users = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={16} className="text-navy-500" />
          Equipo con acceso al sistema
        </CardTitle>
        <span className="text-navy-400 text-sm">{data?.meta.total ?? '—'} personas</span>
      </CardHeader>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-surface border-b text-left">
              <th className="text-navy-500 px-4 py-3 font-semibold">Nombre</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Email</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Legajo</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Rol</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="bg-surface-hover h-4 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-navy-900 font-medium">
                        {u.firstName} {u.lastName}
                      </p>
                    </td>
                    <td className="text-navy-500 px-4 py-3 text-xs">{u.email}</td>
                    <td className="text-navy-500 px-4 py-3 font-mono text-xs">{u.legajo}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_VARIANT[u.role] ?? 'default'} size="sm">
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'success' : 'default'} size="sm" dot>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: CompanySettings }>('/api/settings')
        .then((r) => r.data.data),
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-navy-900 text-2xl font-bold">Configuración</h1>
        <p className="text-navy-500 mt-1 text-sm">
          Administrá tu cuenta y la configuración de la plataforma
        </p>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  id === activeTab
                    ? 'bg-navy-900 text-white'
                    : 'text-navy-600 hover:bg-surface-hover'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 space-y-4">
          {activeTab === 'company' && (
            <>
              {isLoading ? (
                <Card>
                  <CardContent className="flex h-48 items-center justify-center">
                    <p className="text-navy-400 text-sm">Cargando...</p>
                  </CardContent>
                </Card>
              ) : settingsData ? (
                <>
                  <CompanyForm data={settingsData} />
                  <PreferencesForm data={settingsData} />
                </>
              ) : null}

              <Card>
                <CardContent className="flex items-center justify-between py-5">
                  <div>
                    <p className="text-navy-900 font-semibold">Plan actual</p>
                    <p className="text-navy-500 mt-0.5 text-sm">
                      Estás usando el plan{' '}
                      <strong>
                        {settingsData ? (PLAN_LABELS[settingsData.plan] ?? settingsData.plan) : '—'}
                      </strong>
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver planes
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'users' && <UsersTab />}

          {activeTab !== 'company' && activeTab !== 'users' && (
            <Card>
              <CardContent className="flex h-48 items-center justify-center">
                <p className="text-navy-400 text-sm">Próximamente</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
