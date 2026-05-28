import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Modal } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Loader2, Pencil, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  _count?: { employees: number };
  manager?: { firstName: string; lastName: string } | null;
}

const selectClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const inputClass =
  'border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1';
const labelClass = 'text-navy-700 mb-1.5 block text-sm font-medium';

const deptSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  code: z.string().optional(),
  description: z.string().optional(),
  managerId: z.string().optional(),
});
type DeptFormValues = z.infer<typeof deptSchema>;

// ── Create / Edit modal ───────────────────────────────────────────────────────

function DeptModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Department | null;
}) {
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
  } = useForm<DeptFormValues>({
    resolver: zodResolver(deptSchema),
    values: editing
      ? {
          name: editing.name,
          code: editing.code ?? '',
          description: editing.description ?? '',
          managerId: '',
        }
      : { name: '', code: '', description: '', managerId: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: DeptFormValues) => {
      const body = {
        ...data,
        code: data.code || undefined,
        description: data.description || undefined,
        managerId: data.managerId || undefined,
      };
      return editing
        ? apiClient.patch(`/api/departments/${editing.id}`, body)
        : apiClient.post('/api/departments', body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success(editing ? 'Departamento actualizado' : 'Departamento creado');
      reset();
      onClose();
    },
    onError: () => toast.error('No se pudo guardar el departamento.'),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar departamento' : 'Nuevo departamento'}
      description="Organizá tu empresa por áreas funcionales."
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
              <Building2 size={14} />
            )}
            {mutation.isPending
              ? 'Guardando...'
              : editing
                ? 'Guardar cambios'
                : 'Crear departamento'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input {...register('name')} placeholder="ej. Ingeniería" className={inputClass} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Código</label>
            <input {...register('code')} placeholder="ej. ENG" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Manager</label>
          <select {...register('managerId')} className={selectClass}>
            <option value="">Sin manager asignado</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName} ({e.legajo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Función principal del área..."
            className="border-border text-navy-700 focus:ring-navy-400 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────

function DeleteDeptModal({ dept, onClose }: { dept: Department | null; onClose: () => void }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/departments/${dept!.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento eliminado');
      onClose();
    },
    onError: () => toast.error('No se pudo eliminar el departamento.'),
  });

  return (
    <Modal
      open={!!dept}
      onClose={onClose}
      title="Eliminar departamento"
      description={`¿Confirmás la eliminación de "${dept?.name}"? Esta acción no se puede deshacer.`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {mutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </>
      }
    >
      <></>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function DepartmentsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const r = await apiClient.get<{
        success: boolean;
        data: Department[];
        meta: { total: number };
      }>('/api/departments', { params: { limit: 100 } });
      return r.data;
    },
  });

  const departments = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Departamentos</h1>
          <p className="text-navy-500 mt-1 text-sm">Estructura organizacional de la empresa</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nuevo departamento
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-navy-50 flex h-12 w-12 items-center justify-center rounded-xl">
              <Building2 size={20} className="text-navy-600" />
            </div>
            <div>
              <p className="text-navy-900 text-2xl font-bold">{isLoading ? '—' : total}</p>
              <p className="text-navy-500 text-sm">Departamentos activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-navy-900 text-2xl font-bold">
                {isLoading ? '—' : departments.reduce((s, d) => s + (d._count?.employees ?? 0), 0)}
              </p>
              <p className="text-navy-500 text-sm">Empleados asignados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={16} className="text-navy-500" />
            Listado de departamentos
          </CardTitle>
        </CardHeader>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-surface border-b text-left">
                <th className="text-navy-500 px-4 py-3 font-semibold">Nombre</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Código</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Manager</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Empleados</th>
                <th className="text-navy-500 px-4 py-3 font-semibold">Estado</th>
                <th className="text-navy-500 px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="bg-surface-hover h-4 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Building2 size={40} className="text-navy-100 mx-auto mb-3" />
                    <p className="text-navy-500 font-medium">No hay departamentos</p>
                    <p className="text-navy-400 mt-1 text-sm">Creá el primer área de tu empresa</p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowCreate(true)}
                    >
                      <Plus size={14} /> Crear departamento
                    </Button>
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-navy-900 font-medium">{dept.name}</p>
                      {dept.description && (
                        <p className="text-navy-400 mt-0.5 max-w-xs truncate text-xs">
                          {dept.description}
                        </p>
                      )}
                    </td>
                    <td className="text-navy-500 px-4 py-3 font-mono text-xs">
                      {dept.code ?? '—'}
                    </td>
                    <td className="text-navy-600 px-4 py-3 text-sm">
                      {dept.manager ? (
                        `${dept.manager.firstName} ${dept.manager.lastName}`
                      ) : (
                        <span className="text-navy-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-navy-400" />
                        <span className="text-navy-700 font-semibold">
                          {dept._count?.employees ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={dept.isActive ? 'success' : 'default'} size="sm" dot>
                        {dept.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="xs" onClick={() => setEditing(dept)}>
                          <Pencil size={12} /> Editar
                        </Button>
                        <Button variant="outline" size="xs" onClick={() => setDeleting(dept)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <DeptModal
        open={showCreate || !!editing}
        onClose={() => {
          setShowCreate(false);
          setEditing(null);
        }}
        editing={editing}
      />
      <DeleteDeptModal dept={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
