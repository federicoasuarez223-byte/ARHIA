import { Button, Input, Modal } from '@arhia/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { departmentsService } from '@/services/departments';
import { employeesService } from '@/services/employees';
import { toast } from '@/store/toast.store';

const schema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  departmentId: z.string().min(1, 'Departamento requerido'),
  position: z.string().min(1, 'Cargo requerido'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  contractType: z.enum(['INDEFINIDO', 'PLAZO_FIJO', 'TEMPORADA', 'PASANTIA', 'EVENTUAL']),
  employmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']),
  salary: z.coerce.number().positive('Debe ser positivo'),
  currency: z.enum(['ARS', 'USD']),
  phone: z.string().optional(),
  legajo: z.string().optional(),
  seniority: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EmployeeForEdit {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: string;
  department: { id: string; name: string };
  position: string;
  hireDate: string;
  contractType: string;
  employmentStatus: string;
  salary: number;
  currency: string;
  legajo?: string;
  seniority?: string;
  city?: string;
  province?: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  employee: EmployeeForEdit;
}

export function EditEmployeeModal({ open, onClose, employee }: Props) {
  const qc = useQueryClient();

  const { data: deptData } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => departmentsService.list(),
    enabled: open,
  });
  const departments = deptData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone ?? '',
      departmentId: employee.department.id,
      position: employee.position,
      hireDate: employee.hireDate.slice(0, 10),
      contractType: employee.contractType as FormValues['contractType'],
      employmentStatus: employee.employmentStatus as FormValues['employmentStatus'],
      salary: Number(employee.salary),
      currency: (employee.currency ?? 'ARS') as FormValues['currency'],
      legajo: employee.legajo ?? '',
      seniority: employee.seniority ?? '',
      city: employee.city ?? '',
      province: employee.province ?? '',
      notes: employee.notes ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (dto: FormValues) => employeesService.update(employee.id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employee', employee.id] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Empleado actualizado correctamente');
      reset();
      onClose();
    },
    onError: () => {
      toast.error('No se pudo actualizar el empleado.');
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Editar empleado"
      description={`Modificando datos de ${employee.firstName} ${employee.lastName}`}
      size="xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Personal */}
        <div>
          <p className="text-navy-500 mb-3 text-xs font-semibold uppercase tracking-wider">
            Datos personales
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nombre *" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Apellido *" {...register('lastName')} error={errors.lastName?.message} />
            <Input
              label="Email *"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input label="Teléfono" {...register('phone')} />
            <Input label="Ciudad" {...register('city')} />
            <Input label="Provincia" {...register('province')} />
          </div>
        </div>

        {/* Employment */}
        <div>
          <p className="text-navy-500 mb-3 text-xs font-semibold uppercase tracking-wider">
            Datos laborales
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-navy-700 mb-1.5 block text-sm font-medium">
                Departamento *
              </label>
              <select
                {...register('departmentId')}
                className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-xs text-red-600">{errors.departmentId.message}</p>
              )}
            </div>
            <Input label="Cargo *" {...register('position')} error={errors.position?.message} />
            <Input label="Legajo" {...register('legajo')} />
            <div>
              <label className="text-navy-700 mb-1.5 block text-sm font-medium">Seniority</label>
              <select
                {...register('seniority')}
                className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
              >
                <option value="">Sin especificar</option>
                <option value="JUNIOR">Junior</option>
                <option value="SEMI_SENIOR">Semi senior</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
            <Input
              label="Fecha de ingreso *"
              type="date"
              {...register('hireDate')}
              error={errors.hireDate?.message}
            />
            <div>
              <label className="text-navy-700 mb-1.5 block text-sm font-medium">Estado</label>
              <select
                {...register('employmentStatus')}
                className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
              >
                <option value="ACTIVE">Activo</option>
                <option value="ON_LEAVE">De licencia</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="TERMINATED">Desvinculado</option>
              </select>
            </div>
            <div>
              <label className="text-navy-700 mb-1.5 block text-sm font-medium">
                Tipo de contrato *
              </label>
              <select
                {...register('contractType')}
                className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
              >
                <option value="INDEFINIDO">Indefinido</option>
                <option value="PLAZO_FIJO">Plazo fijo</option>
                <option value="TEMPORADA">Temporada</option>
                <option value="PASANTIA">Pasantía</option>
                <option value="EVENTUAL">Eventual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <p className="text-navy-500 mb-3 text-xs font-semibold uppercase tracking-wider">
            Remuneración
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Salario bruto *"
              type="number"
              {...register('salary')}
              error={errors.salary?.message}
            />
            <div>
              <label className="text-navy-700 mb-1.5 block text-sm font-medium">Moneda</label>
              <select
                {...register('currency')}
                className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1"
              >
                <option value="ARS">ARS — Peso argentino</option>
                <option value="USD">USD — Dólar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-navy-700 mb-1.5 block text-sm font-medium">Notas internas</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="border-border text-navy-700 placeholder:text-navy-400 focus:ring-navy-400 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
            placeholder="Observaciones opcionales..."
          />
        </div>
      </form>
    </Modal>
  );
}
