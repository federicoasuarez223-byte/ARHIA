import { Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { GraduationCap, Plus, Clock, Users } from 'lucide-react';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  SKILL: { label: 'Habilidad', color: 'bg-blue-100 text-blue-700' },
  COMPLIANCE: { label: 'Compliance', color: 'bg-red-100 text-red-700' },
  LEADERSHIP: { label: 'Liderazgo', color: 'bg-purple-100 text-purple-700' },
  TECHNICAL: { label: 'Técnico', color: 'bg-navy-100 text-navy-700' },
  ONBOARDING: { label: 'Onboarding', color: 'bg-green-100 text-green-700' },
};

export function TrainingPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Capacitación</h1>
          <p className="text-navy-500 mt-1 text-sm">Planes de formación y desarrollo</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} /> Nuevo plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: GraduationCap,
            label: 'Planes activos',
            value: '—',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            icon: Users,
            label: 'Empleados en formación',
            value: '—',
            color: 'bg-green-50 text-green-600',
          },
          {
            icon: Clock,
            label: 'Horas promedio completadas',
            value: '—',
            color: 'bg-navy-50 text-navy-600',
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-navy-900 text-2xl font-bold">{value}</p>
                <p className="text-navy-500 text-sm">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Types legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_CONFIG).map(([k, v]) => (
          <span key={k} className={`rounded-full px-3 py-1 text-xs font-semibold ${v.color}`}>
            {v.label}
          </span>
        ))}
      </div>

      {/* Empty state */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={16} className="text-navy-500" />
            Planes de capacitación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap size={48} className="text-navy-100 mb-4" />
            <p className="text-navy-500 font-medium">No hay planes de capacitación</p>
            <p className="text-navy-400 mt-1 text-sm">
              Creá el primer plan para empezar a formar tu equipo
            </p>
            <Button variant="primary" size="sm" className="mt-4">
              <Plus size={14} /> Crear plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-800">
          Próximamente: integración con LinkedIn Learning
        </p>
        <p className="mt-1 text-sm text-blue-700">
          Importá cursos directamente desde plataformas externas y hacé seguimiento del progreso
          automáticamente.
        </p>
      </div>
    </div>
  );
}
