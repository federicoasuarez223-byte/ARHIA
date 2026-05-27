import { Badge, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, Users } from 'lucide-react';

import apiClient from '@/services/api';

interface RiskScore {
  id: string;
  employeeId: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  overallScore: number;
  burnoutScore: number;
  flightRiskScore: number;
  trend: string;
  calculatedAt: string;
  employee: {
    firstName: string;
    lastName: string;
    legajo: string;
    position: string;
    department: { name: string };
  };
}

interface RiskStats {
  byLevel: { LOW: number; MEDIUM: number; HIGH: number; CRITICAL: number };
  avgOverallScore: number;
  topAtRisk: RiskScore[];
}

const LEVEL_CONFIG = {
  CRITICAL: {
    label: 'Crítico',
    variant: 'danger' as const,
    color: 'bg-red-500',
    light: 'bg-red-50 text-red-700',
  },
  HIGH: {
    label: 'Alto',
    variant: 'warning' as const,
    color: 'bg-amber-500',
    light: 'bg-amber-50 text-amber-700',
  },
  MEDIUM: {
    label: 'Medio',
    variant: 'info' as const,
    color: 'bg-blue-500',
    light: 'bg-blue-50 text-blue-700',
  },
  LOW: {
    label: 'Bajo',
    variant: 'success' as const,
    color: 'bg-green-500',
    light: 'bg-green-50 text-green-700',
  },
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'WORSENING') return <TrendingDown size={14} className="text-red-500" />;
  if (trend === 'IMPROVING') return <TrendingUp size={14} className="text-green-500" />;
  return <Minus size={14} className="text-navy-400" />;
}

export function RiskPage() {
  const { data: scoresData, isLoading } = useQuery({
    queryKey: ['risk-scores'],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: RiskScore[];
        meta: { total: number };
      }>('/api/risk/scores', { params: { limit: 50, sortBy: 'overallScore', sortOrder: 'desc' } });
      return r.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['risk-stats'],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: RiskStats }>('/api/risk/stats');
      return r.data;
    },
  });

  const scores = scoresData?.data ?? [];
  const stats = statsData?.data;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-navy-900 text-2xl font-bold">Riesgo</h1>
        <p className="text-navy-500 mt-1 text-sm">Monitoreo de riesgo y bienestar del equipo</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => {
          const cfg = LEVEL_CONFIG[level];
          const count = stats?.byLevel[level] ?? 0;
          return (
            <Card key={level}>
              <CardContent className="py-4">
                <div
                  className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.light}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.color}`} />
                  {cfg.label}
                </div>
                <p className="text-navy-900 text-3xl font-bold">{count}</p>
                <p className="text-navy-400 text-xs">empleados</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            Empleados por riesgo
          </CardTitle>
          <span className="text-navy-400 text-sm">{scoresData?.meta.total ?? 0} registros</span>
        </CardHeader>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-surface border-b text-left">
                <th className="text-navy-500 px-4 py-3 font-semibold">Empleado</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Departamento</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Nivel</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Score</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Burnout</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Fuga</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="bg-surface-hover h-5 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : scores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-navy-400 py-10 text-center">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    Sin datos de riesgo disponibles
                  </td>
                </tr>
              ) : (
                scores.map((s) => {
                  const cfg = LEVEL_CONFIG[s.level] ?? LEVEL_CONFIG.LOW;
                  return (
                    <tr key={s.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-navy-900 font-medium">
                          {s.employee.firstName} {s.employee.lastName}
                        </p>
                        <p className="text-navy-400 text-xs">
                          {s.employee.legajo} · {s.employee.position}
                        </p>
                      </td>
                      <td className="text-navy-600 px-4 py-3">
                        {s.employee.department?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={cfg.variant} size="sm" dot>
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-surface-hover h-1.5 w-20 overflow-hidden rounded-full">
                            <div
                              className={`h-full rounded-full ${cfg.color}`}
                              style={{ width: `${s.overallScore}%` }}
                            />
                          </div>
                          <span className="text-navy-600 font-mono text-xs">{s.overallScore}</span>
                        </div>
                      </td>
                      <td className="text-navy-600 px-4 py-3 text-center font-mono text-xs">
                        {s.burnoutScore}
                      </td>
                      <td className="text-navy-600 px-4 py-3 text-center font-mono text-xs">
                        {s.flightRiskScore}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <TrendIcon trend={s.trend} />
                          <span className="text-navy-500 text-xs">
                            {s.trend === 'WORSENING'
                              ? 'Empeora'
                              : s.trend === 'IMPROVING'
                                ? 'Mejora'
                                : 'Estable'}
                          </span>
                        </div>
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
