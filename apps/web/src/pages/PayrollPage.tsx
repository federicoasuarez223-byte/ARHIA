import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Download, TrendingUp, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import apiClient from '@/services/api';

interface PayrollRecord {
  id: string;
  employeeId: string;
  periodYear: number;
  periodMonth: number;
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
  jubilacion: number;
  obraSocial: number;
  anssal: number;
  ley19032: number;
  currency: string;
  status: string;
  paidAt?: string;
  employee: {
    firstName: string;
    lastName: string;
    legajo: string;
    department: { name: string };
  };
}

interface PayrollStats {
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  employeeCount: number;
  byStatus: { DRAFT: number; APPROVED: number; PAID: number };
}

interface PeriodGroup {
  key: string;
  label: string;
  year: number;
  month: number;
  records: PayrollRecord[];
  totalGross: number;
  totalNet: number;
  status: string;
}

const MONTHS = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const STATUS_CFG: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  PAID: { label: 'Pagado', variant: 'success' },
  APPROVED: { label: 'Aprobado', variant: 'warning' },
  DRAFT: { label: 'Borrador', variant: 'default' },
};

function fmt(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function PayrollPage() {
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ['payroll-records'],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: PayrollRecord[];
        meta: { total: number };
      }>('/api/payroll', { params: { limit: 100, sortBy: 'periodYear', sortOrder: 'desc' } });
      return r.data.data ?? [];
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['payroll-stats'],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: PayrollStats }>('/api/payroll/stats');
      return r.data.data;
    },
  });

  // Group records by period
  const periods: PeriodGroup[] = [];
  if (records) {
    const map = new Map<string, PeriodGroup>();
    for (const rec of records) {
      const key = `${rec.periodYear}-${String(rec.periodMonth).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${MONTHS[rec.periodMonth]} ${rec.periodYear}`,
          year: rec.periodYear,
          month: rec.periodMonth,
          records: [],
          totalGross: 0,
          totalNet: 0,
          status: rec.status,
        });
      }
      const g = map.get(key)!;
      g.records.push(rec);
      g.totalGross += Number(rec.grossSalary);
      g.totalNet += Number(rec.netSalary);
      if (rec.status !== 'PAID') g.status = rec.status;
    }
    periods.push(...Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key)));
  }

  const stats = statsData;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Liquidaciones</h1>
          <p className="text-navy-500 mt-1 text-sm">Gestión de sueldos y recibos de haberes</p>
        </div>
        <Button variant="outline" size="sm">
          <Download size={16} /> Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: DollarSign,
            label: 'Masa salarial bruta',
            value: stats ? `ARS ${fmt(Number(stats.totalGross))}` : '—',
            color: 'bg-navy-50 text-navy-600',
          },
          {
            icon: TrendingUp,
            label: 'Total neto liquidado',
            value: stats ? `ARS ${fmt(Number(stats.totalNet))}` : '—',
            color: 'bg-green-50 text-green-600',
          },
          {
            icon: Users,
            label: 'Empleados con recibo',
            value: stats ? String(stats.employeeCount) : '—',
            color: 'bg-gold-50 text-gold-600',
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-navy-900 text-xl font-bold">{value}</p>
                <p className="text-navy-500 text-sm">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status summary chips */}
      {stats && (
        <div className="flex gap-3">
          {Object.entries(stats.byStatus).map(([status, count]) => {
            const cfg = STATUS_CFG[status] ?? { label: status, variant: 'default' as const };
            return (
              <div
                key={status}
                className="border-border flex items-center gap-2 rounded-lg border bg-white px-4 py-2"
              >
                <Badge variant={cfg.variant} size="sm" dot>
                  {cfg.label}
                </Badge>
                <span className="text-navy-700 text-sm font-semibold">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={16} className="text-navy-500" />
            Períodos de liquidación
          </CardTitle>
          <span className="text-navy-400 text-sm">{periods.length} períodos</span>
        </CardHeader>

        {isLoading ? (
          <div className="divide-border divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="space-y-2">
                  <div className="bg-surface-hover h-4 w-32 animate-pulse rounded" />
                  <div className="bg-surface-hover h-3 w-20 animate-pulse rounded" />
                </div>
                <div className="bg-surface-hover h-4 w-40 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : periods.length === 0 ? (
          <CardContent>
            <div className="py-12 text-center">
              <DollarSign size={32} className="text-navy-200 mx-auto mb-2" />
              <p className="text-navy-400 text-sm">No hay liquidaciones registradas</p>
            </div>
          </CardContent>
        ) : (
          <div className="divide-border divide-y">
            {periods.map((p) => {
              const cfg = STATUS_CFG[p.status] ?? { label: p.status, variant: 'default' as const };
              const isExpanded = expandedPeriod === p.key;
              return (
                <div key={p.key}>
                  <button
                    onClick={() => setExpandedPeriod(isExpanded ? null : p.key)}
                    className="hover:bg-surface flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-navy-400" />
                      ) : (
                        <ChevronRight size={16} className="text-navy-400" />
                      )}
                      <div>
                        <p className="text-navy-900 font-semibold">{p.label}</p>
                        <p className="text-navy-500 text-sm">{p.records.length} empleados</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-navy-900 font-semibold">ARS {fmt(p.totalNet)}</p>
                        <p className="text-navy-400 text-xs">neto · bruto {fmt(p.totalGross)}</p>
                      </div>
                      <Badge variant={cfg.variant} size="sm" dot>
                        {cfg.label}
                      </Badge>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-surface border-border border-t">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-border border-b text-left">
                            <th className="text-navy-500 px-6 py-2.5 font-semibold">Empleado</th>
                            <th className="text-navy-500 px-4 py-2.5 font-semibold">Dpto.</th>
                            <th className="text-navy-500 px-4 py-2.5 text-right font-semibold">
                              Bruto
                            </th>
                            <th className="text-navy-500 px-4 py-2.5 text-right font-semibold">
                              Retenciones
                            </th>
                            <th className="text-navy-500 px-4 py-2.5 text-right font-semibold">
                              Neto
                            </th>
                            <th className="text-navy-500 px-4 py-2.5 font-semibold">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                          {p.records.map((rec) => {
                            const st = STATUS_CFG[rec.status] ?? {
                              label: rec.status,
                              variant: 'default' as const,
                            };
                            return (
                              <tr key={rec.id} className="transition-colors hover:bg-white">
                                <td className="px-6 py-3">
                                  <p className="text-navy-900 font-medium">
                                    {rec.employee.firstName} {rec.employee.lastName}
                                  </p>
                                  <p className="text-navy-400 text-xs">{rec.employee.legajo}</p>
                                </td>
                                <td className="text-navy-600 px-4 py-3 text-sm">
                                  {rec.employee.department?.name ?? '—'}
                                </td>
                                <td className="text-navy-700 px-4 py-3 text-right font-mono text-xs">
                                  {fmt(Number(rec.grossSalary))}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs text-red-500">
                                  -{fmt(Number(rec.totalDeductions))}
                                </td>
                                <td className="text-navy-900 px-4 py-3 text-right font-mono text-xs font-semibold">
                                  {fmt(Number(rec.netSalary))}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant={st.variant} size="sm">
                                    {st.label}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="border-gold-200 bg-gold-50 rounded-xl border p-4">
        <p className="text-gold-800 text-sm font-medium">Integración con AFIP</p>
        <p className="text-gold-700 mt-1 text-sm">
          Próximamente: integración con AFIP y exportación F931 para declaraciones mensuales.
        </p>
      </div>
    </div>
  );
}
