/**
 * Dashboard CRUD API Routes
 *
 * GET /api/dashboards/[id] - Load dashboard by ID
 * PUT /api/dashboards/[id] - Save/update dashboard
 * DELETE /api/dashboards/[id] - Delete dashboard
 *
 * Connects to Supabase backend created by database-analytics-architect
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Load dashboard configuration
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Load dashboard
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', params.id)
      .eq('workspace_id', workspace.id)
      .single();

    if (dashboardError || !dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Transform database format to frontend format
    const config = {
      id: dashboard.id,
      title: dashboard.name,
      description: dashboard.description,
      rows: dashboard.config?.rows || dashboard.layout || [],
      theme: dashboard.config?.theme || {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb'
      },
      createdAt: dashboard.created_at,
      updatedAt: dashboard.updated_at
    };

    return NextResponse.json({
      success: true,
      dashboard: config
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Save/update dashboard configuration
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Missing config in request body' },
        { status: 400 }
      );
    }

    // Check if dashboard exists
    const { data: existing } = await supabase
      .from('dashboards')
      .select('id')
      .eq('id', params.id)
      .eq('workspace_id', workspace.id)
      .single();

    // Prepare dashboard data
    const dashboardData = {
      name: config.title || 'Untitled Dashboard',
      description: config.description || '',
      workspace_id: workspace.id,
      config: {
        rows: config.rows || [],
        theme: config.theme || {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          borderColor: '#e5e7eb'
        }
      },
      layout: config.rows || [], // Store in layout column for backward compatibility
      updated_at: new Date().toISOString()
    };

    let result;

    if (existing) {
      // Update existing dashboard
      const { data, error } = await supabase
        .from('dashboards')
        .update(dashboardData)
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    } else {
      // Create new dashboard
      const { data, error } = await supabase
        .from('dashboards')
        .insert([{
          id: params.id,
          ...dashboardData
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    }

    // Transform back to frontend format
    const savedConfig = {
      id: result.id,
      title: result.name,
      description: result.description,
      rows: result.config?.rows || result.layout || [],
      theme: result.config?.theme,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };

    return NextResponse.json({
      success: true,
      dashboard: savedConfig
    });

  } catch (error) {
    console.error('Error saving dashboard:', error);
    return NextResponse.json(
      {
        error: 'Failed to save dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete dashboard
 */
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete dashboard (RLS ensures it's in user's workspace)
    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Error deleting dashboard:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
