import { cn } from '@arhia/ui';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  GraduationCap,
  Heart,
  BarChart3,
  Puzzle,
  Zap,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Empleados', path: '/employees' },
  { icon: Building2, label: 'Departamentos', path: '/departments' },
  { icon: AlertTriangle, label: 'Riesgo', path: '/risk' },
  { icon: UserPlus, label: 'Reclutamiento', path: '/recruitment' },
  { icon: TrendingUp, label: 'Performance', path: '/performance' },
  { icon: DollarSign, label: 'Liquidaciones', path: '/payroll' },
  { icon: FileText, label: 'Contratos', path: '/contracts' },
  { icon: Clock, label: 'Asistencia', path: '/attendance' },
  { icon: GraduationCap, label: 'Capacitación', path: '/training' },
  { icon: Heart, label: 'Cultura', path: '/culture' },
  { icon: BarChart3, label: 'Reportes', path: '/reports' },
  { icon: Puzzle, label: 'Integraciones', path: '/integrations' },
  { icon: Zap, label: 'Automatización', path: '/automation' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'bg-navy-900 relative flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-gold-500 flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-navy-900 text-xs font-black">AR</span>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">ARHIA</span>
          </div>
        )}
        {collapsed && (
          <div className="bg-gold-500 flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-navy-900 text-xs font-black">AR</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    'text-navy-300 hover:bg-white/10 hover:text-white',
                    isActive && 'bg-white/15 text-white',
                    collapsed && 'justify-center px-0',
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 p-2">
        {/* Chat ARHIA */}
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            cn(
              'mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150',
              'bg-gold-500/15 text-gold-400 hover:bg-gold-500/25',
              isActive && 'bg-gold-500/25 text-gold-300',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <MessageSquare size={18} className="shrink-0" />
          {!collapsed && <span>Chat ARHIA</span>}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
              'text-navy-300 hover:bg-white/10 hover:text-white',
              isActive && 'bg-white/15 text-white',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Configuración</span>}
        </NavLink>

        {/* User info */}
        {!collapsed && user && (
          <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="bg-navy-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user.name}</p>
              <p className="text-2xs text-navy-400 truncate">{user.companyName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="border-border hover:bg-surface-hover absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm"
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-navy-500" />
        ) : (
          <ChevronLeft size={12} className="text-navy-500" />
        )}
      </button>
    </aside>
  );
}
