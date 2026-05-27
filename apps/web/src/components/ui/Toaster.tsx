import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

import { useToastStore, type Toast, type ToastType } from '@/store/toast.store';

const ICON: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLE: Record<ToastType, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const ICON_STYLE: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const DURATION = 4000;

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const Icon = ICON[toast.type];

  useEffect(() => {
    const t = setTimeout(() => remove(toast.id), DURATION);
    return () => clearTimeout(t);
  }, [toast.id, remove]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${STYLE[toast.type]}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${ICON_STYLE[toast.type]}`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={() => remove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
