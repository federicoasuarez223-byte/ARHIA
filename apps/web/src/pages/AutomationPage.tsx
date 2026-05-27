import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { Zap, Plus, Play, Pause, CheckCircle } from 'lucide-react';

const TEMPLATE_RULES = [
  {
    name: 'Alerta de riesgo crítico',
    trigger: 'Riesgo supera umbral',
    action: 'Notificar a HR Manager',
    status: 'TEMPLATE',
  },
  {
    name: 'Bienvenida a nuevo empleado',
    trigger: 'Empleado creado',
    action: 'Enviar email + crear tareas onboarding',
    status: 'TEMPLATE',
  },
  {
    name: 'Vencimiento de contrato',
    trigger: '30 días antes del vencimiento',
    action: 'Notificar a responsable + crear tarea',
    status: 'TEMPLATE',
  },
  {
    name: 'Cumpleaños del empleado',
    trigger: 'Día del cumpleaños',
    action: 'Felicitación automática por Slack',
    status: 'TEMPLATE',
  },
  {
    name: 'Aniversario laboral',
    trigger: 'Aniversario de ingreso',
    action: 'Notificación al manager + reconocimiento',
    status: 'TEMPLATE',
  },
];

export function AutomationPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Automatización</h1>
          <p className="text-navy-500 mt-1 text-sm">Reglas y flujos de trabajo automáticos</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} /> Nueva regla
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Reglas activas', value: '—', color: 'bg-gold-50 text-gold-600' },
          {
            icon: Play,
            label: 'Ejecuciones este mes',
            value: '—',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            icon: CheckCircle,
            label: 'Tasa de éxito',
            value: '—%',
            color: 'bg-green-50 text-green-600',
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

      {/* Active rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={16} className="text-gold-500" />
            Reglas activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Zap size={40} className="text-navy-100 mb-3" />
            <p className="text-navy-500 font-medium">Sin reglas configuradas</p>
            <p className="text-navy-400 mt-1 text-sm">Usá las plantillas de abajo para empezar</p>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas recomendadas</CardTitle>
          <span className="text-navy-400 text-sm">Activá con un clic</span>
        </CardHeader>
        <div className="divide-border divide-y">
          {TEMPLATE_RULES.map((rule) => (
            <div key={rule.name} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="bg-gold-100 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                  <Zap size={14} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-navy-900 font-medium">{rule.name}</p>
                  <p className="text-navy-400 mt-0.5 text-xs">
                    <span className="text-navy-500 font-medium">Cuando:</span> {rule.trigger} ·{' '}
                    <span className="text-navy-500 font-medium">Hacer:</span> {rule.action}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  Plantilla
                </Badge>
                <Button variant="outline" size="xs">
                  <Play size={12} /> Activar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Pause size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-700">
          Las reglas se ejecutan en background. Podés pausarlas o editarlas en cualquier momento sin
          perder el historial de ejecuciones.
        </p>
      </div>
    </div>
  );
}
