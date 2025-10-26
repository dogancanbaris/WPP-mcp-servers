// Dashboard Service - CRUD operations for dashboards in Supabase
import { createClient } from './client';

export interface ChartConfig {
  id: string;
  type: 'kpi' | 'line' | 'bar' | 'pie' | 'table' | 'treemap' | 'sankey' | 'heatmap' | 'gauge' | 'area' | 'scatter' | 'funnel' | 'radar';
  measure: string;
  dimension?: string;
  title: string;
  size: { w: number; h: number };
}

export interface FilterConfig {
  field: string;
  operator: string;
  values: (string | number | boolean)[];
}

export interface DashboardConfig {
  id?: string;
  name: string;
  description?: string;
  datasource: string;
  charts: ChartConfig[];
  filters: FilterConfig[];
  layout?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Save dashboard to Supabase
 * Creates new dashboard or updates existing one
 */
export async function saveDashboard(
  dashboardId: string,
  config: Omit<DashboardConfig, 'id'>
): Promise<{ success: boolean; data?: DashboardConfig; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    // Check if dashboard exists
    const { data: existing } = await supabase
      .from('dashboards')
      .select('id')
      .eq('id', dashboardId)
      .eq('workspace_id', workspace.id)
      .single();

    const dashboardData = {
      name: config.name,
      description: config.description,
      workspace_id: workspace.id,
      bigquery_table: config.datasource,
      cube_model_name: config.datasource,
      layout: config.charts, // Store charts in layout column
      filters: config.filters || {},
      config: {
        datasource: config.datasource,
        charts: config.charts,
        filters: config.filters,
        layout: config.layout
      }
    };

    if (existing) {
      // Update existing dashboard
      const { data, error } = await supabase
        .from('dashboards')
        .update({
          ...dashboardData,
          updated_at: new Date().toISOString()
        })
        .eq('id', dashboardId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } else {
      // Create new dashboard
      const { data, error } = await supabase
        .from('dashboards')
        .insert([{
          id: dashboardId,
          ...dashboardData
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Load dashboard from Supabase
 */
export async function loadDashboard(
  dashboardId: string
): Promise<{ success: boolean; data?: DashboardConfig; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    // Load dashboard
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .eq('workspace_id', workspace.id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Dashboard not found' };
    }

    // Transform database format to DashboardConfig
    const config: DashboardConfig = {
      id: data.id,
      name: data.name,
      description: data.description,
      datasource: data.config.datasource,
      charts: data.config.charts,
      filters: data.config.filters || [],
      layout: data.config.layout,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return { success: true, data: config };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * List all dashboards for current user
 */
export async function listDashboards(): Promise<{
  success: boolean;
  data?: DashboardConfig[];
  error?: string
}> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return { success: false, error: 'Workspace not found' };
    }

    // List dashboards
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform to DashboardConfig[]
    const dashboards: DashboardConfig[] = (data || []).map(d => {
      const datasource = d.config?.datasource || d.bigquery_table || d.cube_model_name || '';
      const filters = d.config?.filters || d.filters || [];

      // Extract charts from layout array
      // Layout structure: array of rows, each row has columns, each column has a component
      let charts: ChartConfig[] = [];

      if (Array.isArray(d.layout)) {
        // Flatten row/column structure to extract individual chart components
        d.layout.forEach((row: any) => {
          if (row.columns && Array.isArray(row.columns)) {
            row.columns.forEach((col: any) => {
              if (col.component && col.component.type) {
                // Convert component to ChartConfig format
                // Map 'scorecard' type to 'kpi' for TypeScript compatibility
                const componentType = col.component.type === 'scorecard' ? 'kpi' : col.component.type;

                charts.push({
                  id: col.id || crypto.randomUUID(),
                  type: componentType,
                  measure: col.component.measure || '',
                  dimension: col.component.dimension,
                  title: col.component.title || '',
                  size: { w: 6, h: 4 } // Default size
                });
              }
            });
          }
        });
      } else if (d.config?.charts && Array.isArray(d.config.charts)) {
        // Fallback to flat charts array
        charts = d.config.charts;
      }

      return {
        id: d.id,
        name: d.name,
        description: d.description,
        datasource: datasource,
        charts: charts,
        filters: Array.isArray(filters) ? filters : [],
        layout: d.config?.layout || d.layout,
        created_at: d.created_at,
        updated_at: d.updated_at
      };
    });

    return { success: true, data: dashboards };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete dashboard
 */
export async function deleteDashboard(
  dashboardId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delete dashboard (RLS will ensure it's in user's workspace)
    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', dashboardId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
