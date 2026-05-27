import { forwardRef } from 'react';

import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-navy-700">
            {label}
            {props.required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-navy-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy-900 placeholder:text-navy-400',
              'transition-colors focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100',
              'disabled:cursor-not-allowed disabled:bg-surface disabled:text-navy-400',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-3 flex items-center text-navy-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-navy-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
