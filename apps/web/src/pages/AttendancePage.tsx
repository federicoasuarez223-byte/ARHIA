import { Badge, Button, Card, CardHeader, CardTitle, Modal } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ChevronLeft, ChevronRight, Calendar, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  notes?: string;
  employee: { firstName: string; lastName: string; legajo: string };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'danger' | 'warning' | 'default' | 'info' }
> = {
  PRESENT: { label: 'Presente', variant: 'success' },
  ABSENT: { label: 'Ausente', variant: 'danger' },
  LATE: { label: 'Tarde', variant: 'warning' },
  HALF_DAY: { label: 'Medio día', variant: 'info' },
  REMOTE: { label: 'Remoto', variant: 'default' },
  HOLIDAY: { label: 'Feriado', variant: 'default' },
  LEAVE: { label: 'Licencia', variant: 'info' },
  VACATION: { label: 'Vacaciones', variant: 'info' },
  SICK_LEAVE: { label: 'Licencia médica', variant: 'warning' },
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  VACACIONES: 'Vacaciones',
  ENFERMEDAD: 'Enfermedad',
  LICENCIA_PERSONAL: 'Lic. personal',
  LICENCIA_MATERNIDAD: 'Lic. maternidad',
  LICENCIA_PATERNIDAD: 'Lic. paternidad',
  ESTUDIO: 'Estudio',
  DUELO: 'Duelo',
};

const LEAVE_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  APPROVED: { label: 'Aprobada', variant: 'success' },
  REJECTED: { label: 'Rechazada', variant: 'danger' },
  CANCELLED: { label: 'Cancelada', variant: 'default' },
};

const selectClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const inputClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const labelClass = 'text-navy-700 mb-1.5 block text-sm font-medium';

// ── Register Attendance Modal ─────────────────────────────────────────────────

const attendanceSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'REMOTE', 'HOLIDAY', 'LEAVE']),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  hoursWorked: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
});
type AttendanceFormValues = z.infer<typeof attendanceSchema>;

function RegisterAttendanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      status: 'PRESENT',
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: AttendanceFormValues) =>
      apiClient.post('/api/attendance', {
        ...data,
        hoursWorked:
          data.hoursWorked !== '' && data.hoursWorked ? Number(data.hoursWorked) : undefined,
        checkIn: data.checkIn || undefined,
        checkOut: data.checkOut || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Asistencia registrada');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo registrar la asistencia.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar asistencia"
      description="Registrá la asistencia de un empleado para una fecha."
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
              <Clock size={14} />
            )}
            {mutation.isPending ? 'Guardando...' : 'Registrar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Empleado *</label>
          <select {...register('employeeId')} className={selectClass}>
            <option value="">Seleccioná un empleado</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.legajo})
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha *</label>
            <input {...register('date')} type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estado *</label>
            <select {...register('status')} className={selectClass}>
              <option value="PRESENT">Presente</option>
              <option value="ABSENT">Ausente</option>
              <option value="LATE">Tarde</option>
              <option value="HALF_DAY">Medio día</option>
              <option value="REMOTE">Remoto</option>
              <option value="HOLIDAY">Feriado</option>
              <option value="LEAVE">Licencia</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Entrada</label>
            <input {...register('checkIn')} type="time" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Salida</label>
            <input {...register('checkOut')} type="time" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Horas</label>
            <input
              {...register('hoursWorked')}
              type="number"
              step="0.5"
              placeholder="8"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Observaciones..."
            className="border-border text-navy-700 focus:ring-navy-400 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Create Leave Modal ────────────────────────────────────────────────────────

const leaveSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  type: z.enum([
    'VACACIONES',
    'ENFERMEDAD',
    'LICENCIA_PERSONAL',
    'LICENCIA_MATERNIDAD',
    'LICENCIA_PATERNIDAD',
    'ESTUDIO',
    'DUELO',
  ]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.coerce.number().int().min(1, 'Mínimo 1 día'),
  reason: z.string().optional(),
});
type LeaveFormValues = z.infer<typeof leaveSchema>;

function CreateLeaveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: 'VACACIONES',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      days: 1,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: LeaveFormValues) =>
      apiClient.post('/api/attendance/leaves', {
        ...data,
        reason: data.reason || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Licencia solicitada');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo crear la licencia.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Solicitar licencia"
      description="Registrá una solicitud de licencia para un empleado."
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
              <Plus size={14} />
            )}
            {mutation.isPending ? 'Guardando...' : 'Solicitar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Empleado *</label>
          <select {...register('employeeId')} className={selectClass}>
            <option value="">Seleccioná un empleado</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.legajo})
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tipo *</label>
            <select {...register('type')} className={selectClass}>
              {Object.entries(LEAVE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Días *</label>
            <input {...register('days')} type="number" min="1" className={inputClass} />
            {errors.days && <p className="mt-1 text-xs text-red-500">{errors.days.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Desde *</label>
            <input {...register('startDate')} type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hasta *</label>
            <input {...register('endDate')} type="date" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Motivo</label>
          <textarea
            {...register('reason')}
            rows={2}
            placeholder="Justificación opcional..."
            className="border-border text-navy-700 focus:ring-navy-400 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AttendancePage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'attendance' | 'leaves'>('attendance');
  const [showAttendance, setShowAttendance] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const limit = 25;

  const leaveActionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      apiClient.patch(`/api/attendance/leaves/${id}`, { status }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success(status === 'APPROVED' ? 'Licencia aprobada' : 'Licencia rechazada');
      setApprovingId(null);
    },
    onError: () => toast.error('No se pudo actualizar la licencia.'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', page, tab],
    queryFn: async () => {
      const url = tab === 'leaves' ? '/api/attendance/leaves' : '/api/attendance';
      const r = await apiClient.get<{
        data: AttendanceRecord[];
        meta: { total: number; pages: number };
      }>(url, { params: { page, limit } });
      return r.data;
    },
  });

  const records = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const pages = data?.meta.pages ?? 1;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Asistencia</h1>
          <p className="text-navy-500 mt-1 text-sm">Control de presencia y licencias</p>
        </div>
        <div className="flex gap-2">
          {tab === 'leaves' ? (
            <Button variant="primary" size="sm" onClick={() => setShowLeave(true)}>
              <Plus size={16} /> Solicitar licencia
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setShowAttendance(true)}>
              <Clock size={16} /> Registrar asistencia
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface-hover flex w-fit gap-1 rounded-lg p-1">
        {(['attendance', 'leaves'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'text-navy-900 bg-white shadow-sm' : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            {t === 'attendance' ? 'Asistencia' : 'Licencias'}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={16} className="text-navy-500" />
            {tab === 'attendance'
              ? `Registros de asistencia (${total})`
              : `Solicitudes de licencia (${total})`}
          </CardTitle>
        </CardHeader>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-surface border-b text-left">
                <th className="text-navy-500 px-4 py-3 font-semibold">Empleado</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">
                  {tab === 'leaves' ? 'Tipo' : 'Fecha'}
                </th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
                {tab === 'attendance' ? (
                  <>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Entrada</th>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Salida</th>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Horas</th>
                  </>
                ) : (
                  <>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Desde</th>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Hasta</th>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Días</th>
                    <th className="text-navy-500 px-4 py-3 font-semibold" />
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="bg-surface-hover h-5 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-navy-400 py-10 text-center">
                    Sin registros
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  if (tab === 'attendance') {
                    const cfg = STATUS_CONFIG[r.status] ?? {
                      label: r.status,
                      variant: 'default' as const,
                    };
                    return (
                      <tr key={r.id} className="hover:bg-surface transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-navy-900 font-medium">
                            {r.employee.firstName} {r.employee.lastName}
                          </p>
                          <p className="text-navy-400 text-xs">{r.employee.legajo}</p>
                        </td>
                        <td className="text-navy-600 px-4 py-3">
                          {format(new Date(r.date), 'dd/MM/yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={cfg.variant} size="sm" dot>
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                          {r.checkIn ? format(new Date(r.checkIn), 'HH:mm') : '—'}
                        </td>
                        <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                          {r.checkOut ? format(new Date(r.checkOut), 'HH:mm') : '—'}
                        </td>
                        <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                          {r.hoursWorked ?? '—'}
                        </td>
                      </tr>
                    );
                  }
                  // Leaves view — record shape differs
                  const leave = r as unknown as {
                    id: string;
                    type: string;
                    status: string;
                    startDate: string;
                    endDate: string;
                    days: number;
                    employee: { firstName: string; lastName: string; legajo: string };
                  };
                  const leaveCfg = LEAVE_STATUS_CONFIG[leave.status] ?? {
                    label: leave.status,
                    variant: 'default' as const,
                  };
                  const isActioning = approvingId === leave.id;
                  return (
                    <tr key={leave.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-navy-900 font-medium">
                          {leave.employee.firstName} {leave.employee.lastName}
                        </p>
                        <p className="text-navy-400 text-xs">{leave.employee.legajo}</p>
                      </td>
                      <td className="text-navy-600 px-4 py-3 text-sm">
                        {LEAVE_TYPE_LABELS[leave.type] ?? leave.type}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={leaveCfg.variant} size="sm" dot>
                          {leaveCfg.label}
                        </Badge>
                      </td>
                      <td className="text-navy-600 px-4 py-3 text-xs">
                        {format(new Date(leave.startDate), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="text-navy-600 px-4 py-3 text-xs">
                        {format(new Date(leave.endDate), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="text-navy-600 px-4 py-3 font-mono text-xs">{leave.days}</td>
                      <td className="px-4 py-3">
                        {leave.status === 'PENDING' && (
                          <div className="flex gap-1.5">
                            <Button
                              variant="primary"
                              size="xs"
                              disabled={isActioning}
                              onClick={() => {
                                setApprovingId(leave.id);
                                leaveActionMutation.mutate({ id: leave.id, status: 'APPROVED' });
                              }}
                            >
                              {isActioning ? <Loader2 size={11} className="animate-spin" /> : null}
                              Aprobar
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              disabled={isActioning}
                              onClick={() => {
                                setApprovingId(leave.id);
                                leaveActionMutation.mutate({ id: leave.id, status: 'REJECTED' });
                              }}
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="border-border flex items-center justify-between border-t px-4 py-3">
            <p className="text-navy-500 text-sm">
              Página {page} de {pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <RegisterAttendanceModal open={showAttendance} onClose={() => setShowAttendance(false)} />
      <CreateLeaveModal open={showLeave} onClose={() => setShowLeave(false)} />
    </div>
  );
}
