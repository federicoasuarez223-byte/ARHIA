import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap, Play, Pause, CheckCircle } from 'lucide-react';

import apiClient from '@/services/api';
import { toast } from '@/store/toast.store';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  status: 'ACTIVE' | 'PAUSED' | 'INACTIVE';
  runCount: number;
  lastRunAt?: string;
  _count: { executions: number };
}

interface AutomationStats {
  activeRules: number;
  executionsThisMonth: number;
  successRate: number;
}

// ── Templates ──────────────────────────────────────────────────────────────────

const TEMPLATE_RULES = [
  {
    name: 'Alerta de riesgo crítico',
    trigger: 'THRESHOLD' as const,
    description: 'Notificar a HR Manager cuando el riesgo supera el umbral crítico',
    actions: [{ type: 'notify', role: 'HR_MANAGER' }],
  },
  {
    name: 'Bienvenida a nuevo empleado',
    trigger: 'EVENT' as const,
    description: 'Enviar email de bienvenida cuando se crea un empleado',
    actions: [{ type: 'send_email', template: 'welcome' }],
  },
  {
    name: 'Vencimiento de contrato',
    trigger: 'SCHEDULE' as const,
    description: 'Notificar 30 días antes del vencimiento de contrato',
    actions: [{ type: 'notify', role: 'HR_MANAGER' }, { type: 'create_task' }],
  },
  {
    name: 'Cumpleaños del empleado',
    trigger: 'SCHEDULE' as const,
    description: 'Felicitación automática en el día del cumpleaños',
    actions: [{ type: 'send_message', channel: 'slack' }],
  },
  {
    name: 'Aniversario laboral',
    trigger: 'SCHEDULE' as const,
    description: 'Notificación al manager en el aniversario de ingreso',
    actions: [{ type: 'notify', role: 'MANAGER' }],
  },
];

const TRIGGER_LABELS: Record<string, string> = {
  SCHEDULE: 'Programado',
  EVENT: 'Evento',
  THRESHOLD: 'Umbral',
  MANUAL: 'Manual',
  WEBHOOK: 'Webhook',
};

// ── Page ───────────────────────────────────────────────────────────────────────

export function AutomationPage() {
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['automation-stats'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: AutomationStats }>('/api/automation/stats')
        .then((r) => r.data.data),
  });

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: AutomationRule[] }>('/api/automation')
        .then((r) => r.data.data),
  });

  const rules = rulesData ?? [];
  const activeRules = rules.filter((r) => r.status === 'ACTIVE');

  const createMutation = useMutation({
    mutationFn: (data: (typeof TEMPLATE_RULES)[number]) =>
      apiClient.post('/api/automation', {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        triggerConfig: {},
        actions: data.actions,
        tags: ['template'],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] });
      qc.invalidateQueries({ queryKey: ['automation-stats'] });
      toast.success('Regla creada y activada');
    },
    onError: () => toast.error('No se pudo crear la regla.'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'PAUSED' }) =>
      apiClient.patch(`/api/automation/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation-rules'] });
      qc.invalidateQueries({ queryKey: ['automation-stats'] });
    },
    onError: () => toast.error('No se pudo actualizar la regla.'),
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Automatización</h1>
          <p className="text-navy-500 mt-1 text-sm">Reglas y flujos de trabajo automáticos</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Zap,
            label: 'Reglas activas',
            value: stats?.activeRules ?? '—',
            color: 'bg-gold-50 text-gold-600',
          },
          {
            icon: Play,
            label: 'Ejecuciones este mes',
            value: stats?.executionsThisMonth ?? '—',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            icon: CheckCircle,
            label: 'Tasa de éxito',
            value: stats ? `${stats.successRate}%` : '—',
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
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-navy-400 text-sm">Cargando...</p>
            </div>
          ) : activeRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Zap size={40} className="text-navy-100 mb-3" />
              <p className="text-navy-500 font-medium">Sin reglas configuradas</p>
              <p className="text-navy-400 mt-1 text-sm">Usá las plantillas de abajo para empezar</p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {activeRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between py-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-gold-100 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                      <Zap size={14} className="text-gold-600" />
                    </div>
                    <div>
                      <p className="text-navy-900 font-medium">{rule.name}</p>
                      <p className="text-navy-400 mt-0.5 text-xs">
                        {TRIGGER_LABELS[rule.trigger] ?? rule.trigger} · {rule._count.executions}{' '}
                        ejecuciones
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => toggleMutation.mutate({ id: rule.id, status: 'PAUSED' })}
                    disabled={toggleMutation.isPending}
                  >
                    <Pause size={12} /> Pausar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas recomendadas</CardTitle>
          <span className="text-navy-400 text-sm">Activá con un clic</span>
        </CardHeader>
        <div className="divide-border divide-y">
          {TEMPLATE_RULES.map((template) => {
            const alreadyActive = rules.some(
              (r) => r.name === template.name && r.status !== 'INACTIVE',
            );
            return (
              <div key={template.name} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gold-100 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg">
                    <Zap size={14} className="text-gold-600" />
                  </div>
                  <div>
                    <p className="text-navy-900 font-medium">{template.name}</p>
                    <p className="text-navy-400 mt-0.5 text-xs">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alreadyActive ? (
                    <Badge variant="default" size="sm">
                      Activa
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => createMutation.mutate(template)}
                      disabled={createMutation.isPending}
                    >
                      <Play size={12} /> Activar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
