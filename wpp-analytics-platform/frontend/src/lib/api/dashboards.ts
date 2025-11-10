/**
 * Dashboard API Client
 *
 * Provides typed functions for interacting with dashboard APIs:
 * - Field metadata from data sources
 * - Dashboard CRUD operations
 * - Query execution
 */

import type { DashboardConfig } from '@/types/dashboard-builder';

export interface Field {
  id: string;
  name: string;
  type: 'dimension' | 'metric';
  dataType?: string;
  description?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  fields: Field[];
  table?: string;
  projectId?: string;
  datasetId?: string;
  description?: string;
  shared?: boolean;
}

export interface FieldsResponse {
  sources: DataSource[];
}

export interface SaveDashboardResponse {
  success: boolean;
  dashboard?: DashboardConfig;
  error?: string;
}

export interface LoadDashboardResponse {
  success: boolean;
  dashboard?: DashboardConfig;
  error?: string;
}

/**
 * Fetch available fields from all data sources
 * Connects to /api/dashboards/fields endpoint created by backend-api-specialist
 */
export async function getAvailableFields(): Promise<FieldsResponse> {
  const res = await fetch('/api/dashboards/fields', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch fields: ${res.status} ${res.statusText}. ${errorText}`);
  }

  return res.json();
}

/**
 * Save dashboard configuration
 * Updates if exists, creates if new
 */
export async function saveDashboard(
  id: string,
  config: DashboardConfig
): Promise<SaveDashboardResponse> {
  const res = await fetch(`/api/dashboards/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ config }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      success: false,
      error: `Failed to save: ${res.status} ${res.statusText}. ${errorText}`,
    };
  }

  const data = await res.json();
  return {
    success: true,
    dashboard: data.dashboard,
  };
}

/**
 * Load dashboard configuration by ID
 */
export async function loadDashboard(id: string): Promise<LoadDashboardResponse> {
  const res = await fetch(`/api/dashboards/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      success: false,
      error: `Failed to load: ${res.status} ${res.statusText}. ${errorText}`,
    };
  }

  const data = await res.json();
  return {
    success: true,
    dashboard: data.dashboard,
  };
}

/**
 * Delete dashboard
 */
export async function deleteDashboard(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/dashboards/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      success: false,
      error: `Failed to delete: ${res.status} ${res.statusText}. ${errorText}`,
    };
  }

  return { success: true };
}

/**
 * List all dashboards for current user
 */
export async function listDashboards(): Promise<{
  success: boolean;
  dashboards?: DashboardConfig[];
  error?: string;
}> {
  const res = await fetch('/api/dashboards', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      success: false,
      error: `Failed to list: ${res.status} ${res.statusText}. ${errorText}`,
    };
  }

  const data = await res.json();
  return {
    success: true,
    dashboards: data.dashboards,
  };
}

/**
 * Execute a query against a data source
 * Returns chart data ready for visualization
 */
export async function executeQuery(params: {
  dataSource: string;
  dimensions: string[];
  metrics: string[];
  filters?: Record<string, unknown>[];
  dateRange?: { start: string; end: string };
  limit?: number;
}): Promise<{
  success: boolean;
  data?: Record<string, unknown>[];
  error?: string;
}> {
  const res = await fetch('/api/dashboards/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return {
      success: false,
      error: `Query failed: ${res.status} ${res.statusText}. ${errorText}`,
    };
  }

  const result = await res.json();
  return {
    success: true,
    data: result.data,
  };
}
