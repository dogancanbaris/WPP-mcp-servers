import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgePillProps {
  type: 'dimension' | 'metric' | 'filter';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const typeStyles = {
  dimension: 'bg-[#E8F5E9] text-[#1E8E3E] border-[#C8E6C9]',
  metric: 'bg-[#E8F0FE] text-[#1967D2] border-[#AECBFA]',
  filter: 'bg-[#FEF7E0] text-[#E37400] border-[#FEEFC3]',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px] leading-4',
  md: 'px-2 py-0.5 text-[11px] leading-4',
  lg: 'px-3 py-1 text-xs leading-4',
};

/**
 * BadgePill Component
 *
 * Reusable badge for displaying dimension, metric, and filter labels
 * Used throughout dashboard builder for consistent visual language
 *
 * @example
 * <BadgePill type="dimension">Date</BadgePill>
 * <BadgePill type="metric">Clicks</BadgePill>
 * <BadgePill type="filter">Country = US</BadgePill>
 */
export const BadgePill: React.FC<BadgePillProps> = ({
  type,
  children,
  className,
  size = 'md',
}) => {
  // Add icon prefix for Looker Studio style
  const prefix = type === 'dimension' ? 'ABC' : type === 'metric' ? '#' : '';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-full border font-medium whitespace-nowrap',
        typeStyles[type],
        sizeStyles[size],
        className
      )}
    >
      {prefix && <span className="font-semibold">{prefix}</span>}
      {children}
    </span>
  );
};

/**
 * Preset badge components for common use cases
 */
export const DimensionBadge: React.FC<Omit<BadgePillProps, 'type'>> = (props) => (
  <BadgePill type="dimension" {...props} />
);

export const MetricBadge: React.FC<Omit<BadgePillProps, 'type'>> = (props) => (
  <BadgePill type="metric" {...props} />
);

export const FilterBadge: React.FC<Omit<BadgePillProps, 'type'>> = (props) => (
  <BadgePill type="filter" {...props} />
);
