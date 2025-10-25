// Dashboard Sharing Service
import { createClient } from './client';

export interface Share {
  id: string;
  dashboard_id: string;
  shared_by: string;
  shared_with: string | null; // null = public
  permission: 'view' | 'edit';
  created_at: string;
  expires_at?: string;
}

/**
 * Share dashboard with specific user
 */
export async function shareDashboard(
  dashboardId: string,
  email: string,
  permission: 'view' | 'edit' = 'view'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Get user by email
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!users) {
      return { success: false, error: 'User not found' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Create share
    const { error } = await supabase
      .from('dashboard_shares')
      .insert({
        dashboard_id: dashboardId,
        shared_by: user.id,
        shared_with: users.id,
        permission
      });

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

/**
 * Make dashboard public
 */
export async function makeDashboardPublic(
  dashboardId: string,
  permission: 'view' | 'edit' = 'view'
): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Create public share
    const { error } = await supabase
      .from('dashboard_shares')
      .insert({
        dashboard_id: dashboardId,
        shared_by: user.id,
        shared_with: null, // null = public
        permission
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const shareUrl = `${window.location.origin}/shared/${dashboardId}`;

    return { success: true, shareUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * List shares for a dashboard
 */
export async function listShares(
  dashboardId: string
): Promise<{ success: boolean; data?: Share[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('dashboard_shares')
      .select('*')
      .eq('dashboard_id', dashboardId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Share[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Remove share
 */
export async function removeShare(
  shareId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('dashboard_shares')
      .delete()
      .eq('id', shareId);

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
