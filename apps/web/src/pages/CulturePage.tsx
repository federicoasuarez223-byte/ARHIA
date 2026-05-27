import { Button, Card, CardContent, CardHeader, CardTitle } from '@arhia/ui';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Heart, Star, Award, Smile } from 'lucide-react';

import apiClient from '@/services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Recognition {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  giver: { id: string; firstName: string; lastName: string };
  recipient: { id: string; firstName: string; lastName: string };
}

interface CultureStats {
  thisMonth: number;
  byType: Record<string, number>;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const RECOGNITION_TYPES = [
  { type: 'LOGRO', label: 'Logro', icon: '🏆' },
  { type: 'COMPANERO', label: 'Compañero', icon: '🤝' },
  { type: 'INNOVACION', label: 'Innovación', icon: '💡' },
  { type: 'LIDERAZGO', label: 'Liderazgo', icon: '🚀' },
  { type: 'CLIENTE', label: 'Clientes', icon: '❤️' },
  { type: 'ANTIGUEDAD', label: 'Antigüedad', icon: '⭐' },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  RECOGNITION_TYPES.map((r) => [r.type, r.label]),
);

// ── Page ───────────────────────────────────────────────────────────────────────

export function CulturePage() {
  const { data: stats } = useQuery({
    queryKey: ['culture-stats'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: CultureStats }>('/api/culture/stats')
        .then((r) => r.data.data),
  });

  const { data: recognitionsData, isLoading } = useQuery({
    queryKey: ['recognitions'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Recognition[] }>('/api/culture/recognitions?limit=20')
        .then((r) => r.data.data),
  });

  const recognitions = recognitionsData ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-navy-900 text-2xl font-bold">Cultura</h1>
          <p className="text-navy-500 mt-1 text-sm">Reconocimientos y clima organizacional</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Heart,
            label: 'Reconocimientos este mes',
            value: stats?.thisMonth ?? '—',
            color: 'bg-red-50 text-red-600',
          },
          {
            icon: Star,
            label: 'Tipos de reconocimiento',
            value: RECOGNITION_TYPES.length,
            color: 'bg-gold-50 text-gold-600',
          },
          {
            icon: Smile,
            label: 'Total reconocimientos',
            value: stats ? Object.values(stats.byType).reduce((s, n) => s + n, 0) : '—',
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={16} className="text-gold-500" />
            Distribución por tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {RECOGNITION_TYPES.map((r) => (
              <div
                key={r.type}
                className="border-border flex flex-col items-center rounded-xl border p-4 text-center"
              >
                <span className="text-3xl">{r.icon}</span>
                <p className="text-navy-700 mt-2 text-xs font-semibold">{r.label}</p>
                <p className="text-navy-900 mt-1 text-2xl font-bold">
                  {stats?.byType[r.type] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            Feed de reconocimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-navy-400 text-sm">Cargando...</p>
            </div>
          ) : recognitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart size={40} className="text-navy-100 mb-3" />
              <p className="text-navy-500 font-medium">Aún no hay reconocimientos</p>
              <p className="text-navy-400 mt-1 text-sm">
                Sé el primero en reconocer el trabajo de un compañero
              </p>
              <Button variant="primary" size="sm" className="mt-4">
                Dar reconocimiento
              </Button>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {recognitions.map((r) => (
                <div key={r.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-navy-900 font-medium">{r.title}</p>
                      <p className="text-navy-500 mt-0.5 text-sm">
                        <span className="font-medium">
                          {r.giver.firstName} {r.giver.lastName}
                        </span>{' '}
                        reconoció a{' '}
                        <span className="font-medium">
                          {r.recipient.firstName} {r.recipient.lastName}
                        </span>
                      </p>
                      <p className="text-navy-400 mt-1 text-sm">{r.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="bg-gold-50 text-gold-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                        {TYPE_LABEL[r.type] ?? r.type}
                      </span>
                      <span className="text-navy-400 text-xs">
                        {formatDistanceToNow(new Date(r.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
