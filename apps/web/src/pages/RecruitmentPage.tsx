import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Modal } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  UserPlus,
  Search,
  Clock,
  CheckCircle,
  Users,
  Briefcase,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

interface RecruitmentSearch {
  id: string;
  title: string;
  departmentId?: string;
  seniority?: string;
  type: string;
  status: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location?: string;
  remote: boolean;
  description?: string;
  openedAt?: string;
  closedAt?: string;
  createdAt: string;
}

interface Candidate {
  id: string;
  searchId: string;
  firstName: string;
  lastName: string;
  email?: string;
  stage: string;
  source?: string;
  createdAt: string;
}

interface RecruitmentStats {
  totalSearches: number;
  openSearches: number;
  totalCandidates: number;
  byStageCounts: Record<string, number>;
  byStatusCounts: Record<string, number>;
}

const STAGES = [
  { id: 'SOURCING', label: 'Sourcing', color: 'bg-navy-100 text-navy-700' },
  { id: 'SCREENING', label: 'Screening', color: 'bg-blue-100 text-blue-700' },
  { id: 'INTERVIEW', label: 'Entrevistas', color: 'bg-purple-100 text-purple-700' },
  { id: 'TECHNICAL', label: 'Técnico', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'OFFER', label: 'Oferta', color: 'bg-amber-100 text-amber-700' },
  { id: 'HIRED', label: 'Contratado', color: 'bg-green-100 text-green-700' },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }
> = {
  OPEN: { label: 'Activa', variant: 'success' },
  PAUSED: { label: 'Pausada', variant: 'warning' },
  CLOSED: { label: 'Cerrada', variant: 'default' },
  FILLED: { label: 'Cubierta', variant: 'success' },
};

const CONTRACT_LABELS: Record<string, string> = {
  INDEFINIDO: 'Indefinido',
  PLAZO_FIJO: 'Plazo fijo',
  TEMPORADA: 'Temporada',
  PASANTIA: 'Pasantía',
  EVENTUAL: 'Eventual',
};

const selectClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const inputClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const labelClass = 'text-navy-700 mb-1.5 block text-sm font-medium';

const createSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  type: z.enum(['INDEFINIDO', 'PLAZO_FIJO', 'TEMPORADA', 'PASANTIA', 'EVENTUAL']),
  seniority: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean(),
  salaryMin: z.coerce.number().positive().optional().or(z.literal('')),
  salaryMax: z.coerce.number().positive().optional().or(z.literal('')),
  currency: z.string().default('ARS'),
  description: z.string().optional(),
});
type CreateFormValues = z.infer<typeof createSchema>;

function CreateSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { type: 'INDEFINIDO', remote: false, currency: 'ARS' },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateFormValues) =>
      apiClient.post('/api/recruitment/searches', {
        ...data,
        salaryMin: data.salaryMin !== '' && data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax: data.salaryMax !== '' && data.salaryMax ? Number(data.salaryMax) : undefined,
        seniority: data.seniority || undefined,
        location: data.location || undefined,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruitment-searches'] });
      qc.invalidateQueries({ queryKey: ['recruitment-stats'] });
      toast.success('Búsqueda creada');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo crear la búsqueda.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva búsqueda"
      description="Publicá una nueva búsqueda de talento."
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
              <UserPlus size={14} />
            )}
            {mutation.isPending ? 'Creando...' : 'Crear búsqueda'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Título del puesto *</label>
          <input
            {...register('title')}
            placeholder="ej. Desarrollador Backend Senior"
            className={inputClass}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tipo de contrato</label>
            <select {...register('type')} className={selectClass}>
              {Object.entries(CONTRACT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Seniority</label>
            <select {...register('seniority')} className={selectClass}>
              <option value="">Sin especificar</option>
              <option value="JUNIOR">Junior</option>
              <option value="SEMI_SENIOR">Semi Senior</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ubicación</label>
            <input
              {...register('location')}
              placeholder="ej. Buenos Aires"
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="remote"
              {...register('remote')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="remote" className="text-navy-700 text-sm">
              Posición remota
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Salario mín.</label>
            <input
              {...register('salaryMin')}
              type="number"
              placeholder="ej. 500000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Salario máx.</label>
            <input
              {...register('salaryMax')}
              type="number"
              placeholder="ej. 800000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Moneda</label>
            <select {...register('currency')} className={selectClass}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Descripción del rol y responsabilidades..."
            className="border-border text-navy-700 focus:ring-navy-400 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Add Candidate Modal ───────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  SOURCING: 'Sourcing',
  SCREENING: 'Screening',
  INTERVIEW: 'Entrevistas',
  TECHNICAL: 'Técnico',
  OFFER: 'Oferta',
  HIRED: 'Contratado',
  REJECTED: 'Rechazado',
};

const candidateSchema = z.object({
  searchId: z.string().min(1, 'Búsqueda requerida'),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  stage: z.enum(['SOURCING', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'OFFER', 'HIRED', 'REJECTED']),
  source: z.string().optional(),
});
type CandidateFormValues = z.infer<typeof candidateSchema>;

function AddCandidateModal({
  open,
  onClose,
  searches,
}: {
  open: boolean;
  onClose: () => void;
  searches: RecruitmentSearch[];
}) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { stage: 'SOURCING' },
  });

  const mutation = useMutation({
    mutationFn: (data: CandidateFormValues) =>
      apiClient.post('/api/recruitment/candidates', {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        source: data.source || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruitment-candidates'] });
      qc.invalidateQueries({ queryKey: ['recruitment-stats'] });
      toast.success('Candidato agregado');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo agregar el candidato.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agregar candidato"
      description="Sumá un candidato al pipeline de selección."
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
              <UserCheck size={14} />
            )}
            {mutation.isPending ? 'Guardando...' : 'Agregar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Búsqueda *</label>
          <select {...register('searchId')} className={selectClass}>
            <option value="">Seleccioná una búsqueda</option>
            {searches
              .filter((s) => s.status === 'OPEN')
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
          </select>
          {errors.searchId && (
            <p className="mt-1 text-xs text-red-500">{errors.searchId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input {...register('firstName')} placeholder="Juan" className={inputClass} />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Apellido *</label>
            <input {...register('lastName')} placeholder="Pérez" className={inputClass} />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="juan@ejemplo.com"
              className={inputClass}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input {...register('phone')} placeholder="+54 11 ..." className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Etapa *</label>
            <select {...register('stage')} className={selectClass}>
              {Object.entries(STAGE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Fuente</label>
            <input
              {...register('source')}
              placeholder="LinkedIn, referido, web..."
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function RecruitmentPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [activeTab, setActiveTab] = useState<'searches' | 'candidates'>('searches');
  const [stageFilter, setStageFilter] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['recruitment-stats'],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: RecruitmentStats }>(
        '/api/recruitment/stats',
      );
      return r.data.data;
    },
  });

  const { data: searchesData, isLoading: loadingSearches } = useQuery({
    queryKey: ['recruitment-searches'],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: RecruitmentSearch[];
        meta: { total: number };
      }>('/api/recruitment/searches', { params: { limit: 50 } });
      return r.data;
    },
  });

  const { data: candidatesData, isLoading: loadingCandidates } = useQuery({
    queryKey: ['recruitment-candidates', stageFilter],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: Candidate[];
        meta: { total: number };
      }>('/api/recruitment/candidates', {
        params: { limit: 100, stage: stageFilter || undefined },
      });
      return r.data;
    },
  });

  const searches = searchesData?.data ?? [];
  const candidates = candidatesData?.data ?? [];
  const candidatesByStage = stats?.byStageCounts ?? {};

  const hiredThisMonth = candidates.filter((c) => {
    if (c.stage !== 'HIRED') return false;
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Reclutamiento</h1>
          <p className="text-navy-500 mt-1 text-sm">Pipeline de búsqueda y selección de talento</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'candidates' ? (
            <Button variant="primary" size="sm" onClick={() => setShowAddCandidate(true)}>
              <UserCheck size={16} /> Agregar candidato
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              <UserPlus size={16} /> Nueva búsqueda
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline kanban — counts by stage */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {STAGES.map((stage) => {
          const count = candidatesByStage[stage.id] ?? 0;
          return (
            <button
              key={stage.id}
              onClick={() => {
                setActiveTab('candidates');
                setStageFilter(stage.id);
              }}
              className="border-border rounded-xl border bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <span
                className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stage.color}`}
              >
                {stage.label}
              </span>
              <p className="text-navy-900 text-2xl font-bold">{count}</p>
              <p className="text-navy-400 text-xs">candidatos</p>
            </button>
          );
        })}
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Briefcase,
            label: 'Búsquedas abiertas',
            value: stats ? String(stats.openSearches) : '—',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            icon: Users,
            label: 'Total de candidatos',
            value: stats ? String(stats.totalCandidates) : '—',
            color: 'bg-navy-50 text-navy-600',
          },
          {
            icon: CheckCircle,
            label: 'Contrataciones este mes',
            value: String(hiredThisMonth),
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

      {/* Tabs */}
      <div className="bg-surface-hover flex w-fit gap-1 rounded-lg p-1">
        {(['searches', 'candidates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              if (t === 'searches') setStageFilter('');
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t
                ? 'text-navy-900 bg-white shadow-sm'
                : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            {t === 'searches'
              ? `Búsquedas (${searchesData?.meta.total ?? 0})`
              : `Candidatos (${candidatesData?.meta.total ?? 0})`}
          </button>
        ))}
      </div>

      {activeTab === 'searches' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={16} className="text-navy-500" />
              Búsquedas activas
            </CardTitle>
          </CardHeader>
          <div className="divide-border divide-y">
            {loadingSearches ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="space-y-2">
                    <div className="bg-surface-hover h-4 w-48 animate-pulse rounded" />
                    <div className="bg-surface-hover h-3 w-32 animate-pulse rounded" />
                  </div>
                  <div className="bg-surface-hover h-6 w-20 animate-pulse rounded-full" />
                </div>
              ))
            ) : searches.length === 0 ? (
              <CardContent>
                <div className="py-12 text-center">
                  <UserPlus size={32} className="text-navy-200 mx-auto mb-2" />
                  <p className="text-navy-400 text-sm">Sin búsquedas registradas</p>
                </div>
              </CardContent>
            ) : (
              searches.map((s) => {
                const statusCfg = STATUS_CONFIG[s.status] ?? {
                  label: s.status,
                  variant: 'default' as const,
                };
                return (
                  <div
                    key={s.id}
                    className="hover:bg-surface flex cursor-pointer items-center justify-between px-6 py-4 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-navy-900 font-medium">{s.title}</p>
                        {s.remote && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                            Remoto
                          </span>
                        )}
                      </div>
                      <p className="text-navy-500 text-sm">
                        {CONTRACT_LABELS[s.type] ?? s.type}
                        {s.seniority && ` · ${s.seniority}`}
                        {s.location && ` · ${s.location}`}
                      </p>
                      {(s.salaryMin || s.salaryMax) && (
                        <p className="text-navy-400 mt-0.5 text-xs">
                          {s.currency} {s.salaryMin ? s.salaryMin.toLocaleString('es-AR') : '?'} –{' '}
                          {s.salaryMax ? s.salaryMax.toLocaleString('es-AR') : '?'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-navy-400 text-xs">
                        <Clock size={10} className="mr-1 inline" />
                        {formatDistanceToNow(new Date(s.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                      <Badge variant={statusCfg.variant} size="sm" dot>
                        {statusCfg.label}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={16} className="text-navy-500" />
              Candidatos
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-navy-400 text-sm">
                {candidatesData?.meta.total ?? 0} registros
              </span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="border-border text-navy-700 focus:ring-navy-400 h-8 rounded-lg border bg-white px-3 text-xs focus:outline-none focus:ring-1"
              >
                <option value="">Todas las etapas</option>
                {Object.entries(STAGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border bg-surface border-b text-left">
                  <th className="text-navy-500 px-4 py-3 font-semibold">Candidato</th>
                  <th className="text-navy-500 px-4 py-3 font-semibold">Etapa</th>
                  <th className="text-navy-500 px-4 py-3 font-semibold">Fuente</th>
                  <th className="text-navy-500 px-4 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {loadingCandidates ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="bg-surface-hover h-4 animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-navy-400 py-12 text-center">
                      <Users size={32} className="mx-auto mb-2 opacity-20" />
                      Sin candidatos{stageFilter ? ' en esta etapa' : ''}
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => {
                    const stage = STAGES.find((s) => s.id === c.stage);
                    return (
                      <tr key={c.id} className="hover:bg-surface transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-navy-900 font-medium">
                            {c.firstName} {c.lastName}
                          </p>
                          {c.email && <p className="text-navy-400 text-xs">{c.email}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {stage ? (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${stage.color}`}
                            >
                              {stage.label}
                            </span>
                          ) : (
                            <span className="text-navy-400">{c.stage}</span>
                          )}
                        </td>
                        <td className="text-navy-500 px-4 py-3 text-xs">{c.source ?? '—'}</td>
                        <td className="text-navy-400 px-4 py-3 text-xs">
                          {format(new Date(c.createdAt), 'dd/MM/yyyy', { locale: es })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateSearchModal open={showCreate} onClose={() => setShowCreate(false)} />
      <AddCandidateModal
        open={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        searches={searches}
      />
    </div>
  );
}
