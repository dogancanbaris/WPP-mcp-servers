/**
 * Page Configuration Types
 *
 * Defines the multi-page dashboard system that enables:
 * - Organizing complex dashboards (10+ components) into logical pages
 * - 2-level filter cascade: Page → Component (each can override parent)
 * - 2-level style cascade: Page Styles → Component Styles
 */

import { RowConfig, FilterConfig, DateRangeConfig } from './dashboard-builder';

/**
 * Page-level style overrides
 * These styles apply to all components within a page unless overridden at component level
 */
export interface PageStyles {
  backgroundColor?: string;
  padding?: number;
  gap?: number;
}

/**
 * Page Configuration
 * Represents a single page within a multi-page dashboard
 */
export interface PageConfig {
  /** Unique identifier for the page */
  id: string;

  /** Display name for the page (shown in page tabs) */
  name: string;

  /** Sort order for pages (0, 1, 2...) */
  order: number;

  /**
   * Page-level filter overrides (optional)
   * If set, these filters apply to all components on this page unless component overrides
   */
  filters?: FilterConfig[];

  /**
   * Page-level date range override (optional)
   * If set, this date range applies to all components on this page unless component overrides
   */
  dateRange?: DateRangeConfig;

  /**
   * Page-level style overrides (optional)
   * If set, these styles apply to all components on this page unless component overrides
   */
  pageStyles?: PageStyles;

  /**
   * Layout for this specific page
   * Standard row-based layout (rows → columns → components)
   */
  rows: RowConfig[];

  /** Timestamp when page was created */
  createdAt?: string;

  /** Timestamp when page was last updated */
  updatedAt?: string;
}
