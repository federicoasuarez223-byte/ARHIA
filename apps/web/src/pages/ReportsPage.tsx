import { Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { BarChart3, Download, FileText, Users, DollarSign, Clock, TrendingUp } from 'lucide-react';

const REPORTS = [
  {
    category: 'Recursos Humanos',
    items: [
      {
        icon: Users,
        title: 'Headcount por departamento',
        desc: 'Distribución de empleados activos por área',
        tag: 'Disponible',
      },
      {
        icon: TrendingUp,
        title: 'Rotación de personal',
        desc: 'Altas y bajas en el período seleccionado',
        tag: 'Disponible',
      },
      {
        icon: Users,
        title: 'Pirámide de seniority',
        desc: 'Antigüedad y distribución de experiencia',
        tag: 'Disponible',
      },
    ],
  },
  {
    category: 'Liquidaciones',
    items: [
      {
        icon: DollarSign,
        title: 'Masa salarial mensual',
        desc: 'Evolución de costos laborales',
        tag: 'Próximamente',
      },
      {
        icon: FileText,
        title: 'Recibos de haberes',
        desc: 'Exportación masiva de recibos del período',
        tag: 'Próximamente',
      },
    ],
  },
  {
    category: 'Asistencia',
    items: [
      {
        icon: Clock,
        title: 'Ausentismo',
        desc: 'Índice de inasistencias por departamento',
        tag: 'Próximamente',
      },
      {
        icon: Clock,
        title: 'Horas extras',
        desc: 'Resumen de horas adicionales trabajadas',
        tag: 'Próximamente',
      },
    ],
  },
];

export function ReportsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Reportes</h1>
          <p className="text-navy-500 mt-1 text-sm">Informes y exportaciones de datos</p>
        </div>
        <Button variant="outline" size="sm">
          <Download size={16} /> Exportar todo
        </Button>
      </div>

      <div className="space-y-6">
        {REPORTS.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={16} className="text-navy-500" />
                {section.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => {
                const available = item.tag === 'Disponible';
                return (
                  <div
                    key={item.title}
                    className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors ${available ? 'hover:border-navy-300 hover:bg-surface cursor-pointer' : 'opacity-60'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="bg-navy-50 flex h-10 w-10 items-center justify-center rounded-lg">
                        <item.icon size={18} className="text-navy-600" />
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${available ? 'bg-green-100 text-green-700' : 'bg-surface-hover text-navy-400'}`}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <div>
                      <p className="text-navy-900 font-semibold">{item.title}</p>
                      <p className="text-navy-500 mt-0.5 text-sm">{item.desc}</p>
                    </div>
                    {available && (
                      <Button variant="outline" size="xs" className="self-start">
                        <Download size={12} /> Descargar
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
