import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { UserPlus, Search, Star, Clock, CheckCircle } from 'lucide-react';

const STAGES = [
  { id: 'SOURCING', label: 'Sourcing', color: 'bg-navy-100 text-navy-700', count: 0 },
  { id: 'SCREENING', label: 'Screening', color: 'bg-blue-100 text-blue-700', count: 0 },
  { id: 'INTERVIEW', label: 'Entrevistas', color: 'bg-purple-100 text-purple-700', count: 0 },
  { id: 'OFFER', label: 'Oferta', color: 'bg-amber-100 text-amber-700', count: 0 },
  { id: 'HIRED', label: 'Contratado', color: 'bg-green-100 text-green-700', count: 0 },
];

const MOCK_SEARCHES = [
  {
    id: '1',
    title: 'Desarrollador Full Stack Sr.',
    department: 'Tecnología',
    type: 'INDEFINIDO',
    status: 'OPEN',
    candidates: 12,
    remote: true,
  },
  {
    id: '2',
    title: 'Analista de RRHH',
    department: 'Recursos Humanos',
    type: 'INDEFINIDO',
    status: 'OPEN',
    candidates: 8,
    remote: false,
  },
  {
    id: '3',
    title: 'Diseñador UX/UI',
    department: 'Producto',
    type: 'PLAZO_FIJO',
    status: 'PAUSED',
    candidates: 5,
    remote: true,
  },
];

export function RecruitmentPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Reclutamiento</h1>
          <p className="text-navy-500 mt-1 text-sm">Pipeline de búsqueda y selección de talento</p>
        </div>
        <Button variant="primary" size="sm">
          <UserPlus size={16} /> Nueva búsqueda
        </Button>
      </div>

      {/* Pipeline kanban */}
      <div className="grid grid-cols-5 gap-3">
        {STAGES.map((stage) => (
          <div key={stage.id} className="border-border rounded-xl border bg-white p-3 shadow-sm">
            <div
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${stage.color}`}
            >
              {stage.label}
            </div>
            <p className="text-navy-900 text-2xl font-bold">{stage.count}</p>
            <p className="text-navy-400 text-xs">candidatos</p>
            <div className="border-border mt-3 flex min-h-[60px] items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-navy-300 text-xs">Sin candidatos</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={16} className="text-navy-500" />
            Búsquedas activas
          </CardTitle>
        </CardHeader>
        <div className="divide-border divide-y">
          {MOCK_SEARCHES.map((s) => (
            <div
              key={s.id}
              className="hover:bg-surface flex cursor-pointer items-center justify-between px-6 py-4 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="bg-navy-50 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Star size={18} className="text-navy-500" />
                </div>
                <div>
                  <p className="text-navy-900 font-medium">{s.title}</p>
                  <p className="text-navy-500 text-sm">
                    {s.department} · {s.type === 'INDEFINIDO' ? 'Indefinido' : 'Plazo fijo'}{' '}
                    {s.remote && '· Remoto'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-navy-900 text-sm font-semibold">{s.candidates}</p>
                  <p className="text-navy-400 text-xs">candidatos</p>
                </div>
                <Badge variant={s.status === 'OPEN' ? 'success' : 'warning'} size="sm" dot>
                  {s.status === 'OPEN' ? 'Activa' : 'Pausada'}
                </Badge>
              </div>
            </div>
          ))}
          {MOCK_SEARCHES.length === 0 && (
            <CardContent>
              <p className="text-navy-400 py-8 text-center text-sm">Sin búsquedas activas</p>
            </CardContent>
          )}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Clock, label: 'Tiempo promedio de contratación', value: '—', sub: 'días' },
          { icon: CheckCircle, label: 'Tasa de aceptación de ofertas', value: '—', sub: '%' },
          { icon: UserPlus, label: 'Contrataciones este mes', value: '—', sub: 'empleados' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="bg-navy-50 text-navy-600 flex h-12 w-12 items-center justify-center rounded-xl">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-navy-900 text-2xl font-bold">
                  {value} <span className="text-navy-400 text-sm font-normal">{sub}</span>
                </p>
                <p className="text-navy-500 text-sm">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
