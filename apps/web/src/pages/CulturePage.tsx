import { Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { Heart, Star, Award, Plus, Smile } from 'lucide-react';

const RECOGNITION_TYPES = [
  { type: 'TEAMWORK', label: 'Trabajo en equipo', icon: '🤝', color: 'bg-blue-50 border-blue-200' },
  { type: 'INNOVATION', label: 'Innovación', icon: '💡', color: 'bg-amber-50 border-amber-200' },
  { type: 'LEADERSHIP', label: 'Liderazgo', icon: '🚀', color: 'bg-purple-50 border-purple-200' },
  { type: 'EXCELLENCE', label: 'Excelencia', icon: '⭐', color: 'bg-gold-50 border-gold-200' },
  {
    type: 'CUSTOMER',
    label: 'Orientación al cliente',
    icon: '❤️',
    color: 'bg-red-50 border-red-200',
  },
];

export function CulturePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Cultura</h1>
          <p className="text-navy-500 mt-1 text-sm">Reconocimientos y clima organizacional</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} /> Dar reconocimiento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Heart,
            label: 'Reconocimientos este mes',
            value: '—',
            color: 'bg-red-50 text-red-600',
          },
          { icon: Star, label: 'NPS del equipo', value: '—', color: 'bg-gold-50 text-gold-600' },
          {
            icon: Smile,
            label: 'Índice de engagement',
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

      {/* Recognition types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={16} className="text-gold-500" />
            Tipos de reconocimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {RECOGNITION_TYPES.map((r) => (
              <div
                key={r.type}
                className={`flex flex-col items-center rounded-xl border p-4 text-center ${r.color}`}
              >
                <span className="text-3xl">{r.icon}</span>
                <p className="text-navy-700 mt-2 text-xs font-semibold">{r.label}</p>
                <p className="text-navy-900 mt-1 text-2xl font-bold">—</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            Feed de reconocimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart size={40} className="text-navy-100 mb-3" />
            <p className="text-navy-500 font-medium">Aún no hay reconocimientos</p>
            <p className="text-navy-400 mt-1 text-sm">
              Sé el primero en reconocer el trabajo de un compañero
            </p>
            <Button variant="primary" size="sm" className="mt-4">
              <Plus size={14} /> Dar reconocimiento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
