import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/25',
  secondary:
    'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
  outline:
    'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  ghost:
    'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/25',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}