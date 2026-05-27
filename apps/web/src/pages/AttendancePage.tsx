import { Badge, Button, Card, CardHeader, CardTitle } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';

import apiClient from '@/services/api';

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
  VACATION: { label: 'Vacaciones', variant: 'info' as const },
  SICK_LEAVE: { label: 'Licencia médica', variant: 'warning' },
};

export function AttendancePage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'attendance' | 'leaves'>('attendance');
  const limit = 25;

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
        <Button variant="primary" size="sm">
          <Clock size={16} /> Registrar asistencia
        </Button>
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
                <th className="text-navy-500 px-4 py-3 font-semibold">Fecha</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
                {tab === 'attendance' && (
                  <>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Entrada</th>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Salida</th>
                    <th className="text-navy-500 px-4 py-3 font-semibold">Horas</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: tab === 'attendance' ? 6 : 3 }).map((_, j) => (
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
                      {tab === 'attendance' && (
                        <>
                          <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                            {r.checkIn ? format(new Date(r.checkIn), 'HH:mm') : '—'}
                          </td>
                          <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                            {r.checkOut ? format(new Date(r.checkOut), 'HH:mm') : '—'}
                          </td>
                          <td className="text-navy-600 px-4 py-3 font-mono text-xs">
                            {r.hoursWorked ?? '—'}
                          </td>
                        </>
                      )}
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
    </div>
  );
}
