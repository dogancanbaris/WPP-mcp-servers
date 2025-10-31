/**
 * Layout Converter Utilities
 *
 * Converts between row/column layout and canvas absolute positioning
 * Enables hybrid system where agents use row/column and users get free-form canvas
 */

import type {
  RowConfig,
  ColumnWidth,
  CanvasComponent,
  ComponentConfig,
  AbsolutePosition
} from '@/types/dashboard-builder';

// Default configuration
const DEFAULT_CANVAS_WIDTH = 1200;
const DEFAULT_COMPONENT_HEIGHT = 400;
const DEFAULT_GAP = 20;
const DEFAULT_PADDING = 20;

/**
 * Convert column width fraction to pixel width
 */
function columnWidthToPixels(width: ColumnWidth, canvasWidth: number, gap: number): number {
  const fractions: Record<ColumnWidth, number> = {
    '1/1': 1,
    '1/2': 0.5,
    '1/3': 0.333333,
    '2/3': 0.666667,
    '1/4': 0.25,
    '3/4': 0.75,
  };

  const fraction = fractions[width] || 1;
  const availableWidth = canvasWidth - (DEFAULT_PADDING * 2);

  return availableWidth * fraction - (gap / 2);
}

/**
 * Convert pixel width to closest column width fraction
 */
function pixelsToColumnWidth(pixels: number, canvasWidth: number): ColumnWidth {
  const availableWidth = canvasWidth - (DEFAULT_PADDING * 2);
  const fraction = pixels / availableWidth;

  // Find closest fraction
  const widths: [ColumnWidth, number][] = [
    ['1/1', 1],
    ['3/4', 0.75],
    ['2/3', 0.666667],
    ['1/2', 0.5],
    ['1/3', 0.333333],
    ['1/4', 0.25],
  ];

  let closest: ColumnWidth = '1/1';
  let minDiff = Infinity;

  for (const [width, value] of widths) {
    const diff = Math.abs(fraction - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = width;
    }
  }

  return closest;
}

/**
 * Convert row/column layout to absolute positioning
 *
 * @param rows - Array of row configurations
 * @param canvasWidth - Canvas width in pixels
 * @returns Array of canvas components with absolute positions
 */
export function rowColumnToAbsolute(
  rows: RowConfig[],
  canvasWidth: number = DEFAULT_CANVAS_WIDTH
): CanvasComponent[] {
  const components: CanvasComponent[] = [];
  let currentY = DEFAULT_PADDING;

  for (const row of rows) {
    let currentX = DEFAULT_PADDING;
    const rowHeight = parseInt(row.height || `${DEFAULT_COMPONENT_HEIGHT}px`) || DEFAULT_COMPONENT_HEIGHT;

    for (const column of row.columns) {
      if (column.component) {
        const width = columnWidthToPixels(column.width, canvasWidth, DEFAULT_GAP);

        components.push({
          id: `canvas-${column.id}`,
          x: currentX,
          y: currentY,
          width: width,
          height: rowHeight,
          component: column.component
        });

        currentX += width + DEFAULT_GAP;
      }
    }

    currentY += rowHeight + DEFAULT_GAP;
  }

  return components;
}

/**
 * Convert absolute positioning back to row/column layout
 *
 * Groups components by Y position (within tolerance) to form rows
 * Sorts components by X position to form columns
 *
 * @param components - Array of canvas components
 * @param canvasWidth - Canvas width in pixels
 * @returns Array of row configurations
 */
