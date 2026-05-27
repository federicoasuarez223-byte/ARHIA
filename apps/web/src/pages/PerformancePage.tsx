import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { TrendingUp, Plus, Star, Target, Users } from 'lucide-react';

const POTENTIAL_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'gold' | 'default' }
> = {
  HIGH_POTENTIAL: { label: 'Alto potencial', variant: 'success' },
  PROMOTABLE: { label: 'Promocionable', variant: 'info' },
  KEY_CONTRIBUTOR: { label: 'Clave', variant: 'gold' },
  STABLE: { label: 'Estable', variant: 'default' },
  UNDERPERFORMER: { label: 'Bajo desempeño', variant: 'danger' },
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> =
  {
    COMPLETED: { label: 'Completada', variant: 'success' },
    IN_PROGRESS: { label: 'En progreso', variant: 'warning' },
    PENDING: { label: 'Pendiente', variant: 'default' },
  };

export function PerformancePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Performance</h1>
          <p className="text-navy-500 mt-1 text-sm">Evaluaciones de desempeño y desarrollo</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} /> Nueva evaluación
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Evaluaciones pendientes',
            value: '—',
            color: 'bg-amber-50 text-amber-600',
            icon: Target,
          },
          { label: 'En progreso', value: '—', color: 'bg-blue-50 text-blue-600', icon: TrendingUp },
          {
            label: 'Completadas este ciclo',
            value: '—',
            color: 'bg-green-50 text-green-600',
            icon: Star,
          },
          { label: 'Score promedio', value: '—', color: 'bg-navy-50 text-navy-600', icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
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

      {/* Potential matrix legend */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de talento</CardTitle>
          <span className="text-navy-400 text-sm">Distribución por potencial</span>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(POTENTIAL_CONFIG).map(([k, v]) => (
              <Badge key={k} variant={v.variant} size="lg">
                {v.label}: —
              </Badge>
            ))}
          </div>
          <div className="border-border mt-6 flex items-center justify-center rounded-xl border-2 border-dashed py-16">
            <div className="text-center">
              <TrendingUp size={32} className="text-navy-200 mx-auto mb-2" />
              <p className="text-navy-400 text-sm">
                Las evaluaciones aparecerán aquí una vez creadas
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                <Plus size={14} /> Iniciar ciclo de evaluación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status badges legend */}
      <div className="flex gap-3">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <div
            key={k}
            className="border-border flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5"
          >
            <Badge variant={v.variant} size="sm" dot>
              {v.label}
            </Badge>
            <span className="text-navy-700 text-sm font-semibold">—</span>
          </div>
        ))}
      </div>
    </div>
  );
}
