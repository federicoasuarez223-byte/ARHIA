import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { DollarSign, Download, Plus, TrendingUp } from 'lucide-react';

const PERIODS = [
  { period: 'Mayo 2025', employees: 0, total: 0, status: 'DRAFT' },
  { period: 'Abril 2025', employees: 0, total: 0, status: 'PAID' },
  { period: 'Marzo 2025', employees: 0, total: 0, status: 'PAID' },
];

const STATUS_CFG: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  PAID: { label: 'Pagado', variant: 'success' },
  DRAFT: { label: 'Borrador', variant: 'default' },
  PROCESSING: { label: 'Procesando', variant: 'warning' },
};

export function PayrollPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Liquidaciones</h1>
          <p className="text-navy-500 mt-1 text-sm">Gestión de sueldos y recibos de haberes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} /> Exportar
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={16} /> Nueva liquidación
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: DollarSign,
            label: 'Masa salarial mensual',
            value: 'ARS —',
            color: 'bg-navy-50 text-navy-600',
          },
          {
            icon: TrendingUp,
            label: 'Variación vs mes anterior',
            value: '—%',
            color: 'bg-green-50 text-green-600',
          },
          {
            icon: DollarSign,
            label: 'Costo laboral total',
            value: 'ARS —',
            color: 'bg-gold-50 text-gold-600',
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-navy-900 text-xl font-bold">{value}</p>
                <p className="text-navy-500 text-sm">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={16} className="text-navy-500" />
            Períodos de liquidación
          </CardTitle>
        </CardHeader>
        <div className="divide-border divide-y">
          {PERIODS.map((p) => {
            const cfg = STATUS_CFG[p.status] ?? { label: p.status, variant: 'default' as const };
            return (
              <div
                key={p.period}
                className="hover:bg-surface flex cursor-pointer items-center justify-between px-6 py-4 transition-colors"
              >
                <div>
                  <p className="text-navy-900 font-semibold">{p.period}</p>
                  <p className="text-navy-500 text-sm">{p.employees} empleados</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-navy-900 font-semibold">
                      {p.total > 0 ? `ARS ${p.total.toLocaleString('es-AR')}` : 'Sin datos'}
                    </p>
                    <p className="text-navy-400 text-xs">total neto</p>
                  </div>
                  <Badge variant={cfg.variant} size="sm" dot>
                    {cfg.label}
                  </Badge>
                  <Button variant="outline" size="xs">
                    <Download size={12} /> Recibos
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Note */}
      <div className="border-gold-200 bg-gold-50 rounded-xl border p-4">
        <p className="text-gold-800 text-sm font-medium">Integración con AFIP</p>
        <p className="text-gold-700 mt-1 text-sm">
          Los recibos de haberes se generan automáticamente y se envían por email al empleado.
          Próximamente: integración con AFIP y exportación F931.
        </p>
      </div>
    </div>
  );
}