export function absoluteToRowColumn(
  components: CanvasComponent[],
  canvasWidth: number = DEFAULT_CANVAS_WIDTH
): RowConfig[] {
  if (components.length === 0) return [];

  // Group components by Y position (tolerance: 50px)
  const Y_TOLERANCE = 50;
  const rows: Map<number, CanvasComponent[]> = new Map();

  for (const comp of components) {
    let foundRow = false;

    // Find existing row with similar Y
    for (const [rowY, rowComps] of rows.entries()) {
      if (Math.abs(comp.y - rowY) < Y_TOLERANCE) {
        rowComps.push(comp);
        foundRow = true;
        break;
      }
    }

    // Create new row
    if (!foundRow) {
      rows.set(comp.y, [comp]);
    }
  }

  // Convert to RowConfig array
  const rowConfigs: RowConfig[] = [];

  // Sort rows by Y position
  const sortedRows = Array.from(rows.entries()).sort((a, b) => a[0] - b[0]);

  for (const [rowY, rowComps] of sortedRows) {
    // Sort components by X position
    rowComps.sort((a, b) => a.x - b.x);

    // Calculate row height (use max height in row)
    const maxHeight = Math.max(...rowComps.map(c => c.height));

    rowConfigs.push({
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      height: `${maxHeight}px`,
      columns: rowComps.map(comp => ({
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        width: pixelsToColumnWidth(comp.width, canvasWidth),
        component: comp.component
      }))
    });
  }

  return rowConfigs;
}

/**
 * Rescale canvas layout proportionally when canvas width changes
 *
 * @param components - Array of canvas components
 * @param oldWidth - Previous canvas width
 * @param newWidth - New canvas width
 * @returns Rescaled components
 */
export function rescaleLayout(
  components: CanvasComponent[],
  oldWidth: number,
  newWidth: number
): CanvasComponent[] {
  if (oldWidth === newWidth) return components;

  const scale = newWidth / oldWidth;

  return components.map(comp => ({
    ...comp,
    x: comp.x * scale,
    width: comp.width * scale,
    // Keep Y and height unchanged (vertical scroll is acceptable)
  }));
}

/**
 * Auto-layout components to prevent overlaps
 *
 * Arranges components in a grid pattern with configurable columns
 *
 * @param components - Array of canvas components
 * @param canvasWidth - Canvas width in pixels
 * @param componentsPerRow - Number of components per row (default: 2)
 * @returns Auto-laid-out components
 */
export function autoLayoutFromTemplate(
  components: CanvasComponent[],
  canvasWidth: number = DEFAULT_CANVAS_WIDTH,
  componentsPerRow: number = 2
): CanvasComponent[] {
  const gap = DEFAULT_GAP;
  const padding = DEFAULT_PADDING;
  const availableWidth = canvasWidth - (padding * 2) - (gap * (componentsPerRow - 1));
  const componentWidth = availableWidth / componentsPerRow;

  return components.map((comp, index) => {
    const col = index % componentsPerRow;
    const row = Math.floor(index / componentsPerRow);

    return {
      ...comp,
      x: padding + col * (componentWidth + gap),
      y: padding + row * (DEFAULT_COMPONENT_HEIGHT + gap),
      width: componentWidth,
      height: DEFAULT_COMPONENT_HEIGHT,
    };
  });
}

/**
 * Check if components overlap
 */
function componentsOverlap(a: AbsolutePosition, b: AbsolutePosition): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

/**
 * Detect overlapping components in canvas
 *
 * @param components - Array of canvas components
 * @returns Array of component ID pairs that overlap
 */
export function detectOverlaps(components: CanvasComponent[]): [string, string][] {
  const overlaps: [string, string][] = [];

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      if (componentsOverlap(components[i], components[j])) {
        overlaps.push([components[i].id, components[j].id]);
      }
    }
  }

  return overlaps;
}

/**
 * Find available space on canvas for new component
 *
 * @param components - Existing canvas components
 * @param width - Desired component width
 * @param height - Desired component height
 * @param canvasWidth - Canvas width
 * @returns Position {x, y} for new component
 */
export function findAvailableSpace(
  components: CanvasComponent[],
  width: number,
  height: number,
  canvasWidth: number = DEFAULT_CANVAS_WIDTH
): { x: number; y: number } {
  const gap = DEFAULT_GAP;
  const padding = DEFAULT_PADDING;

  // Start at top-left
  let x = padding;
  let y = padding;

  // Try positions in grid pattern
  while (true) {
    const candidate: AbsolutePosition = { x, y, width, height };

    // Check if this position overlaps with any existing component
    const hasOverlap = components.some(comp => componentsOverlap(candidate, comp));

    if (!hasOverlap) {
      return { x, y };
    }

    // Move to next position
    x += width + gap;

    // If we exceed canvas width, move to next row
    if (x + width > canvasWidth - padding) {
      x = padding;
      y += height + gap;
    }
  }
}
