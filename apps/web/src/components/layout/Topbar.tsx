import { Bell, Search } from 'lucide-react';

import { Button } from '@arhia/ui';
import { useAuthStore } from '@/store/auth.store';

export function Topbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          type="text"
          placeholder="Buscar empleado, módulo..."
          className="h-8 w-full rounded-lg border border-border bg-surface pl-8 pr-3 text-sm text-navy-700 placeholder:text-navy-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 hover:bg-surface-hover hover:text-navy-900">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-500" />
        </button>

        {/* ARHIA AI indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
          <span className="text-xs font-semibold text-gold-700">ARHIA activo</span>
        </div>

        {/* User avatar */}
        {user && (
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white hover:bg-navy-800"
            title="Cerrar sesión"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        )}
      </div>
    </header>
  );
}
