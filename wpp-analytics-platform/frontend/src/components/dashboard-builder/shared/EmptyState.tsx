import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'py-6',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-8',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'py-12',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
  },
};

/**
 * EmptyState Component
 *
 * Reusable empty state component for displaying when content is empty
 * Used throughout dashboard builder for better UX
 *
 * @example
 * <EmptyState
 *   icon={<DatabaseIcon />}
 *   title="No data sources"
 *   description="Connect a data source to start building your dashboard"
 *   action={{
 *     label: "Add Data Source",
 *     onClick: () => {}
 *   }}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}) => {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4',
          styles.icon
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold text-gray-900 mb-2', styles.title)}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn('text-gray-500 max-w-sm mb-4', styles.description)}>
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            action.variant === 'secondary'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Compact empty state for smaller containers
 */
export const CompactEmptyState: React.FC<EmptyStateProps> = (props) => (
  <EmptyState {...props} size="sm" />
);

/**
 * Large empty state for prominent empty sections
 */
export const LargeEmptyState: React.FC<EmptyStateProps> = (props) => (
  <EmptyState {...props} size="lg" />
);
