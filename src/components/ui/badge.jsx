import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  secondary: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  outline: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
};

function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

