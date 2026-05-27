import { Bell, Search } from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';

export function Topbar() {
  const { user, logout } = useAuthStore();

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
        <button className="text-navy-500 hover:bg-surface-hover hover:text-navy-900 relative flex h-8 w-8 items-center justify-center rounded-lg">
          <Bell size={16} />
          <span className="bg-gold-500 absolute right-1.5 top-1.5 h-2 w-2 rounded-full" />
        </button>

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
