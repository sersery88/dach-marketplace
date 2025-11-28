import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
    );

    const variants = {
      primary: cn(
        'bg-primary-600 text-white',
        'hover:bg-primary-700 active:bg-primary-800',
        'focus:ring-primary-500'
      ),
      secondary: cn(
        'bg-neutral-100 text-neutral-900',
        'hover:bg-neutral-200 active:bg-neutral-300',
        'focus:ring-neutral-500'
      ),
      outline: cn(
        'border-2 border-primary-600 text-primary-600 bg-transparent',
        'hover:bg-primary-50 active:bg-primary-100',
        'focus:ring-primary-500'
      ),
      ghost: cn(
        'text-neutral-700 bg-transparent',
        'hover:bg-neutral-100 active:bg-neutral-200',
        'focus:ring-neutral-500'
      ),
      danger: cn(
        'bg-red-600 text-white',
        'hover:bg-red-700 active:bg-red-800',
        'focus:ring-red-500'
      ),
      success: cn(
        'bg-green-600 text-white',
        'hover:bg-green-700 active:bg-green-800',
        'focus:ring-green-500'
      ),
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2',
      xl: 'px-6 py-3 text-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

