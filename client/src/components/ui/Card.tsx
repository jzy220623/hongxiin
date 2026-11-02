import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ className = '', children, hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
        shadow-sm dark:shadow-none
        ${hover ? 'cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-800' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}