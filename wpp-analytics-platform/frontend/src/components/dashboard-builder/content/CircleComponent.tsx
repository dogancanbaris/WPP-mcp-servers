import React from 'react';

/**
 * CircleComponent Props
 * Circular design shape with customizable styling
 */
export interface CircleComponentProps {
  /** Radius of the circle in pixels */
  radius?: number;
  /** Fill color (hex, rgb, rgba, or CSS color name) */
  fillColor?: string;
  /** Border width in pixels */
  borderWidth?: number;
  /** Border color (hex, rgb, rgba, or CSS color name) */
  borderColor?: string;
  /** Border style (solid, dashed, dotted) */
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  /** Enable shadow effect */
  enableShadow?: boolean;
  /** Shadow blur radius in pixels */
  shadowBlur?: number;
  /** Shadow color (hex, rgb, rgba, or CSS color name) */
  shadowColor?: string;
  /** Shadow offset X in pixels */
  shadowOffsetX?: number;
  /** Shadow offset Y in pixels */
  shadowOffsetY?: number;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles to override defaults */
  style?: React.CSSProperties;
  /** Content to render inside the circle */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Hover handler */
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Mouse leave handler */
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Opacity (0-1) */
  opacity?: number;
  /** Z-index for layering */
  zIndex?: number;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Enable hover scale effect */
  enableHoverScale?: boolean;
  /** Hover scale factor (e.g., 1.1 for 10% larger) */
  hoverScaleFactor?: number;
}

/**
 * CircleComponent
 *
 * A reusable circular design shape component with extensive customization options.
 * Perfect for badges, avatars, decorative elements, or interactive UI components.
 *
 * Features:
 * - Customizable radius
 * - Fill color with opacity support
 * - Border styling (width, color, style)
 * - Shadow effects (blur, offset, color)
 * - Hover effects
 * - Content rendering inside circle
 * - Responsive and accessible
 *
 * @example
 * ```tsx
 * // Simple circle
 * <CircleComponent radius={50} fillColor="#3b82f6" />
 *
 * // Circle with border and shadow
 * <CircleComponent
 *   radius={60}
 *   fillColor="#10b981"
 *   borderWidth={3}
 *   borderColor="#059669"
 *   enableShadow
 *   shadowBlur={10}
 *   shadowColor="rgba(0, 0, 0, 0.2)"
 * />
 *
 * // Interactive circle with content
 * <CircleComponent
 *   radius={80}
 *   fillColor="#f59e0b"
 *   enableHoverScale
 *   onClick={() => console.log('Clicked!')}
 * >
 *   <span>Click Me</span>
 * </CircleComponent>
 * ```
 */
export const CircleComponent: React.FC<CircleComponentProps> = ({
  radius = 50,
  fillColor = '#3b82f6',
  borderWidth = 0,
  borderColor = '#000000',
  borderStyle = 'solid',
  enableShadow = false,
  shadowBlur = 10,
  shadowColor = 'rgba(0, 0, 0, 0.25)',
  shadowOffsetX = 0,
  shadowOffsetY = 4,
  className = '',
  style = {},
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  opacity = 1,
  zIndex = 0,
  animationDuration = 0.3,
  enableHoverScale = false,
  hoverScaleFactor = 1.1,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Calculate dimensions
  const diameter = radius * 2;
  const totalSize = diameter + (borderWidth * 2);

  // Build box shadow CSS
  const boxShadow = enableShadow
    ? `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
    : 'none';

  // Build transform for hover effect
  const transform = enableHoverScale && isHovered
    ? `scale(${hoverScaleFactor})`
    : 'scale(1)';

  // Combine styles
  const circleStyles: React.CSSProperties = {
    width: `${diameter}px`,
    height: `${diameter}px`,
    borderRadius: '50%',
    backgroundColor: fillColor,
    border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
    boxShadow,
    opacity,
    zIndex,
    transform,
    transition: `all ${animationDuration}s ease-in-out`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none',
    position: 'relative',
    flexShrink: 0,
    ...style,
  };

  // Handle mouse enter
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (onMouseEnter) {
      onMouseEnter(event);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    if (onMouseLeave) {
      onMouseLeave(event);
    }
  };

  return (
    <div
      className={`circle-component ${className}`}
      style={circleStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClick(e as any);
              }
            }
          : undefined
      }
      aria-label={typeof children === 'string' ? children : 'Circle component'}
    >
      {children}
    </div>
  );
};

/**
 * CircleComponentGroup
 *
 * Helper component for rendering multiple circles in a layout
 */
export interface CircleComponentGroupProps {
  /** Array of circle configurations */
  circles: CircleComponentProps[];
  /** Layout direction */
  direction?: 'horizontal' | 'vertical' | 'grid';
  /** Gap between circles in pixels */
  gap?: number;
  /** Grid columns (only for grid layout) */
  gridColumns?: number;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export const CircleComponentGroup: React.FC<CircleComponentGroupProps> = ({
  circles,
  direction = 'horizontal',
  gap = 16,
  gridColumns = 3,
  className = '',
  style = {},
}) => {
  const groupStyles: React.CSSProperties = {
    display: direction === 'grid' ? 'grid' : 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gridTemplateColumns: direction === 'grid' ? `repeat(${gridColumns}, auto)` : undefined,
    gap: `${gap}px`,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    ...style,
  };

  return (
    <div className={`circle-component-group ${className}`} style={groupStyles}>
      {circles.map((circleProps, index) => (
        <CircleComponent key={index} {...circleProps} />
      ))}
    </div>
  );
};

/**
 * Preset circle configurations for common use cases
 */
export const CirclePresets = {
  /** Success indicator */
  success: {
    radius: 40,
    fillColor: '#10b981',
    borderWidth: 2,
    borderColor: '#059669',
    enableShadow: true,
    shadowColor: 'rgba(16, 185, 129, 0.3)',
  } as CircleComponentProps,

  /** Warning indicator */
  warning: {
    radius: 40,
    fillColor: '#f59e0b',
    borderWidth: 2,
    borderColor: '#d97706',
    enableShadow: true,
    shadowColor: 'rgba(245, 158, 11, 0.3)',
  } as CircleComponentProps,

  /** Error indicator */
  error: {
    radius: 40,
    fillColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#dc2626',
    enableShadow: true,
    shadowColor: 'rgba(239, 68, 68, 0.3)',
  } as CircleComponentProps,

  /** Info indicator */
  info: {
    radius: 40,
    fillColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#2563eb',
    enableShadow: true,
    shadowColor: 'rgba(59, 130, 246, 0.3)',
  } as CircleComponentProps,

  /** Avatar placeholder */
  avatar: {
    radius: 50,
    fillColor: '#9333ea',
    borderWidth: 3,
    borderColor: '#ffffff',
    enableShadow: true,
    shadowBlur: 8,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
  } as CircleComponentProps,

  /** Badge */
  badge: {
    radius: 12,
    fillColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
    enableShadow: false,
  } as CircleComponentProps,

  /** Decorative large */
  decorativeLarge: {
    radius: 100,
    fillColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderStyle: 'dashed',
    enableShadow: false,
  } as CircleComponentProps,

  /** Interactive button */
  interactiveButton: {
    radius: 60,
    fillColor: '#3b82f6',
    borderWidth: 0,
    enableShadow: true,
    shadowBlur: 12,
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    enableHoverScale: true,
    hoverScaleFactor: 1.05,
  } as CircleComponentProps,
};

export default CircleComponent;
