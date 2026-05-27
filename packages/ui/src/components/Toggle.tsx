import { cn } from '../utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, disabled, size = 'md' }: ToggleProps) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2', disabled && 'cursor-not-allowed opacity-50')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2',
          checked ? 'bg-gold-500' : 'bg-navy-200',
          size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition-transform duration-200',
            size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
            checked
              ? size === 'sm' ? 'translate-x-4' : 'translate-x-5'
              : 'translate-x-0',
          )}
        />
      </button>
      {label && <span className="text-sm font-medium text-navy-700">{label}</span>}
    </label>
  );
}
