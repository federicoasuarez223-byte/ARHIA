import { Card, CardContent, CardHeader, CardTitle, Badge } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  AlertTriangle,
  TrendingUp,
  Building2,
  FileText,
} from 'lucide-react';
import type { ElementType } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { employeesService } from '@/services/employees';

const CONTRACT_LABELS: Record<string, string> = {
  INDEFINIDO: 'Indefinido',
  PLAZO_FIJO: 'Plazo fijo',
  TEMPORADA: 'Temporada',
  PASANTIA: 'Pasantía',
  EVENTUAL: 'Eventual',
};

const PIE_COLORS = ['#3351F5', '#D4A843', '#10B981', '#F59E0B', '#6366F1'];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: ElementType;
  label: string;
  value: number | string;
  sub?: string;
  accent?: 'green' | 'gold' | 'red' | 'blue';
}) {
  const accents = {
    green: 'bg-green-50 text-green-600',
    gold: 'bg-gold-50 text-gold-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-navy-50 text-navy-600',
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accents[accent ?? 'blue']}`}
        >
          <Icon size={22} />
        </div>
        <div>
          <p className="text-navy-900 text-2xl font-bold">{value}</p>
          <p className="text-navy-500 text-sm">{label}</p>
          {sub && <p className="text-navy-400 mt-0.5 text-xs">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => employeesService.getStats(),
  });

  const stats = data?.data;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-navy-900 text-2xl font-bold">Dashboard</h1>
        <p className="text-navy-500 mt-1 text-sm">Vista general de tu organización</p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="bg-surface-hover h-14 animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total empleados" value={stats?.total ?? 0} accent="blue" />
          <StatCard icon={UserCheck} label="Activos" value={stats?.active ?? 0} accent="green" />
          <StatCard icon={UserX} label="De licencia" value={stats?.onLeave ?? 0} accent="gold" />
          <StatCard
            icon={UserPlus}
            label="Ingresos este mes"
            value={stats?.newThisMonth ?? 0}
            accent="blue"
          />
        </div>
      )}

      {/* Risk alerts + by department */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Risk summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Alertas de riesgo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-surface-hover h-10 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-red-700">Crítico</span>
                  </div>
                  <Badge variant="danger" size="lg">
                    {stats?.riskCritical ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-amber-700">Alto</span>
                  </div>
                  <Badge variant="warning" size="lg">
                    {stats?.riskHigh ?? 0}
                  </Badge>
                </div>
                {(stats?.riskCritical ?? 0) === 0 && (stats?.riskHigh ?? 0) === 0 && (
                  <p className="text-navy-400 py-2 text-center text-sm">Sin alertas activas</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* By department */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={16} className="text-navy-500" />
              Empleados por departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="bg-surface-hover h-48 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={stats?.byDepartment ?? []}
                  margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                    formatter={(v) => [`${v} empleados`, '']}
                  />
                  <Bar dataKey="count" fill="#3351F5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* By contract type */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={16} className="text-navy-500" />
              Tipo de contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="bg-surface-hover h-48 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={(stats?.byContractType ?? []).map((c) => ({
                      name: CONTRACT_LABELS[c.type] ?? c.type,
                      value: c.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(stats?.byContractType ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={16} className="text-navy-500" />
              Resumen ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface-hover h-8 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: 'Tasa de activos',
                    value:
                      stats && stats.total > 0
                        ? `${Math.round((stats.active / stats.total) * 100)}%`
                        : '—',
                    color: 'bg-green-500',
                    pct: stats && stats.total > 0 ? (stats.active / stats.total) * 100 : 0,
                  },
                  {
                    label: 'En riesgo alto/crítico',
                    value:
                      stats && stats.total > 0
                        ? `${Math.round(((stats.riskCritical + stats.riskHigh) / stats.total) * 100)}%`
                        : '—',
                    color: 'bg-red-500',
                    pct:
                      stats && stats.total > 0
                        ? ((stats.riskCritical + stats.riskHigh) / stats.total) * 100
                        : 0,
                  },
                  {
                    label: 'De licencia',
                    value:
                      stats && stats.total > 0
                        ? `${Math.round((stats.onLeave / stats.total) * 100)}%`
                        : '—',
                    color: 'bg-amber-500',
                    pct: stats && stats.total > 0 ? (stats.onLeave / stats.total) * 100 : 0,
                  },
                ].map(({ label, value, color, pct }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-navy-600 text-sm">{label}</span>
                      <span className="text-navy-900 text-sm font-semibold">{value}</span>
                    </div>
                    <div className="bg-surface-hover h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
