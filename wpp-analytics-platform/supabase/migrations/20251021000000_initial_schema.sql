-- WPP Analytics Platform - Initial Database Schema
-- Created: October 21, 2025
-- Purpose: Workspaces, Dashboards, Metadata Cache

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- WORKSPACES TABLE
-- ============================================================================
-- Each user gets one workspace for isolation
-- Workspace contains all their dashboards

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One workspace per user
  UNIQUE(user_id)
);

-- Add RLS (Row Level Security)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own workspace
CREATE POLICY "Users can view own workspace"
  ON workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workspace"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspace"
  ON workspaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspace"
  ON workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX workspaces_user_id_idx ON workspaces(user_id);

-- ============================================================================
-- DASHBOARDS TABLE
-- ============================================================================
-- Stores dashboard configurations

CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- BigQuery table reference
  bigquery_table TEXT NOT NULL,  -- e.g., 'mcp-servers-475317.wpp_marketing.gsc_performance_7days'

  -- Cube.js model reference
  cube_model_name TEXT,  -- e.g., 'GscPerformance7days'

  -- Dashboard layout (JSON array of chart configs)
  layout JSONB DEFAULT '[]'::jsonb,

  -- Global dashboard filters
  filters JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can access dashboards in their workspace
CREATE POLICY "Users can view dashboards in own workspace"
  ON dashboards FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert dashboards in own workspace"
  ON dashboards FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update dashboards in own workspace"
  ON dashboards FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete dashboards in own workspace"
  ON dashboards FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX dashboards_workspace_id_idx ON dashboards(workspace_id);
CREATE INDEX dashboards_created_at_idx ON dashboards(created_at DESC);

-- ============================================================================
-- TABLE METADATA CACHE
-- ============================================================================
-- Caches Gemini metadata + Cube.js model information
-- Shared across all users (no RLS needed)

CREATE TABLE table_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- BigQuery table reference
  project_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  table_id TEXT NOT NULL,

  -- Gemini metadata (raw response)
  gemini_metadata JSONB,
  gemini_generated_at TIMESTAMPTZ,

  -- Cube.js model information
  cube_model_path TEXT,  -- Path to Cube.js model file
  cube_model_name TEXT,  -- Model name (e.g., 'GscPerformance7days')

  -- Enhanced metadata (our intelligence)
  platform_metadata JSONB,  -- Format rules, sizing, visualization hints

  -- Cache control
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW(),
  refresh_interval_days INTEGER DEFAULT 30,

  -- Unique constraint
  UNIQUE(project_id, dataset_id, table_id)
);

-- No RLS (shared metadata across all users)

-- Indexes
CREATE INDEX table_metadata_lookup_idx ON table_metadata(project_id, dataset_id, table_id);
CREATE INDEX table_metadata_refreshed_idx ON table_metadata(last_refreshed_at);

-- ============================================================================
-- DASHBOARD TEMPLATES
-- ============================================================================
-- Pre-defined dashboard templates (GSC, Ads, Analytics)

CREATE TABLE dashboard_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,  -- e.g., 'gsc_standard', 'ads_performance'
  display_name TEXT NOT NULL,  -- e.g., 'GSC Performance Dashboard'
  description TEXT,
  platform TEXT NOT NULL,  -- 'google_search_console', 'google_ads', 'google_analytics'

  -- Template layout (default chart arrangement)
  layout JSONB NOT NULL,

  -- Required BigQuery table pattern
  required_table_pattern TEXT,  -- e.g., '*gsc_performance*'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS (templates are global)

-- Insert default templates
INSERT INTO dashboard_templates (name, display_name, description, platform, layout, required_table_pattern) VALUES
(
  'gsc_standard',
  'GSC Performance Dashboard',
  'Standard Google Search Console performance dashboard with KPIs, trends, and breakdowns',
  'google_search_console',
  '[
    {"type": "kpi", "measure": "clicks", "position": {"x": 0, "y": 0, "w": 3, "h": 2}},
    {"type": "kpi", "measure": "impressions", "position": {"x": 3, "y": 0, "w": 3, "h": 2}},
    {"type": "kpi", "measure": "avgCtr", "position": {"x": 6, "y": 0, "w": 3, "h": 2}},
    {"type": "kpi", "measure": "avgPosition", "position": {"x": 9, "y": 0, "w": 3, "h": 2}},
    {"type": "line", "measure": "clicks", "dimension": "date", "position": {"x": 0, "y": 2, "w": 12, "h": 6}},
    {"type": "pie", "measure": "clicks", "dimension": "device", "position": {"x": 0, "y": 8, "w": 6, "h": 6}},
    {"type": "bar", "measure": "clicks", "dimension": "country", "position": {"x": 6, "y": 8, "w": 6, "h": 6}},
    {"type": "table", "dimensions": ["query", "clicks", "impressions", "ctr", "position"], "position": {"x": 0, "y": 14, "w": 12, "h": 8}}
  ]'::jsonb,
  '*gsc_performance*'
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to auto-create workspace on first login
CREATE OR REPLACE FUNCTION create_workspace_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspaces (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Workspace'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create workspace when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_workspace_for_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on dashboards
CREATE TRIGGER dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Dashboard search
CREATE INDEX dashboards_name_search_idx ON dashboards USING gin(to_tsvector('english', name));
CREATE INDEX dashboards_description_search_idx ON dashboards USING gin(to_tsvector('english', description));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE workspaces IS 'User workspaces for dashboard isolation';
COMMENT ON TABLE dashboards IS 'Dashboard configurations and layouts';
COMMENT ON TABLE table_metadata IS 'Cached BigQuery table metadata from Gemini';
COMMENT ON TABLE dashboard_templates IS 'Pre-defined dashboard templates';

COMMENT ON COLUMN dashboards.layout IS 'JSON array of chart configurations with positioning';
COMMENT ON COLUMN dashboards.filters IS 'Global dashboard filters applied to all charts';
COMMENT ON COLUMN table_metadata.gemini_metadata IS 'Raw metadata from BigQuery Gemini API';
COMMENT ON COLUMN table_metadata.platform_metadata IS 'Enhanced metadata with formatting, sizing, visualization rules';
