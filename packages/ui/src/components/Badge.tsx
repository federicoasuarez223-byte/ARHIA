import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-navy-100 text-navy-800',
        gold: 'bg-gold-100 text-gold-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
        outline: 'border border-border bg-transparent text-navy-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-navy-600': variant === 'default',
            'bg-gold-600': variant === 'gold',
            'bg-green-600': variant === 'success',
            'bg-amber-600': variant === 'warning',
            'bg-red-600': variant === 'danger',
            'bg-blue-600': variant === 'info',
            'bg-purple-600': variant === 'purple',
          })}
        />
      )}
      {children}
    </span>
  );
}
