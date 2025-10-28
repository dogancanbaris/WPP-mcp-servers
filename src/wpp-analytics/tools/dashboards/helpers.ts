/**
 * Helper Functions for Dashboard Management
 *
 * Utility functions used across dashboard tools.
 */

import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { RowConfigInput, RowConfig } from './types.js';

/**
 * Generate unique ID
 */
export function generateId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Generate dashboard ID (UUID format)
 */
export function generateDashboardId(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Initialize Supabase client
 */
export function initSupabase(url: string, key: string) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Initialize Supabase client from environment variables
 * Used in production where agents don't have access to credentials
 */
export function initSupabaseFromEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Get or create workspace
 */
export async function getOrCreateWorkspace(
  supabase: any,
  workspaceId?: string
): Promise<string> {
  if (workspaceId) {
    return workspaceId;
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated. Please provide workspaceId.');
  }

  // Get user's workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (workspaceError || !workspace) {
    throw new Error('Workspace not found. Please provide workspaceId.');
  }

  return workspace.id;
}

/**
 * Process layout and assign IDs
 */
export function processLayout(rows: RowConfigInput[]): RowConfig[] {
  return rows.map(row => ({
    id: generateId(),
    columns: row.columns.map(col => ({
      id: generateId(),
      width: col.width,
      component: col.component,
    })),
  }));
}
