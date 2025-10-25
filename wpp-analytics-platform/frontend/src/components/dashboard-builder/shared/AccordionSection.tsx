import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionSectionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * AccordionSection Component
 *
 * Reusable accordion wrapper with consistent styling
 * Used throughout dashboard builder for collapsible sections
 * Provides smooth animations and keyboard accessibility
 *
 * @example
 * <AccordionSection
 *   title="Dimensions"
 *   icon={<LayersIcon />}
 *   badge={<Badge>3</Badge>}
 *   defaultOpen={true}
 * >
 *   <div>Content here</div>
 * </AccordionSection>
 */
export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  badge,
  children,
  defaultOpen = false,
  onToggle,
  className,
  headerClassName,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className={cn('border rounded-lg bg-white', className)}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'hover:bg-gray-50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          headerClassName
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0 text-gray-600">
              {icon}
            </div>
          )}
          <span className="font-semibold text-gray-900">{title}</span>
          {badge && (
            <div className="flex-shrink-0">
              {badge}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div
          className={cn(
            'border-t px-4 py-3',
            'animate-in slide-in-from-top-2 duration-200',
            contentClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Compact accordion variant for nested sections
 */
export const CompactAccordionSection: React.FC<AccordionSectionProps> = (props) => (
  <AccordionSection
    {...props}
    className={cn('border-0 shadow-none', props.className)}
    headerClassName={cn('p-2', props.headerClassName)}
    contentClassName={cn('px-2 py-2', props.contentClassName)}
  />
);
