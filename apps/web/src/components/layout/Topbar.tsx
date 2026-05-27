import { useQuery } from '@tanstack/react-query';
import { Bell, Search, AlertTriangle, Clock, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import apiClient from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

// ── Notification types ────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  body: string;
  href: string;
  createdAt: string;
}

const TYPE_ICON = {
  danger: AlertTriangle,
  warning: Clock,
  info: UserPlus,
};

const TYPE_COLOR = {
  danger: 'text-red-500 bg-red-50',
  warning: 'text-amber-500 bg-amber-50',
  info: 'text-blue-500 bg-blue-50',
};

// ── Bell dropdown ─────────────────────────────────────────────────────────────

function NotificationDropdown({
  notifications,
  isLoading,
  onClose,
}: {
  notifications: Notification[];
  isLoading: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="border-border absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-white shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-navy-900 text-sm font-semibold">Alertas activas</p>
        <button onClick={onClose} className="text-navy-400 hover:text-navy-700">
          <X size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-navy-400 text-sm">Cargando...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell size={28} className="text-navy-100 mb-2" />
          <p className="text-navy-500 text-sm font-medium">Sin alertas activas</p>
          <p className="text-navy-400 mt-0.5 text-xs">Todo está en orden</p>
        </div>
      ) : (
        <div className="max-h-80 divide-y overflow-y-auto">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type];
            const color = TYPE_COLOR[n.type];
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n.href)}
                className="hover:bg-surface w-full px-4 py-3 text-left transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}
                  >
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-navy-900 truncate text-xs font-semibold">{n.title}</p>
                    <p className="text-navy-500 mt-0.5 truncate text-xs">{n.body}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="border-t px-4 py-2">
        <p className="text-navy-400 text-xs">
          {notifications.length} alerta{notifications.length !== 1 ? 's' : ''} activa
          {notifications.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────

export function Topbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Notification[] }>('/api/notifications')
        .then((r) => r.data.data),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const notifications = data ?? [];
  const count = notifications.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <header className="border-border flex h-14 shrink-0 items-center justify-between border-b bg-white px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search size={14} className="text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar empleado, módulo..."
          className="border-border bg-surface text-navy-700 placeholder:text-navy-400 focus:border-gold-400 focus:ring-gold-100 h-8 w-full rounded-lg border pl-8 pr-3 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-navy-500 hover:bg-surface-hover hover:text-navy-900 relative flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <Bell size={16} />
            {count > 0 && (
              <span className="bg-gold-500 absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
          {open && (
            <NotificationDropdown
              notifications={notifications}
              isLoading={isLoading}
              onClose={() => setOpen(false)}
            />
          )}
        </div>

        {/* ARHIA AI indicator */}
        <div className="bg-gold-50 flex items-center gap-1.5 rounded-full px-3 py-1">
          <div className="bg-gold-500 h-1.5 w-1.5 animate-pulse rounded-full" />
          <span className="text-gold-700 text-xs font-semibold">ARHIA activo</span>
        </div>

        {/* User avatar */}
        {user && (
          <button
            onClick={logout}
            className="bg-navy-900 hover:bg-navy-800 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            title="Cerrar sesión"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        )}
      </div>
    </header>
  );
}
