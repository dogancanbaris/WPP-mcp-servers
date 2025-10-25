/**
 * Shared Components for Dashboard Builder
 *
 * This module exports reusable utility components used across
 * the dashboard builder interface. These components provide
 * consistent styling, behavior, and user experience.
 */

// Badge components for dimensions, metrics, and filters
export {
  BadgePill,
  DimensionBadge,
  MetricBadge,
  FilterBadge,
  type BadgePillProps,
} from './BadgePill';

// Drag handle components for drag-and-drop interfaces
export {
  DragHandle,
  InlineDragHandle,
  LargeDragHandle,
  type DragHandleProps,
} from './DragHandle';

// Accordion components for collapsible sections
export {
  AccordionSection,
  CompactAccordionSection,
  type AccordionSectionProps,
} from './AccordionSection';

// Empty state components for when content is empty
export {
  EmptyState,
  CompactEmptyState,
  LargeEmptyState,
  type EmptyStateProps,
} from './EmptyState';

// Loading components for async operations
export {
  LoadingSpinner,
  InlineLoadingSpinner,
  LoadingOverlay,
  Skeleton,
  TextSkeleton,
  CardSkeleton,
  type LoadingSpinnerProps,
  type SkeletonProps,
} from './LoadingSpinner';

// Tooltip components for contextual help
export {
  Tooltip,
  InfoTooltip,
  type TooltipProps,
} from './Tooltip';

// Color picker component for color selection
export {
  ColorPicker,
} from './ColorPicker';
