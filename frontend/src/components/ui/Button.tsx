import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, type = 'button', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 rounded-xl shadow-sm active:scale-95';
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-500 hover:shadow-md hover:-translate-y-0.5',
      secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300',
      danger: 'bg-red-600 text-white hover:bg-red-500 hover:shadow-md hover:-translate-y-0.5 shadow-red-500/20',
      ghost: 'hover:bg-slate-100 text-slate-600 shadow-none hover:text-slate-900',
      premium: 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-primary-500/25 border-t border-white/20 hover:-translate-y-0.5',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-6 text-sm',
      lg: 'h-14 px-8 text-base',
    };

    return (
      <button
        type={type}
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin opacity-70" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
