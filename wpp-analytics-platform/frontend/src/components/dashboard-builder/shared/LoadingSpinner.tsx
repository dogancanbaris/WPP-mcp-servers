import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

/**
 * LoadingSpinner Component
 *
 * Consistent loading state component with optional text
 * Used throughout dashboard builder for async operations
 *
 * @example
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" text="Loading data..." />
 * <LoadingSpinner fullScreen text="Building dashboard..." />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
  fullScreen = false,
}) => {
  const spinner = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-screen',
        className
      )}
    >
      <Loader2
        className={cn(
          'animate-spin text-blue-600',
          sizeStyles[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Inline loading spinner for buttons and compact spaces
 */
export const InlineLoadingSpinner: React.FC<Omit<LoadingSpinnerProps, 'fullScreen' | 'text'>> = (
  props
) => <LoadingSpinner {...props} size={props.size || 'sm'} />;

/**
 * Loading overlay for sections
 */
export const LoadingOverlay: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading...',
  ...props
}) => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
    <LoadingSpinner text={text} {...props} />
  </div>
);

/**
 * Loading skeleton for content placeholders
 */
export interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-gray-200 rounded',
            className
          )}
        />
      ))}
    </>
  );
};

/**
 * Loading skeleton for text content
 */
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-2/3' : 'w-full'
        )}
      />
    ))}
  </div>
);

/**
 * Loading skeleton for card content
 */
export const CardSkeleton: React.FC = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Skeleton className="h-6 w-1/3" />
    <TextSkeleton lines={2} />
  </div>
);
