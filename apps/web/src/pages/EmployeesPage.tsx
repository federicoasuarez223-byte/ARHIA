import { Button, Badge, Input } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, UserPlus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';

import { employeesService, type EmployeeListItem } from '@/services/employees';

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
  { label: string; variant: 'danger' | 'warning' | 'info' | 'success' }
> = {
  CRITICAL: { label: 'Crítico', variant: 'danger' },
  HIGH: { label: 'Alto', variant: 'warning' },
  MEDIUM: { label: 'Medio', variant: 'info' },
  LOW: { label: 'Bajo', variant: 'success' },
};

const CONTRACT_LABELS: Record<string, string> = {
  INDEFINIDO: 'Indefinido',
  PLAZO_FIJO: 'Plazo fijo',
  TEMPORADA: 'Temporada',
  PASANTIA: 'Pasantía',
  EVENTUAL: 'Eventual',
};

function Avatar({ employee }: { employee: EmployeeListItem }) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  if (employee.avatarUrl) {
    return (
      <img src={employee.avatarUrl} alt={initials} className="h-9 w-9 rounded-full object-cover" />
    );
  }
  return (
    <div className="bg-navy-100 text-navy-700 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
      {initials}
    </div>
  );
}

export function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, search, statusFilter],
    queryFn: () =>
      employeesService.list({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const employees = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const pages = data?.meta.pages ?? 1;

  const applySearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="animate-fade-in flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Empleados</h1>
          <p className="text-navy-500 mt-0.5 text-sm">
            {total > 0 ? `${total} empleados en tu organización` : 'Gestioná tu equipo'}
          </p>
        </div>
        <Button variant="primary" size="sm" className="gap-2">
          <UserPlus size={16} />
          Nuevo empleado
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2">
          <Input
            placeholder="Buscar por nombre, email, legajo..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            className="h-9 text-sm"
          />
          <Button variant="outline" size="sm" onClick={applySearch}>
            <Search size={15} />
          </Button>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-navy-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border-border text-navy-700 focus:ring-navy-400 h-9 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="ON_LEAVE">De licencia</option>
            <option value="TERMINATED">Desvinculados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border-border flex-1 overflow-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-surface border-b text-left">
              <th className="text-navy-500 px-4 py-3 font-semibold">Empleado</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Departamento</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Cargo</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Contrato</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Salario</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Riesgo</th>
              <th className="text-navy-500 px-4 py-3 font-semibold">Ingreso</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="bg-surface-hover h-5 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-navy-400 py-12 text-center">
                  No se encontraron empleados
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const risk = emp.riskScores?.[0];
                const riskCfg = risk ? RISK_CONFIG[risk.level] : null;
                const statusCfg = STATUS_CONFIG[emp.employmentStatus] ?? {
                  label: emp.employmentStatus,
                  variant: 'default' as const,
                };

                return (
                  <tr key={emp.id} className="hover:bg-surface cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar employee={emp} />
                        <div>
                          <p className="text-navy-900 font-medium">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-navy-400 text-xs">{emp.legajo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-navy-700 px-4 py-3">{emp.department?.name ?? '—'}</td>
                    <td className="text-navy-700 px-4 py-3">{emp.position}</td>
                    <td className="px-4 py-3">
                      <Badge variant="default" size="sm">
                        {CONTRACT_LABELS[emp.contractType] ?? emp.contractType}
                      </Badge>
                    </td>
                    <td className="text-navy-700 px-4 py-3 font-mono">
                      {emp.salary.toLocaleString('es-AR')} {emp.currency}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusCfg.variant} size="sm" dot>
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {riskCfg ? (
                        <Badge variant={riskCfg.variant} size="sm" dot>
                          {riskCfg.label}
                        </Badge>
                      ) : (
                        <span className="text-navy-300">—</span>
                      )}
                    </td>
                    <td className="text-navy-500 px-4 py-3">
                      {formatDistanceToNow(new Date(emp.hireDate), {
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

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-navy-500 text-sm">
            Página {page} de {pages} ({total} total)
          </p>
          <div className="flex items-center gap-2">
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
    </div>
  );
}
