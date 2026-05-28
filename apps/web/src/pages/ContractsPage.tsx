import { Badge, Button, Card, CardHeader, CardTitle, Modal } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

interface Contract {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  position: string;
  salary: number;
  currency: string;
  employee: { firstName: string; lastName: string; legajo: string; department: { name: string } };
}

const TYPE_LABELS: Record<string, string> = {
  INDEFINIDO: 'Indefinido',
  PLAZO_FIJO: 'Plazo fijo',
  TEMPORADA: 'Temporada',
  PASANTIA: 'Pasantía',
  EVENTUAL: 'Eventual',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'gold' }
> = {
  ACTIVE: { label: 'Activo', variant: 'success' },
  DRAFT: { label: 'Borrador', variant: 'default' },
  EXPIRED: { label: 'Vencido', variant: 'danger' },
  TERMINATED: { label: 'Rescindido', variant: 'danger' },
  PENDING_SIGNATURE: { label: 'Firma pendiente', variant: 'warning' },
  RENEWED: { label: 'Renovado', variant: 'gold' },
};

const selectClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const inputClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const labelClass = 'text-navy-700 mb-1.5 block text-sm font-medium';

const createSchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  type: z.enum(['INDEFINIDO', 'PLAZO_FIJO', 'TEMPORADA', 'PASANTIA', 'EVENTUAL']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  endDate: z.string().optional(),
  position: z.string().min(1, 'Cargo requerido'),
  salary: z.coerce.number().positive('Salario inválido'),
  currency: z.string().default('ARS'),
  workingHours: z.coerce.number().int().positive().default(48),
  notes: z.string().optional(),
});
type CreateFormValues = z.infer<typeof createSchema>;

function CreateContractModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      type: 'INDEFINIDO',
      currency: 'ARS',
      workingHours: 48,
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  const contractType = watch('type');
  const needsEndDate = contractType !== 'INDEFINIDO';

  const mutation = useMutation({
    mutationFn: (data: CreateFormValues) =>
      apiClient.post('/api/contracts', {
        ...data,
        endDate: data.endDate || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Contrato creado');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo crear el contrato.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo contrato"
      description="Registrá un nuevo contrato laboral."
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
            {mutation.isPending ? 'Creando...' : 'Crear contrato'}
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
            <label className={labelClass}>Tipo de contrato *</label>
            <select {...register('type')} className={selectClass}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Cargo *</label>
            <input
              {...register('position')}
              placeholder="ej. Desarrollador Backend"
              className={inputClass}
            />
            {errors.position && (
              <p className="mt-1 text-xs text-red-500">{errors.position.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha de inicio *</label>
            <input {...register('startDate')} type="date" className={inputClass} />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Fecha de vencimiento {needsEndDate ? '*' : '(opcional)'}
            </label>
            <input {...register('endDate')} type="date" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Salario bruto *</label>
            <input
              {...register('salary')}
              type="number"
              placeholder="ej. 700000"
              className={inputClass}
            />
            {errors.salary && <p className="mt-1 text-xs text-red-500">{errors.salary.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Moneda</label>
            <select {...register('currency')} className={selectClass}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Horas semanales</label>
          <input
            {...register('workingHours')}
            type="number"
            placeholder="48"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Condiciones especiales, CCT, etc."
            className="border-border text-navy-700 focus:ring-navy-400 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>
    </Modal>
  );
}

export function ContractsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', page, statusFilter],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: Contract[];
        meta: { total: number; pages: number };
      }>('/api/contracts', { params: { page, limit, status: statusFilter || undefined } });
      return r.data;
    },
  });

  const contracts = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const pages = data?.meta.pages ?? 1;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Contratos</h1>
          <p className="text-navy-500 mt-1 text-sm">{total} contratos registrados</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nuevo contrato
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border-border text-navy-700 focus:ring-navy-400 h-9 rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={16} className="text-navy-500" />
            Listado de contratos
          </CardTitle>
        </CardHeader>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-surface border-b text-left">
                <th className="text-navy-500 px-4 py-3 font-semibold">Empleado</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Cargo</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Tipo</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Inicio</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Venc.</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Salario</th>
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
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-navy-400 py-10 text-center">
                    Sin contratos
                  </td>
                </tr>
              ) : (
                contracts.map((c) => {
                  const statusCfg = STATUS_CONFIG[c.status] ?? {
                    label: c.status,
                    variant: 'default' as const,
                  };
                  return (
                    <tr key={c.id} className="hover:bg-surface cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-navy-900 font-medium">
                          {c.employee.firstName} {c.employee.lastName}
                        </p>
                        <p className="text-navy-400 text-xs">
                          {c.employee.legajo} · {c.employee.department?.name}
                        </p>
                      </td>
                      <td className="text-navy-700 px-4 py-3">{c.position}</td>
                      <td className="px-4 py-3">
                        <Badge variant="default" size="sm">
                          {TYPE_LABELS[c.type] ?? c.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusCfg.variant} size="sm" dot>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="text-navy-600 px-4 py-3">
                        {format(new Date(c.startDate), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="text-navy-600 px-4 py-3">
                        {c.endDate
                          ? format(new Date(c.endDate), 'dd/MM/yyyy', { locale: es })
                          : '—'}
                      </td>
                      <td className="text-navy-700 px-4 py-3 font-mono">
                        {Number(c.salary).toLocaleString('es-AR')} {c.currency}
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

      <CreateContractModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
