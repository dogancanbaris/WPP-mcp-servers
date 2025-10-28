/**
 * Dashboard Type Mappers
 *
 * Maps between Database schema and Application model
 * SINGLE SOURCE OF TRUTH for DB ↔ App conversions
 */

import type { DashboardConfig, RowConfig } from './dashboard-builder';

/**
 * Database schema (Supabase dashboards table)
 */
export interface DashboardDB {
  id: string;
  workspace_id: string;
  name: string;  // DB uses "name"
  description: string | null;
  bigquery_table: string | null; // Legacy field
  dataset_id: string | null; // NEW: Links to datasets table
  layout: any;  // JSONB - stores rows
  filters: any;  // JSONB
  config: any;  // JSONB - stores full DashboardConfig
  created_at: string;
  updated_at: string;
  last_viewed_at: string | null;
  view_count: number | null;
}

/**
 * Default theme configuration
 */
const defaultTheme = {
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderColor: '#e5e7eb'
};

/**
 * Convert Application model to Database format
 */
export function toDB(config: DashboardConfig): Partial<DashboardDB> {
  return {
    name: config.title || config.name || 'Untitled Dashboard',  // Map title → name
    description: config.description || null,
    dataset_id: config.dataset_id || null,  // Link to datasets table
    bigquery_table: config.datasource || null,  // Legacy field for backward compat
    layout: config.rows || [],  // Map rows → layout JSONB
    filters: {},  // Empty for now
    config: {
      // Store full config in JSONB for flexibility
      title: config.title || config.name,
      rows: config.rows,
      pages: config.pages,  // NEW - Multi-page dashboard support
      theme: config.theme,
      datasource: config.datasource,
      dataset_id: config.dataset_id,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }
  };
}

/**
 * Convert Database format to Application model
 */
export function fromDB(db: DashboardDB): DashboardConfig {
  // Prefer config.* (new format), fall back to direct fields (old format)
  const configData = db.config || {};

  return {
    id: db.id,
    name: db.name,  // Keep for compatibility
    title: configData.title || db.name || 'Untitled Dashboard',  // Map name → title
    description: db.description || configData.description || '',
    dataset_id: db.dataset_id || configData.dataset_id || undefined,  // Dataset link
    rows: configData.rows || db.layout || [],  // Map layout → rows (legacy)
    pages: configData.pages || undefined,  // NEW - Multi-page dashboard support
    datasource: configData.datasource || db.bigquery_table || '',  // Legacy field
    theme: configData.theme || defaultTheme,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
}

/**
 * Validate DashboardConfig before save
 */
export function validateDashboardConfig(config: Partial<DashboardConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.title && !config.name) {
    errors.push('Dashboard must have a title or name');
  }

  // Allow either rows (legacy) OR pages (new multi-page format)
  if (!config.rows && !config.pages) {
    errors.push('Dashboard must have either rows or pages array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
