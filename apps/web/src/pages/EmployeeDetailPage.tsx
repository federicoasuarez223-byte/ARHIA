import { Badge } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  User,
  Briefcase,
  Calendar,
  AlertTriangle,
  Star,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  TrendingDown,
  TrendingUp,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import apiClient from '@/services/api';

// ── Types ───────────────────────────────────────────────────────────────────

interface EmployeeDetail {
  id: string;
  legajo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dni?: string;
  cuil?: string;
  birthDate?: string;
  gender?: string;
  position: string;
  seniority?: string;
  hireDate: string;
  terminationDate?: string;
  employmentStatus: string;
  contractType: string;
  salary: number;
  currency: string;
  cct?: string;
  cctCategory?: string;
  vacationDays: number;
  usedVacationDays: number;
  city?: string;
  province?: string;
  address?: string;
  avatarUrl?: string;
  notes?: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  department: { id: string; name: string; code?: string };
  riskScores: { level: string; overallScore: number; burnoutScore: number; trend: string }[];
  contracts: { id: string; type: string; status: string; startDate: string; endDate?: string }[];
}

interface Contract {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  position: string;
  salary: number;
  currency: string;
  workingHours: number;
  notes?: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  overtime?: number;
  notes?: string;
}

interface RiskScore {
  id: string;
  level: string;
  overallScore: number;
  burnoutScore: number;
  flightRiskScore: number;
  engagementScore: number;
  trend: string;
  aiAnalysis?: string;
  calculatedAt: string;
}

interface PerformanceReview {
  id: string;
  period: string;
  type: string;
  status: string;
  score?: number;
  potential?: string;
  strengths: string[];
  improvements: string[];
  comments?: string;
  submittedAt?: string;
  completedAt?: string;
}

// ── Config maps ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  ACTIVE: { label: 'Activo', variant: 'success' },
  ON_LEAVE: { label: 'Licencia', variant: 'warning' },
  TERMINATED: { label: 'Desvinculado', variant: 'danger' },
  INACTIVE: { label: 'Inactivo', variant: 'default' },
};

const RISK_CONFIG: Record<
  string,
  { label: string; variant: 'danger' | 'warning' | 'info' | 'success'; color: string }
> = {
  CRITICAL: { label: 'Crítico', variant: 'danger', color: 'bg-red-500' },
  HIGH: { label: 'Alto', variant: 'warning', color: 'bg-amber-500' },
  MEDIUM: { label: 'Medio', variant: 'info', color: 'bg-blue-500' },
  LOW: { label: 'Bajo', variant: 'success', color: 'bg-green-500' },
};

const CONTRACT_LABELS: Record<string, string> = {
  INDEFINIDO: 'Indefinido',
  PLAZO_FIJO: 'Plazo fijo',
  TEMPORADA: 'Temporada',
  PASANTIA: 'Pasantía',
  EVENTUAL: 'Eventual',
};

const CONTRACT_STATUS: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }
> = {
  ACTIVE: { label: 'Vigente', variant: 'success' },
  DRAFT: { label: 'Borrador', variant: 'default' },
  EXPIRED: { label: 'Vencido', variant: 'danger' },
  TERMINATED: { label: 'Rescindido', variant: 'danger' },
};

const ATTENDANCE_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default'; icon: typeof CheckCircle }
> = {
  PRESENT: { label: 'Presente', variant: 'success', icon: CheckCircle },
  ABSENT: { label: 'Ausente', variant: 'danger', icon: XCircle },
  LATE: { label: 'Tarde', variant: 'warning', icon: Clock },
  HOLIDAY: { label: 'Feriado', variant: 'info' as 'default', icon: Calendar },
  VACATION: { label: 'Vacaciones', variant: 'info' as 'default', icon: Calendar },
  LEAVE: { label: 'Licencia', variant: 'warning', icon: Calendar },
};

// ── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="border-border flex justify-between border-b py-2.5 last:border-0">
      <span className="text-navy-500 text-sm">{label}</span>
      <span className="text-navy-900 text-sm font-medium">{value}</span>
    </div>
  );
}

