import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@arhia/ui';
import { Settings, Building2, Users, Shield, Bell, Palette, Save } from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';

const TABS = [
  { id: 'company', label: 'Empresa', icon: Building2 },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
];

export function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-navy-900 text-2xl font-bold">Configuración</h1>
        <p className="text-navy-500 mt-1 text-sm">
          Administrá tu cuenta y la configuración de la plataforma
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  id === 'company'
                    ? 'bg-navy-900 text-white'
                    : 'text-navy-600 hover:bg-surface-hover'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={16} className="text-navy-500" />
                Datos de la empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nombre de la empresa" defaultValue={user?.companyName ?? ''} />
                <Input label="CUIT" placeholder="XX-XXXXXXXX-X" />
                <Input label="Razón social" placeholder="Nombre legal" />
                <Input label="Email de contacto" type="email" placeholder="contacto@empresa.com" />
                <Input label="Teléfono" placeholder="+54 11 XXXX-XXXX" />
                <Input label="Sitio web" placeholder="https://empresa.com" />
              </div>
              <div>
                <label className="text-navy-700 mb-1.5 block text-sm font-medium">
                  Domicilio fiscal
                </label>
                <Input placeholder="Dirección completa" />
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm">
                  <Save size={14} /> Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={16} className="text-navy-500" />
                Preferencias del sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-navy-700 mb-1.5 block text-sm font-medium">
                    Moneda principal
                  </label>
                  <select className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1">
                    <option value="ARS">ARS — Peso argentino</option>
                    <option value="USD">USD — Dólar estadounidense</option>
                  </select>
                </div>
                <div>
                  <label className="text-navy-700 mb-1.5 block text-sm font-medium">
                    Zona horaria
                  </label>
                  <select className="border-border text-navy-700 focus:ring-navy-400 h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-1">
                    <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
                    <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm">
                  <Save size={14} /> Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plan info */}
          <Card>
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-navy-900 font-semibold">Plan actual</p>
                <p className="text-navy-500 mt-0.5 text-sm">
                  Estás usando el plan{' '}
                  <strong>{user?.role === 'SUPER_ADMIN' ? 'Enterprise' : 'Business'}</strong>
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver planes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
