import React from 'react';

export type LineOrientation = 'horizontal' | 'vertical';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface LineComponentProps {
  /**
   * Orientation of the line
   * @default 'horizontal'
   */
  orientation?: LineOrientation;

  /**
   * Thickness of the line in pixels
   * @default 1
   */
  thickness?: number;

  /**
   * Color of the line (CSS color value)
   * @default '#e5e7eb' (gray-200)
   */
  color?: string;

  /**
   * Line style
   * @default 'solid'
   */
  style?: LineStyle;

  /**
   * Length of the line
   * - For horizontal: width (e.g., '100%', '200px', '50vw')
   * - For vertical: height (e.g., '100%', '200px', '50vh')
   * @default '100%'
   */
  length?: string | number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Margin around the line (CSS margin value)
   * @default '16px 0' for horizontal, '0 16px' for vertical
   */
  margin?: string;

  /**
   * Opacity of the line (0-1)
   * @default 1
   */
  opacity?: number;

  /**
   * Accessibility label
   */
  ariaLabel?: string;
}

/**
 * LineComponent - Flexible divider/separator component
 *
 * @example
 * // Basic horizontal divider
 * <LineComponent />
 *
 * @example
 * // Vertical separator with custom styling
 * <LineComponent
 *   orientation="vertical"
 *   thickness={2}
 *   color="#3b82f6"
 *   style="dashed"
 *   length="200px"
 * />
 *
 * @example
 * // Section divider with custom margin
 * <LineComponent
 *   thickness={3}
 *   color="#10b981"
 *   style="solid"
 *   margin="32px 0"
 * />
 */
export const LineComponent: React.FC<LineComponentProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color = '#e5e7eb',
  style = 'solid',
  length = '100%',
  className = '',
  margin,
  opacity = 1,
  ariaLabel = 'Divider',
}) => {
  // Convert length to CSS value
  const lengthValue = typeof length === 'number' ? `${length}px` : length;

  // Default margin based on orientation
  const defaultMargin = orientation === 'horizontal' ? '16px 0' : '0 16px';
  const marginValue = margin ?? defaultMargin;

  // Map style to CSS border-style
  const borderStyleMap: Record<LineStyle, string> = {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  };

  const lineStyles: React.CSSProperties = orientation === 'horizontal'
    ? {
        width: lengthValue,
        height: `${thickness}px`,
        borderTop: `${thickness}px ${borderStyleMap[style]} ${color}`,
        margin: marginValue,
        opacity,
      }
    : {
        width: `${thickness}px`,
        height: lengthValue,
        borderLeft: `${thickness}px ${borderStyleMap[style]} ${color}`,
        margin: marginValue,
        opacity,
      };

  return (
    <div
      role="separator"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={`line-component ${className}`.trim()}
      style={lineStyles}
    />
  );
};

/**
 * Pre-configured line variants for common use cases
 */
export const LineDivider: React.FC<Omit<LineComponentProps, 'orientation'>> = (props) => (
  <LineComponent {...props} orientation="horizontal" />
);

export const LineSeparator: React.FC<Omit<LineComponentProps, 'orientation'>> = (props) => (
  <LineComponent {...props} orientation="vertical" />
);

/**
 * Section divider with thicker line and more spacing
 */
export const SectionDivider: React.FC<Omit<LineComponentProps, 'thickness' | 'margin'>> = (props) => (
  <LineComponent {...props} thickness={2} margin="32px 0" />
);

/**
 * Subtle divider with lighter color and less spacing
 */
export const SubtleDivider: React.FC<Omit<LineComponentProps, 'color' | 'opacity' | 'margin'>> = (props) => (
  <LineComponent {...props} color="#f3f4f6" opacity={0.6} margin="8px 0" />
);

/**
 * Accent divider with brand color
 */
export const AccentDivider: React.FC<Omit<LineComponentProps, 'color' | 'thickness'>> = (props) => (
  <LineComponent {...props} color="#3b82f6" thickness={2} />
);

export default LineComponent;
