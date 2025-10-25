import React from 'react';

export interface RectangleComponentProps {
  /** Width of the rectangle in pixels or CSS unit */
  width?: number | string;
  /** Height of the rectangle in pixels or CSS unit */
  height?: number | string;
  /** Fill color (hex, rgb, rgba, or CSS color name) */
  fillColor?: string;
  /** Border width in pixels */
  borderWidth?: number;
  /** Border color (hex, rgb, rgba, or CSS color name) */
  borderColor?: string;
  /** Border style (solid, dashed, dotted) */
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  /** Border radius in pixels (uniform) */
  borderRadius?: number;
  /** Individual border radius for each corner [topLeft, topRight, bottomRight, bottomLeft] */
  borderRadiusCorners?: [number, number, number, number];
  /** Shadow configuration */
  shadow?: {
    /** Horizontal offset in pixels */
    offsetX?: number;
    /** Vertical offset in pixels */
    offsetY?: number;
    /** Blur radius in pixels */
    blur?: number;
    /** Spread radius in pixels */
    spread?: number;
    /** Shadow color (hex, rgb, rgba, or CSS color name) */
    color?: string;
    /** Inset shadow */
    inset?: boolean;
  };
  /** Optional CSS class name */
  className?: string;
  /** Optional inline styles (overrides component props) */
  style?: React.CSSProperties;
  /** Optional click handler */
  onClick?: () => void;
  /** Children elements to render inside rectangle */
  children?: React.ReactNode;
}

/**
 * RectangleComponent - A flexible design shape component
 *
 * Features:
 * - Customizable dimensions (width, height)
 * - Fill color with full CSS color support
 * - Border control (width, color, style)
 * - Border radius (uniform or per-corner)
 * - Box shadow with full configuration
 * - Support for children elements
 *
 * @example
 * ```tsx
 * <RectangleComponent
 *   width={200}
 *   height={100}
 *   fillColor="#3b82f6"
 *   borderWidth={2}
 *   borderColor="#1e40af"
 *   borderRadius={8}
 *   shadow={{ offsetX: 0, offsetY: 4, blur: 6, color: 'rgba(0,0,0,0.1)' }}
 * />
 * ```
 */
export const RectangleComponent: React.FC<RectangleComponentProps> = ({
  width = 200,
  height = 100,
  fillColor = '#ffffff',
  borderWidth = 0,
  borderColor = '#000000',
  borderStyle = 'solid',
  borderRadius,
  borderRadiusCorners,
  shadow,
  className = '',
  style = {},
  onClick,
  children,
}) => {
  // Convert width/height to CSS values
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  // Build border radius CSS
  let borderRadiusValue: string;
  if (borderRadiusCorners) {
    borderRadiusValue = borderRadiusCorners.map(r => `${r}px`).join(' ');
  } else if (borderRadius !== undefined) {
    borderRadiusValue = `${borderRadius}px`;
  } else {
    borderRadiusValue = '0';
  }

  // Build box shadow CSS
  let boxShadowValue = 'none';
  if (shadow) {
    const {
      offsetX = 0,
      offsetY = 0,
      blur = 0,
      spread = 0,
      color = 'rgba(0, 0, 0, 0.1)',
      inset = false,
    } = shadow;

    const insetKeyword = inset ? 'inset ' : '';
    boxShadowValue = `${insetKeyword}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
  }

  const rectangleStyle: React.CSSProperties = {
    width: widthValue,
    height: heightValue,
    backgroundColor: fillColor,
    border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
    borderRadius: borderRadiusValue,
    boxShadow: boxShadowValue,
    boxSizing: 'border-box',
    cursor: onClick ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style, // Allow style overrides
  };

  return (
    <div
      className={`rectangle-component ${className}`.trim()}
      style={rectangleStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

export default RectangleComponent;
