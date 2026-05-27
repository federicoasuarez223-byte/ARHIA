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
  salary: z.coerce.number().positive('Debe ser positivo'),
  currency: z.enum(['ARS', 'USD']),
  phone: z.string().optional(),
  legajo: z.string().optional(),
  seniority: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateEmployeeModal({ open, onClose }: Props) {
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
    defaultValues: { contractType: 'INDEFINIDO', currency: 'ARS' },
  });

  const mutation = useMutation({
    mutationFn: (dto: FormValues) => employeesService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['employee-stats'] });
      toast.success('Empleado creado correctamente');
      reset();
      onClose();
    },
    onError: () => {
      toast.error('No se pudo crear el empleado. Revisá los datos e intentá de nuevo.');
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
      title="Nuevo empleado"
      description="Completá los datos para agregar un nuevo miembro al equipo"
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
            {isSubmitting ? 'Guardando...' : 'Crear empleado'}
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
            <div>
              <Input
                label="Nombre *"
                placeholder="Juan"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
            </div>
            <div>
              <Input
                label="Apellido *"
                placeholder="González"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </div>
            <div>
              <Input
                label="Email *"
                type="email"
                placeholder="juan@empresa.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
            <div>
              <Input label="Teléfono" placeholder="+54 11 XXXX-XXXX" {...register('phone')} />
            </div>
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
                <option value="">Seleccioná un departamento</option>
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
            <div>
              <Input
                label="Cargo *"
                placeholder="Ej: Analista de RRHH"
                {...register('position')}
                error={errors.position?.message}
              />
            </div>
            <div>
              <Input label="Legajo" placeholder="0001" {...register('legajo')} />
            </div>
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
            <div>
              <Input
                label="Fecha de ingreso *"
                type="date"
                {...register('hireDate')}
                error={errors.hireDate?.message}
              />
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
            <div>
              <Input
                label="Salario bruto *"
                type="number"
                placeholder="150000"
                {...register('salary')}
                error={errors.salary?.message}
              />
            </div>
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
      </form>
    </Modal>
  );
}