function AvatarLarge({ employee }: { employee: EmployeeDetail }) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  if (employee.avatarUrl) {
    return (
      <img src={employee.avatarUrl} alt={initials} className="h-20 w-20 rounded-2xl object-cover" />
    );
  }
  return (
    <div className="bg-navy-100 text-navy-700 flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold">
      {initials}
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'WORSENING') return <TrendingDown size={14} className="text-red-500" />;
  if (trend === 'IMPROVING') return <TrendingUp size={14} className="text-green-500" />;
  return <Minus size={14} className="text-navy-400" />;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-surface-hover h-1.5 w-24 overflow-hidden rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-navy-600 font-mono text-xs">{value}</span>
    </div>
  );
}

// ── Tab panels ──────────────────────────────────────────────────────────────

function OverviewTab({ emp }: { emp: EmployeeDetail }) {
  const statusCfg = STATUS_CONFIG[emp.employmentStatus] ?? {
    label: emp.employmentStatus,
    variant: 'default' as const,
  };
  const risk = emp.riskScores[0];
  const riskCfg = risk ? RISK_CONFIG[risk.level] : null;
  const vacRemaining = emp.vacationDays - emp.usedVacationDays;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Personal */}
      <div className="border-border rounded-xl border bg-white p-5">
        <p className="text-navy-500 mb-4 text-xs font-semibold uppercase tracking-wider">
          Datos personales
        </p>
        <InfoRow label="Email" value={emp.email} />
        <InfoRow label="Teléfono" value={emp.phone} />
        <InfoRow label="DNI" value={emp.dni} />
        <InfoRow label="CUIL" value={emp.cuil} />
        <InfoRow
          label="Fecha de nacimiento"
          value={emp.birthDate ? format(new Date(emp.birthDate), 'dd/MM/yyyy') : undefined}
        />
        <InfoRow label="Género" value={emp.gender} />
        <InfoRow label="Ciudad" value={emp.city} />
        <InfoRow label="Provincia" value={emp.province} />
        <InfoRow label="Domicilio" value={emp.address} />
        {emp.emergencyContact && (
          <>
            <p className="text-navy-400 mb-2 mt-4 text-xs font-semibold uppercase tracking-wider">
              Contacto de emergencia
            </p>
            <InfoRow label="Nombre" value={emp.emergencyContact.name} />
            <InfoRow label="Teléfono" value={emp.emergencyContact.phone} />
            <InfoRow label="Relación" value={emp.emergencyContact.relation} />
          </>
        )}
      </div>

      {/* Employment */}
      <div className="space-y-4">
        <div className="border-border rounded-xl border bg-white p-5">
          <p className="text-navy-500 mb-4 text-xs font-semibold uppercase tracking-wider">
            Datos laborales
          </p>
          <InfoRow label="Legajo" value={emp.legajo} />
          <InfoRow label="Departamento" value={emp.department.name} />
          <InfoRow label="Cargo" value={emp.position} />
          <InfoRow label="Seniority" value={emp.seniority} />
          <InfoRow label="Estado" value={statusCfg.label} />
          <InfoRow label="Tipo de contrato" value={CONTRACT_LABELS[emp.contractType]} />
          <InfoRow label="Fecha de ingreso" value={format(new Date(emp.hireDate), 'dd/MM/yyyy')} />
          {emp.terminationDate && (
            <InfoRow
              label="Fecha de egreso"
              value={format(new Date(emp.terminationDate), 'dd/MM/yyyy')}
            />
          )}
          <InfoRow label="CCT" value={emp.cct} />
          <InfoRow label="Categoría CCT" value={emp.cctCategory} />
        </div>

        <div className="border-border rounded-xl border bg-white p-5">
          <p className="text-navy-500 mb-4 text-xs font-semibold uppercase tracking-wider">
            Remuneración y beneficios
          </p>
          <InfoRow
            label="Salario bruto"
            value={`${Number(emp.salary).toLocaleString('es-AR')} ${emp.currency}`}
          />
          <InfoRow label="Días de vacaciones" value={emp.vacationDays} />
          <InfoRow label="Días usados" value={emp.usedVacationDays} />
          <InfoRow label="Días disponibles" value={vacRemaining} />
        </div>

        {riskCfg && (
          <div className="border-border rounded-xl border bg-white p-5">
            <p className="text-navy-500 mb-3 text-xs font-semibold uppercase tracking-wider">
              Riesgo actual
            </p>
            <div className="flex items-center gap-3">
              <Badge variant={riskCfg.variant} size="sm" dot>
                {riskCfg.label}
              </Badge>
              <span className="text-navy-500 text-sm">Score: {risk.overallScore}</span>
              <div className="flex items-center gap-1">
                <TrendIcon trend={risk.trend} />
                <span className="text-navy-400 text-xs">
                  {risk.trend === 'WORSENING'
                    ? 'Empeora'
                    : risk.trend === 'IMPROVING'
                      ? 'Mejora'
                      : 'Estable'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContractsTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-contracts', employeeId],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: Contract[] }>('/api/contracts', {
        params: { employeeId, limit: 50 },
      });
      return r.data.data ?? [];
    },
  });

  if (isLoading)
    return <div className="text-navy-400 py-12 text-center text-sm">Cargando contratos...</div>;
  if (!data?.length)
    return <div className="text-navy-400 py-12 text-center text-sm">Sin contratos registrados</div>;

  return (
    <div className="space-y-3">
      {data.map((c) => {
        const st = CONTRACT_STATUS[c.status] ?? { label: c.status, variant: 'default' as const };
        return (
          <div key={c.id} className="border-border rounded-xl border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-navy-900 font-semibold">
                  {CONTRACT_LABELS[c.type] ?? c.type}
                </span>
                <Badge variant={st.variant} size="sm" dot>
                  {st.label}
                </Badge>
              </div>
              <span className="text-navy-900 font-mono font-semibold">
                {Number(c.salary).toLocaleString('es-AR')} {c.currency}
              </span>
            </div>
            <div className="text-navy-500 grid grid-cols-2 gap-2 text-sm">
              <span>
                Cargo: <strong className="text-navy-700">{c.position}</strong>
              </span>
              <span>
                Hs. semana: <strong className="text-navy-700">{c.workingHours}h</strong>
              </span>
              <span>
                Inicio:{' '}
                <strong className="text-navy-700">
                  {format(new Date(c.startDate), 'dd/MM/yyyy')}
                </strong>
              </span>
              {c.endDate && (
                <span>
                  Vencimiento:{' '}
                  <strong className="text-navy-700">
                    {format(new Date(c.endDate), 'dd/MM/yyyy')}
                  </strong>
                </span>
              )}
            </div>
            {c.notes && <p className="text-navy-400 mt-2 text-xs">{c.notes}</p>}
          </div>
        );
      })}
    </div>
  );
}

function AttendanceTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-attendance', employeeId],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: AttendanceRecord[] }>(
        '/api/attendance',
        {
          params: { employeeId, limit: 30, sortOrder: 'desc' },
        },
      );
      return r.data.data ?? [];
    },
  });

  if (isLoading)
    return <div className="text-navy-400 py-12 text-center text-sm">Cargando asistencia...</div>;
  if (!data?.length)
    return (
      <div className="text-navy-400 py-12 text-center text-sm">Sin registros de asistencia</div>
    );

  return (
    <div className="border-border overflow-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-border border-b text-left">
            <th className="text-navy-500 px-4 py-3 font-semibold">Fecha</th>
            <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
            <th className="text-navy-500 px-4 py-3 font-semibold">Entrada</th>
            <th className="text-navy-500 px-4 py-3 font-semibold">Salida</th>
            <th className="text-navy-500 px-4 py-3 font-semibold">Horas</th>
            <th className="text-navy-500 px-4 py-3 font-semibold">Extras</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {data.map((rec) => {
            const cfg = ATTENDANCE_CONFIG[rec.status] ?? {
              label: rec.status,
              variant: 'default' as const,
              icon: Calendar,
            };
            return (
              <tr key={rec.id} className="hover:bg-surface transition-colors">
                <td className="text-navy-700 px-4 py-3 font-medium">
                  {format(new Date(rec.date), 'EEE dd/MM/yyyy', { locale: es })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={cfg.variant} size="sm">
                    {cfg.label}
                  </Badge>
                </td>
                <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                  {rec.checkIn ? format(new Date(rec.checkIn), 'HH:mm') : '—'}
                </td>
                <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                  {rec.checkOut ? format(new Date(rec.checkOut), 'HH:mm') : '—'}
                </td>
                <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                  {rec.hoursWorked ? `${rec.hoursWorked}h` : '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {rec.overtime && Number(rec.overtime) > 0 ? (
                    <span className="text-amber-600">+{rec.overtime}h</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RiskTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-risk', employeeId],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: RiskScore[] }>('/api/risk/scores', {
        params: { employeeId, limit: 10, sortBy: 'calculatedAt', sortOrder: 'desc' },
      });
      return r.data.data ?? [];
    },
  });

  if (isLoading)
    return (
      <div className="text-navy-400 py-12 text-center text-sm">Cargando historial de riesgo...</div>
    );
  if (!data?.length)
    return <div className="text-navy-400 py-12 text-center text-sm">Sin scores de riesgo</div>;

  return (
    <div className="space-y-4">
      {data.map((score) => {
        const cfg = RISK_CONFIG[score.level] ?? RISK_CONFIG.LOW;
        return (
          <div key={score.id} className="border-border rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={cfg.variant} size="sm" dot>
                  {cfg.label}
                </Badge>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={score.trend} />
                  <span className="text-navy-400 text-xs">
                    {score.trend === 'WORSENING'
                      ? 'Empeora'
                      : score.trend === 'IMPROVING'
                        ? 'Mejora'
                        : 'Estable'}
                  </span>
                </div>
              </div>
              <span className="text-navy-400 text-xs">
                {formatDistanceToNow(new Date(score.calculatedAt), { addSuffix: true, locale: es })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'General', value: score.overallScore, color: cfg.color },
                { label: 'Burnout', value: score.burnoutScore, color: 'bg-red-400' },
                { label: 'Fuga', value: score.flightRiskScore, color: 'bg-amber-400' },
                { label: 'Engagement', value: score.engagementScore, color: 'bg-blue-400' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-navy-500 mb-1 text-xs">{label}</p>
                  <ScoreBar value={value} color={color} />
                </div>
              ))}
            </div>
            {score.aiAnalysis && (
              <p className="text-navy-500 border-border mt-3 border-t pt-3 text-sm">
                {score.aiAnalysis}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PerformanceTab({ employeeId }: { employeeId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-performance', employeeId],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: PerformanceReview[] }>(
        '/api/performance',
        {
          params: { employeeId, limit: 10 },
        },
      );
      return r.data.data ?? [];
    },
  });

  if (isLoading)
    return <div className="text-navy-400 py-12 text-center text-sm">Cargando evaluaciones...</div>;
  if (!data?.length)
    return (
      <div className="text-navy-400 py-12 text-center text-sm">Sin evaluaciones de desempeño</div>
    );

  const PERF_STATUS: Record<
    string,
    { label: string; variant: 'success' | 'warning' | 'default' | 'info' }
  > = {
    COMPLETED: { label: 'Completada', variant: 'success' },
    IN_PROGRESS: { label: 'En curso', variant: 'info' },
    PENDING: { label: 'Pendiente', variant: 'warning' },
    CANCELLED: { label: 'Cancelada', variant: 'default' },
  };

  return (
    <div className="space-y-4">
      {data.map((rev) => {
        const st = PERF_STATUS[rev.status] ?? { label: rev.status, variant: 'default' as const };
        return (
          <div key={rev.id} className="border-border rounded-xl border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-navy-900 font-semibold">{rev.period}</span>
                <Badge variant={st.variant} size="sm">
                  {st.label}
                </Badge>
                {rev.type && (
                  <Badge variant="default" size="sm">
                    {rev.type}
                  </Badge>
                )}
              </div>
              {rev.score != null && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-gold-500 fill-gold-500" />
                  <span className="text-navy-900 font-semibold">{rev.score}/100</span>
                </div>
              )}
            </div>
            {rev.comments && <p className="text-navy-600 mb-3 text-sm">{rev.comments}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              {rev.strengths.length > 0 && (
                <div>
                  <p className="text-navy-500 mb-1 text-xs font-semibold uppercase">Fortalezas</p>
                  <ul className="space-y-1">
                    {rev.strengths.map((s, i) => (
                      <li key={i} className="text-navy-700 flex items-start gap-1.5 text-sm">
                        <span className="mt-0.5 text-green-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {rev.improvements.length > 0 && (
                <div>
                  <p className="text-navy-500 mb-1 text-xs font-semibold uppercase">
                    Áreas de mejora
                  </p>
                  <ul className="space-y-1">
                    {rev.improvements.map((s, i) => (
                      <li key={i} className="text-navy-700 flex items-start gap-1.5 text-sm">
                        <span className="mt-0.5 text-amber-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {rev.completedAt && (
              <p className="text-navy-400 mt-3 text-xs">
                Completada{' '}
                {formatDistanceToNow(new Date(rev.completedAt), { addSuffix: true, locale: es })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Resumen', icon: User },
  { id: 'contracts', label: 'Contratos', icon: Briefcase },
  { id: 'attendance', label: 'Asistencia', icon: Calendar },
  { id: 'risk', label: 'Riesgo', icon: AlertTriangle },
  { id: 'performance', label: 'Desempeño', icon: Star },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const r = await apiClient.get<{ success: boolean; data: EmployeeDetail }>(
        `/api/employees/${id}`,
      );
      return r.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-surface-hover h-5 w-5 animate-pulse rounded" />
          <div className="bg-surface-hover h-5 w-40 animate-pulse rounded" />
        </div>
        <div className="bg-surface-hover h-32 animate-pulse rounded-2xl" />
        <div className="bg-surface-hover h-64 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="animate-fade-in py-20 text-center">
        <p className="text-navy-500">No se encontró el empleado.</p>
        <Link to="/employees" className="text-navy-900 mt-2 block text-sm underline">
          Volver a empleados
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[data.employmentStatus] ?? {
    label: data.employmentStatus,
    variant: 'default' as const,
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back link */}
      <Link
        to="/employees"
        className="text-navy-500 hover:text-navy-900 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft size={14} />
        Volver a empleados
      </Link>

      {/* Hero header */}
      <div className="border-border rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-start gap-5">
          <AvatarLarge employee={data} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-navy-900 text-2xl font-bold">
                {data.firstName} {data.lastName}
              </h1>
              <Badge variant={statusCfg.variant} size="sm" dot>
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-navy-600 mt-1 text-sm font-medium">{data.position}</p>
            <p className="text-navy-400 text-sm">
              {data.department.name} · Legajo {data.legajo}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <a
                href={`mailto:${data.email}`}
                className="text-navy-500 hover:text-navy-900 flex items-center gap-1.5 transition-colors"
              >
                <Mail size={13} /> {data.email}
              </a>
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="text-navy-500 hover:text-navy-900 flex items-center gap-1.5 transition-colors"
                >
                  <Phone size={13} /> {data.phone}
                </a>
              )}
              {data.city && (
                <span className="text-navy-500 flex items-center gap-1.5">
                  <MapPin size={13} /> {data.city}
                  {data.province ? `, ${data.province}` : ''}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-navy-900 text-xl font-bold">
              {Number(data.salary).toLocaleString('es-AR')}
              <span className="text-navy-400 ml-1 text-sm font-normal">{data.currency}</span>
            </p>
            <p className="text-navy-400 text-xs">Salario bruto mensual</p>
            <p className="text-navy-500 mt-2 text-xs">
              Desde {formatDistanceToNow(new Date(data.hireDate), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border border-b">
        <nav className="-mb-px flex gap-1">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tabId
                  ? 'border-navy-900 text-navy-900'
                  : 'text-navy-400 hover:border-navy-200 hover:text-navy-700 border-transparent'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <OverviewTab emp={data} />}
        {activeTab === 'contracts' && <ContractsTab employeeId={data.id} />}
        {activeTab === 'attendance' && <AttendanceTab employeeId={data.id} />}
        {activeTab === 'risk' && <RiskTab employeeId={data.id} />}
        {activeTab === 'performance' && <PerformanceTab employeeId={data.id} />}
      </div>
    </div>
  );
}
