import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserPlus, Search, Clock, CheckCircle, Users, Briefcase } from 'lucide-react';

import apiClient from '@/services/api';

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

export function RecruitmentPage() {
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

  const { data: recentCandidates } = useQuery({
    queryKey: ['recruitment-candidates-recent'],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: Candidate[] }>(
        '/api/recruitment/candidates',
        { params: { limit: 20 } },
      );
      return r.data.data ?? [];
    },
  });

  const searches = searchesData?.data ?? [];
  const candidatesByStage = stats?.byStageCounts ?? {};

  const hiredThisMonth = (recentCandidates ?? []).filter((c) => {
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
        <Button variant="primary" size="sm">
          <UserPlus size={16} /> Nueva búsqueda
        </Button>
      </div>

      {/* Pipeline kanban — counts by stage */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {STAGES.map((stage) => {
          const count = candidatesByStage[stage.id] ?? 0;
          return (
            <div key={stage.id} className="border-border rounded-xl border bg-white p-4 shadow-sm">
              <span
                className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stage.color}`}
              >
                {stage.label}
              </span>
              <p className="text-navy-900 text-2xl font-bold">{count}</p>
              <p className="text-navy-400 text-xs">candidatos</p>
            </div>
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

      {/* Active searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={16} className="text-navy-500" />
            Búsquedas
          </CardTitle>
          <span className="text-navy-400 text-sm">{searchesData?.meta.total ?? 0} registros</span>
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
                      {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: es })}
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
    </div>
  );
}
