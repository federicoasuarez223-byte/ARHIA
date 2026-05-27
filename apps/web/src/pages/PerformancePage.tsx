import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Plus, Star, Target, Users, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import apiClient from '@/services/api';

interface PerformanceReview {
  id: string;
  employeeId: string;
  period: string;
  type: string;
  status: string;
  score?: number;
  potential?: string;
  strengths: string[];
  improvements: string[];
  comments?: string;
  completedAt?: string;
  createdAt: string;
  employee: {
    firstName: string;
    lastName: string;
    legajo: string;
    department: { name: string };
  };
  reviewer?: {
    firstName: string;
    lastName: string;
  };
}

const POTENTIAL_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'default' }
> = {
  HIGH_POTENTIAL: { label: 'Alto potencial', variant: 'success' },
  PROMOTABLE: { label: 'Promocionable', variant: 'info' },
  KEY_CONTRIBUTOR: { label: 'Clave', variant: 'info' },
  STABLE: { label: 'Estable', variant: 'default' },
  UNDERPERFORMER: { label: 'Bajo desempeño', variant: 'danger' },
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> =
  {
    COMPLETED: { label: 'Completada', variant: 'success' },
    IN_PROGRESS: { label: 'En progreso', variant: 'warning' },
    PENDING: { label: 'Pendiente', variant: 'default' },
    CANCELLED: { label: 'Cancelada', variant: 'default' },
  };

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Anual',
  QUARTERLY: 'Trimestral',
  '180': '180°',
  '360': '360°',
};

function ScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-navy-900 font-semibold">{score}</span>
    </div>
  );
}

export function PerformancePage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['performance-reviews', page, statusFilter],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: PerformanceReview[];
        meta: { total: number; pages: number };
      }>('/api/performance', {
        params: { page, limit, status: statusFilter || undefined },
      });
      return r.data;
    },
  });

  const reviews = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  // Derive stats from reviews
  const pending = reviews.filter((r) => r.status === 'PENDING').length;
  const inProgress = reviews.filter((r) => r.status === 'IN_PROGRESS').length;
  const completed = reviews.filter((r) => r.status === 'COMPLETED').length;
  const scores = reviews.filter((r) => r.score != null).map((r) => r.score!);
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // Potential distribution
  const potentialMap: Record<string, number> = {};
  for (const r of reviews) {
    if (r.potential) potentialMap[r.potential] = (potentialMap[r.potential] ?? 0) + 1;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Performance</h1>
          <p className="text-navy-500 mt-1 text-sm">Evaluaciones de desempeño y desarrollo</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} /> Nueva evaluación
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Pendientes',
            value: isLoading ? '—' : String(pending),
            color: 'bg-amber-50 text-amber-600',
            icon: Target,
          },
          {
            label: 'En progreso',
            value: isLoading ? '—' : String(inProgress),
            color: 'bg-blue-50 text-blue-600',
            icon: TrendingUp,
          },
          {
            label: 'Completadas',
            value: isLoading ? '—' : String(completed),
            color: 'bg-green-50 text-green-600',
            icon: CheckCircle,
          },
          {
            label: 'Score promedio',
            value: isLoading ? '—' : avgScore != null ? String(avgScore) : '—',
            color: 'bg-navy-50 text-navy-600',
            icon: Star,
          },
        ].map(({ label, value, color, icon: Icon }) => (
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

      {/* Potential matrix */}
      {Object.keys(potentialMap).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={16} className="text-navy-500" />
              Distribución de potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(potentialMap).map(([key, count]) => {
                const cfg = POTENTIAL_CONFIG[key] ?? { label: key, variant: 'default' as const };
                return (
                  <div
                    key={key}
                    className="border-border flex items-center gap-2 rounded-lg border bg-white px-4 py-2"
                  >
                    <Badge variant={cfg.variant} size="sm">
                      {cfg.label}
                    </Badge>
                    <span className="text-navy-700 font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={16} className="text-navy-500" />
            Evaluaciones
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-navy-400 text-sm">{total} registros</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border-border text-navy-700 focus:ring-navy-400 h-8 rounded-lg border bg-white px-3 text-xs focus:outline-none focus:ring-1"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completadas</option>
            </select>
          </div>
        </CardHeader>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-border border-b text-left">
                <th className="text-navy-500 px-4 py-3 font-semibold">Empleado</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Período</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Tipo</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Score</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Potencial</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Evaluador</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="bg-surface-hover h-4 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-navy-400 py-12 text-center">
                    <TrendingUp size={32} className="mx-auto mb-2 opacity-20" />
                    {statusFilter
                      ? 'Sin evaluaciones con ese estado'
                      : 'No hay evaluaciones de desempeño'}
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => {
                  const statusCfg = STATUS_CONFIG[rev.status] ?? {
                    label: rev.status,
                    variant: 'default' as const,
                  };
                  const potentialCfg = rev.potential
                    ? (POTENTIAL_CONFIG[rev.potential] ?? {
                        label: rev.potential,
                        variant: 'default' as const,
                      })
                    : null;
                  return (
                    <tr key={rev.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-navy-900 font-medium">
                          {rev.employee.firstName} {rev.employee.lastName}
                        </p>
                        <p className="text-navy-400 text-xs">{rev.employee.department?.name}</p>
                      </td>
                      <td className="text-navy-700 px-4 py-3">{rev.period}</td>
                      <td className="text-navy-600 px-4 py-3">
                        {TYPE_LABELS[rev.type] ?? rev.type}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusCfg.variant} size="sm" dot>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {rev.score != null ? (
                          <ScoreDot score={rev.score} />
                        ) : (
                          <span className="text-navy-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {potentialCfg ? (
                          <Badge variant={potentialCfg.variant} size="sm">
                            {potentialCfg.label}
                          </Badge>
                        ) : (
                          <span className="text-navy-300">—</span>
                        )}
                      </td>
                      <td className="text-navy-600 px-4 py-3 text-xs">
                        {rev.reviewer ? (
                          `${rev.reviewer.firstName} ${rev.reviewer.lastName}`
                        ) : (
                          <span className="text-navy-300">—</span>
                        )}
                      </td>
                      <td className="text-navy-500 px-4 py-3 text-xs">
                        {rev.completedAt
                          ? format(new Date(rev.completedAt), 'dd/MM/yyyy')
                          : formatDistanceToNow(new Date(rev.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
