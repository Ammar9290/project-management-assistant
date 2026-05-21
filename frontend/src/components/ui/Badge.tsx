import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm',
    success: 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 backdrop-blur-sm',
    warning: 'bg-amber-100/80 text-amber-800 border border-amber-200/50 backdrop-blur-sm',
    danger: 'bg-rose-100/80 text-rose-800 border border-rose-200/50 backdrop-blur-sm',
    info: 'bg-blue-100/80 text-blue-800 border border-blue-200/50 backdrop-blur-sm',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase transition-all duration-300',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
