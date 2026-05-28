import { Button, Card, CardContent, CardHeader, CardTitle, Modal } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Heart, Star, Award, Smile, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Recognition {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  giver: { id: string; firstName: string; lastName: string };
  recipient: { id: string; firstName: string; lastName: string };
}

interface CultureStats {
  thisMonth: number;
  byType: Record<string, number>;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const RECOGNITION_TYPES = [
  { type: 'LOGRO', label: 'Logro', icon: '🏆' },
  { type: 'COMPANERO', label: 'Compañero', icon: '🤝' },
  { type: 'INNOVACION', label: 'Innovación', icon: '💡' },
  { type: 'LIDERAZGO', label: 'Liderazgo', icon: '🚀' },
  { type: 'CLIENTE', label: 'Clientes', icon: '❤️' },
  { type: 'ANTIGUEDAD', label: 'Antigüedad', icon: '⭐' },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  RECOGNITION_TYPES.map((r) => [r.type, r.label]),
);

const TYPE_ICON: Record<string, string> = Object.fromEntries(
  RECOGNITION_TYPES.map((r) => [r.type, r.icon]),
);

// ── Create Recognition Modal ──────────────────────────────────────────────────

const selectClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const inputClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const labelClass = 'text-navy-700 mb-1.5 block text-sm font-medium';

const recognitionSchema = z.object({
  recipientId: z.string().min(1, 'Destinatario requerido'),
  giverId: z.string().min(1, 'Emisor requerido'),
  type: z.enum(['LOGRO', 'ANTIGUEDAD', 'COMPANERO', 'LIDERAZGO', 'INNOVACION', 'CLIENTE']),
  title: z.string().min(1, 'Título requerido'),
  message: z.string().min(1, 'Mensaje requerido'),
});
type RecognitionFormValues = z.infer<typeof recognitionSchema>;

function CreateRecognitionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();

  const { data: employees } = useQuery({
    queryKey: ['employees-list-mini'],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: { id: string; firstName: string; lastName: string; legajo: string }[];
      }>('/api/employees', { params: { limit: 200, sortBy: 'lastName', sortOrder: 'asc' } });
      return r.data.data ?? [];
    },
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecognitionFormValues>({
    resolver: zodResolver(recognitionSchema),
    defaultValues: { type: 'LOGRO' },
  });

  const mutation = useMutation({
    mutationFn: (data: RecognitionFormValues) =>
      apiClient.post('/api/culture/recognitions', { ...data, isPublic: true, points: 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recognitions'] });
      qc.invalidateQueries({ queryKey: ['culture-stats'] });
      toast.success('Reconocimiento enviado');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo enviar el reconocimiento.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Dar reconocimiento"
      description="Reconocé el trabajo y los logros de un compañero."
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
              <Heart size={14} />
            )}
            {mutation.isPending ? 'Enviando...' : 'Reconocer'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Reconocer a *</label>
          <select {...register('recipientId')} className={selectClass}>
            <option value="">Seleccioná un empleado</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.legajo})
              </option>
            ))}
          </select>
          {errors.recipientId && (
            <p className="mt-1 text-xs text-red-500">{errors.recipientId.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>De parte de *</label>
          <select {...register('giverId')} className={selectClass}>
            <option value="">Seleccioná un empleado</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.legajo})
              </option>
            ))}
          </select>
          {errors.giverId && <p className="mt-1 text-xs text-red-500">{errors.giverId.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Categoría *</label>
          <select {...register('type')} className={selectClass}>
            {RECOGNITION_TYPES.map((r) => (
              <option key={r.type} value={r.type}>
                {r.icon} {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Título *</label>
          <input
            {...register('title')}
            placeholder="ej. Excelente trabajo en el proyecto X"
            className={inputClass}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Mensaje *</label>
          <textarea
            {...register('message')}
            rows={3}
            placeholder="Contá por qué reconocés a esta persona..."
            className="border-border text-navy-700 focus:ring-navy-400 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
        </div>
      </div>
    </Modal>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function CulturePage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['culture-stats'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: CultureStats }>('/api/culture/stats')
        .then((r) => r.data.data),
  });

  const { data: recognitionsData, isLoading } = useQuery({
    queryKey: ['recognitions'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Recognition[] }>('/api/culture/recognitions?limit=20')
        .then((r) => r.data.data),
  });

  const recognitions = recognitionsData ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Cultura</h1>
          <p className="text-navy-500 mt-1 text-sm">Reconocimientos y clima organizacional</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Dar reconocimiento
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Heart,
            label: 'Reconocimientos este mes',
            value: stats?.thisMonth ?? '—',
            color: 'bg-red-50 text-red-600',
          },
          {
            icon: Star,
            label: 'Tipos de reconocimiento',
            value: RECOGNITION_TYPES.length,
            color: 'bg-gold-50 text-gold-600',
          },
          {
            icon: Smile,
            label: 'Total reconocimientos',
            value: stats ? Object.values(stats.byType).reduce((s, n) => s + n, 0) : '—',
            color: 'bg-green-50 text-green-600',
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
            <Award size={16} className="text-gold-500" />
            Distribución por tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {RECOGNITION_TYPES.map((r) => (
              <div
                key={r.type}
                className="border-border flex flex-col items-center rounded-xl border p-4 text-center"
              >
                <span className="text-3xl">{r.icon}</span>
                <p className="text-navy-700 mt-2 text-xs font-semibold">{r.label}</p>
                <p className="text-navy-900 mt-1 text-2xl font-bold">
                  {stats?.byType[r.type] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            Feed de reconocimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-navy-400 text-sm">Cargando...</p>
            </div>
          ) : recognitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart size={40} className="text-navy-100 mb-3" />
              <p className="text-navy-500 font-medium">Aún no hay reconocimientos</p>
              <p className="text-navy-400 mt-1 text-sm">
                Sé el primero en reconocer el trabajo de un compañero
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setShowCreate(true)}
              >
                Dar reconocimiento
              </Button>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {recognitions.map((r) => (
                <div key={r.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-navy-900 font-medium">{r.title}</p>
                      <p className="text-navy-500 mt-0.5 text-sm">
                        <span className="font-medium">
                          {r.giver.firstName} {r.giver.lastName}
                        </span>{' '}
                        reconoció a{' '}
                        <span className="font-medium">
                          {r.recipient.firstName} {r.recipient.lastName}
                        </span>
                      </p>
                      <p className="text-navy-400 mt-1 text-sm">{r.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="bg-gold-50 text-gold-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                        {TYPE_ICON[r.type]} {TYPE_LABEL[r.type] ?? r.type}
                      </span>
                      <span className="text-navy-400 text-xs">
                        {formatDistanceToNow(new Date(r.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRecognitionModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
