// Dashboard Service - CRUD operations for dashboards in Supabase
import { createClient } from './client';
import type { DashboardConfig } from '@/types/dashboard-builder';
import { toDB, fromDB, type DashboardDB } from '@/types/dashboard-mappers';
import { migrateDashboardConfig } from '@/lib/migrations/dashboard-migration';

/**
 * Save dashboard to Supabase
 * Creates new dashboard or updates existing one
 */
export async function saveDashboard(
  dashboardId: string,
  config: DashboardConfig
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

    // Convert app format to DB format using mapper
    const dbData = toDB(config);
    const dashboardData = {
      ...dbData,
      workspace_id: workspace.id,
      bigquery_table: config.datasource || null
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
        console.error('Supabase update error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: fromDB(data as DashboardDB) };
    } else {
      // Create new dashboard
      const { data, error } = await supabase
        .from('dashboards')
        .insert([{
          id: dashboardId,
          ...dashboardData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: fromDB(data as DashboardDB) };
    }
  } catch (error) {
    console.error('saveDashboard error:', error);
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
      console.error('Load dashboard error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Dashboard not found' };
    }

    // Convert DB format to app format using mapper
    const config = fromDB(data as DashboardDB);

    // Apply migration to ensure pages array exists and old dashboards are migrated
    const migratedConfig = migrateDashboardConfig(config);

    return { success: true, data: migratedConfig };
  } catch (error) {
    console.error('loadDashboard error:', error);
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

    // Convert all DB records to app format using mapper
    const dashboards: DashboardConfig[] = (data || []).map(d => fromDB(d as DashboardDB));

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
