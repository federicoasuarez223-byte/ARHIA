import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Modal } from '@arhia/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  Loader2,
  CheckCircle,
  Banknote,
} from 'lucide-react';
import { useState } from 'react';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

// ── Generate modal ────────────────────────────────────────────────────────────

const MONTH_NAMES = [
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

function GenerateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post('/api/payroll/generate', { periodYear: year, periodMonth: month }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll-records'] });
      qc.invalidateQueries({ queryKey: ['payroll-stats'] });
      toast.success(`Liquidación ${MONTH_NAMES[month]} ${year} generada`);
      onClose();
    },
    onError: () => toast.error('No se pudo generar la liquidación.'),
  });

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generar liquidación"
      description="Se calculará el sueldo neto de todos los empleados activos para el período seleccionado."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {mutation.isPending ? 'Generando...' : 'Generar'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-navy-700 mb-1.5 block text-sm font-medium">Mes</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {MONTH_NAMES[m]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-navy-700 mb-1.5 block text-sm font-medium">Año</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}

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

const MONTHS = MONTH_NAMES;

const STATUS_CFG: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  PAID: { label: 'Pagado', variant: 'success' },
  APPROVED: { label: 'Aprobado', variant: 'warning' },
  DRAFT: { label: 'Borrador', variant: 'default' },
};

function fmt(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function PayrollPage() {
  const qc = useQueryClient();
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState<string | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/api/payroll/${id}`, { status }),
    onError: () => toast.error('Error al actualizar el estado.'),
  });

  async function handleBulkUpdate(period: PeriodGroup, newStatus: string) {
    setBulkUpdating(period.key);
    try {
      await Promise.all(
        period.records.map((rec) => statusMutation.mutateAsync({ id: rec.id, status: newStatus })),
      );
      qc.invalidateQueries({ queryKey: ['payroll-records'] });
      qc.invalidateQueries({ queryKey: ['payroll-stats'] });
      const label = newStatus === 'APPROVED' ? 'aprobado' : 'marcado como pagado';
      toast.success(`Período ${period.label} ${label}`);
    } catch {
      // individual errors already toasted
    } finally {
      setBulkUpdating(null);
    }
  }

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
        <Button variant="primary" size="sm" onClick={() => setShowGenerate(true)}>
          <Plus size={16} /> Generar liquidación
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
                      {(p.status === 'DRAFT' || p.status === 'APPROVED') && (
                        <div className="border-border flex items-center justify-end gap-2 border-t px-6 py-3">
                          {p.status === 'DRAFT' && (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={bulkUpdating === p.key}
                              onClick={() => handleBulkUpdate(p, 'APPROVED')}
                            >
                              {bulkUpdating === p.key ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              {bulkUpdating === p.key ? 'Aprobando...' : 'Aprobar período'}
                            </Button>
                          )}
                          {p.status === 'APPROVED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={bulkUpdating === p.key}
                              onClick={() => handleBulkUpdate(p, 'PAID')}
                            >
                              {bulkUpdating === p.key ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Banknote size={14} />
                              )}
                              {bulkUpdating === p.key ? 'Procesando...' : 'Marcar como pagado'}
                            </Button>
                          )}
                        </div>
                      )}
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

      <GenerateModal open={showGenerate} onClose={() => setShowGenerate(false)} />
    </div>
  );
}
