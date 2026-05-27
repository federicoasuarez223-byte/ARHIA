import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { Puzzle, CheckCircle, XCircle, Plus } from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'AFIP',
    desc: 'Presentación de F931 y SICOSS',
    status: 'COMING_SOON',
    category: 'Impuestos',
    logo: '🏛️',
  },
  {
    name: 'DocuSign',
    desc: 'Firma electrónica de contratos',
    status: 'COMING_SOON',
    category: 'Documentos',
    logo: '✍️',
  },
  {
    name: 'LinkedIn',
    desc: 'Publicación de búsquedas y sourcing',
    status: 'COMING_SOON',
    category: 'Reclutamiento',
    logo: '💼',
  },
  {
    name: 'Slack',
    desc: 'Notificaciones y recordatorios al equipo',
    status: 'COMING_SOON',
    category: 'Comunicación',
    logo: '💬',
  },
  {
    name: 'Google Workspace',
    desc: 'Sincronización de calendario y email',
    status: 'COMING_SOON',
    category: 'Productividad',
    logo: '📧',
  },
  {
    name: 'BambooHR',
    desc: 'Migración de datos desde BambooHR',
    status: 'COMING_SOON',
    category: 'HR',
    logo: '🎋',
  },
  {
    name: 'Workday',
    desc: 'Sincronización bidireccional con Workday',
    status: 'COMING_SOON',
    category: 'HR',
    logo: '⚙️',
  },
  {
    name: 'Zapier',
    desc: 'Conectá con más de 5000 aplicaciones',
    status: 'COMING_SOON',
    category: 'Automatización',
    logo: '⚡',
  },
];

export function IntegrationsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Integraciones</h1>
          <p className="text-navy-500 mt-1 text-sm">Conectá ARHIA con tus herramientas</p>
        </div>
        <Button variant="outline" size="sm">
          <Plus size={16} /> Solicitar integración
        </Button>
      </div>

      <div className="border-gold-200 bg-gold-50 flex items-start gap-3 rounded-xl border p-4">
        <Puzzle size={18} className="text-gold-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-gold-800 text-sm font-semibold">Integraciones en desarrollo</p>
          <p className="text-gold-700 mt-0.5 text-sm">
            Estamos construyendo conexiones nativas con las herramientas más usadas en Argentina y
            Latam. ¿Necesitás una integración específica? Escribinos.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle size={16} className="text-navy-500" />
            Integraciones disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.name}
              className="border-border hover:border-navy-200 flex flex-col gap-3 rounded-xl border p-4 transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{integration.logo}</span>
                {integration.status === 'ACTIVE' ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : integration.status === 'ERROR' ? (
                  <XCircle size={16} className="text-red-500" />
                ) : (
                  <Badge variant="default" size="sm">
                    Próximamente
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-navy-900 font-semibold">{integration.name}</p>
                <p className="text-navy-500 mt-0.5 text-xs">{integration.desc}</p>
                <span className="bg-surface-hover text-navy-400 mt-2 inline-block rounded-full px-2 py-0.5 text-xs">
                  {integration.category}
                </span>
              </div>
              <Button variant="outline" size="xs" disabled={integration.status === 'COMING_SOON'}>
                {integration.status === 'ACTIVE' ? 'Configurar' : 'Próximamente'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
