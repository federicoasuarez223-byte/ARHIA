import { Button, Card, CardContent, CardHeader, CardTitle, Modal } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Clock, Users, ExternalLink, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TrainingPlan {
  id: string;
  title: string;
  description?: string;
  type: string;
  provider?: string;
  duration?: number;
  durationUnit: string;
  url?: string;
  _count: { enrollments: number };
}

interface TrainingStats {
  activePlans: number;
  employeesInTraining: number;
  avgCompletionPct: number;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  SKILL: { label: 'Habilidad', color: 'bg-blue-100 text-blue-700' },
  COMPLIANCE: { label: 'Compliance', color: 'bg-red-100 text-red-700' },
  LEADERSHIP: { label: 'Liderazgo', color: 'bg-purple-100 text-purple-700' },
  TECHNICAL: { label: 'Técnico', color: 'bg-navy-100 text-navy-700' },
  ONBOARDING: { label: 'Onboarding', color: 'bg-green-100 text-green-700' },
};

const UNIT_LABELS: Record<string, string> = {
  HOURS: 'hs',
  DAYS: 'días',
  WEEKS: 'semanas',
};

// ── Create Plan Modal ─────────────────────────────────────────────────────────

const selectClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const inputClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const labelClass = 'text-navy-700 mb-1.5 block text-sm font-medium';

const planSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  type: z.enum(['SKILL', 'COMPLIANCE', 'LEADERSHIP', 'TECHNICAL', 'ONBOARDING']),
  provider: z.string().optional(),
  duration: z.coerce.number().int().positive().optional().or(z.literal('')),
  durationUnit: z.enum(['HOURS', 'DAYS', 'WEEKS']),
  url: z.string().optional(),
  description: z.string().optional(),
});
type PlanFormValues = z.infer<typeof planSchema>;

function CreatePlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: { type: 'SKILL', durationUnit: 'HOURS' },
  });

  const mutation = useMutation({
    mutationFn: (data: PlanFormValues) =>
      apiClient.post('/api/training', {
        ...data,
        duration: data.duration !== '' && data.duration ? Number(data.duration) : undefined,
        provider: data.provider || undefined,
        url: data.url || undefined,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-plans'] });
      qc.invalidateQueries({ queryKey: ['training-stats'] });
      toast.success('Plan de capacitación creado');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo crear el plan.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo plan de capacitación"
      description="Creá un plan de formación para tu equipo."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit((d) => mutation.mutate(d))}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <GraduationCap size={14} />
            )}
            {mutation.isPending ? 'Creando...' : 'Crear plan'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Título *</label>
          <input
            {...register('title')}
            placeholder="ej. Liderazgo para nuevos managers"
            className={inputClass}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tipo *</label>
            <select {...register('type')} className={selectClass}>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Proveedor</label>
            <input
              {...register('provider')}
              placeholder="ej. Udemy, LinkedIn Learning"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Duración</label>
            <input
              {...register('duration')}
              type="number"
              min="1"
              placeholder="ej. 8"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Unidad</label>
            <select {...register('durationUnit')} className={selectClass}>
              <option value="HOURS">Horas</option>
              <option value="DAYS">Días</option>
              <option value="WEEKS">Semanas</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>URL del curso</label>
          <input {...register('url')} type="url" placeholder="https://..." className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Descripción del plan y sus objetivos..."
            className="border-border text-navy-700 focus:ring-navy-400 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function TrainingPage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['training-stats'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: TrainingStats }>('/api/training/stats')
        .then((r) => r.data.data),
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['training-plans'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: TrainingPlan[] }>('/api/training')
        .then((r) => r.data.data),
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Capacitación</h1>
          <p className="text-navy-500 mt-1 text-sm">Planes de formación y desarrollo</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nuevo plan
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: GraduationCap,
            label: 'Planes activos',
            value: stats?.activePlans ?? '—',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            icon: Users,
            label: 'Empleados en formación',
            value: stats?.employeesInTraining ?? '—',
            color: 'bg-green-50 text-green-600',
          },
          {
            icon: Clock,
            label: 'Avance promedio',
            value: stats ? `${stats.avgCompletionPct}%` : '—',
            color: 'bg-navy-50 text-navy-600',
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-navy-900 text-2xl font-bold">{value}</p>
                <p className="text-navy-500 text-sm">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={16} className="text-navy-500" />
            Planes de capacitación
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-navy-400 text-sm">Cargando...</p>
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GraduationCap size={48} className="text-navy-100 mb-4" />
              <p className="text-navy-500 font-medium">No hay planes de capacitación</p>
              <p className="text-navy-400 mt-1 text-sm">
                Creá el primer plan para empezar a formar tu equipo
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={14} /> Crear plan
              </Button>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {plans.map((plan) => {
                const typeConfig = TYPE_CONFIG[plan.type] ?? {
                  label: plan.type,
                  color: 'bg-surface text-navy-600',
                };
                return (
                  <div key={plan.id} className="flex items-center justify-between py-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-navy-50 mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg">
                        <GraduationCap size={16} className="text-navy-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-navy-900 font-medium">{plan.title}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeConfig.color}`}
                          >
                            {typeConfig.label}
                          </span>
                        </div>
                        <p className="text-navy-400 mt-0.5 text-xs">
                          {plan.provider && <span>{plan.provider} · </span>}
                          {plan.duration && (
                            <span>
                              {plan.duration} {UNIT_LABELS[plan.durationUnit] ?? plan.durationUnit}{' '}
                              ·{' '}
                            </span>
                          )}
                          <span>{plan._count.enrollments} inscriptos</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {plan.url && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => window.open(plan.url, '_blank')}
                        >
                          <ExternalLink size={12} /> Ver curso
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-800">
          Próximamente: integración con LinkedIn Learning
        </p>
        <p className="mt-1 text-sm text-blue-700">
          Importá cursos directamente desde plataformas externas y hacé seguimiento del progreso
          automáticamente.
        </p>
      </div>

      <CreatePlanModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
