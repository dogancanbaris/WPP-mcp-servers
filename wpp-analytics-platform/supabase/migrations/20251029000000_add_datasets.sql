-- Datasets Registry for Shareable BigQuery Tables
-- Created: October 29, 2025
-- Purpose: Enable table sharing across dashboards and track BigQuery data sources

-- ============================================================================
-- DATASETS TABLE
-- ============================================================================
-- Central registry for BigQuery tables that can be shared across dashboards
-- Enables:
-- - Table reuse (multiple dashboards querying same BigQuery table)
-- - Workspace isolation (multi-tenancy)
-- - Data lineage tracking
-- - Refresh scheduling

CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Workspace ownership (multi-tenancy)
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  -- Dataset metadata
  name TEXT NOT NULL,  -- Human-readable name (e.g., "GSC Data - themindfulsteward.com")
  description TEXT,    -- Optional description

  -- BigQuery connection details
  bigquery_project_id TEXT NOT NULL,   -- GCP project ID
  bigquery_dataset_id TEXT NOT NULL,   -- BigQuery dataset (e.g., "wpp_marketing")
  bigquery_table_id TEXT NOT NULL,     -- BigQuery table name

  -- Platform-specific metadata
  platform_metadata JSONB DEFAULT '{}'::jsonb,  -- Stores: { platform: "gsc", property: "sc-domain:example.com" }

  -- Refresh configuration
  refresh_interval_days INTEGER DEFAULT 1,  -- How often to refresh data
  last_refreshed_at TIMESTAMPTZ,           -- Last successful refresh
  next_refresh_at TIMESTAMPTZ,             -- Scheduled next refresh

  -- Row tracking
  estimated_row_count BIGINT,  -- Approximate rows in BigQuery table
  data_freshness_days INTEGER, -- How many days of data available

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: One dataset per BigQuery table per workspace
  -- This ensures we don't create duplicate registrations
  UNIQUE(workspace_id, bigquery_project_id, bigquery_dataset_id, bigquery_table_id)
);

-- Enable RLS for workspace isolation
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view datasets in their own workspaces
CREATE POLICY "Users can view datasets in own workspace"
  ON datasets FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert datasets in their own workspaces
CREATE POLICY "Users can insert datasets in own workspace"
  ON datasets FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update datasets in their own workspaces
CREATE POLICY "Users can update datasets in own workspace"
  ON datasets FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete datasets in their own workspaces
CREATE POLICY "Users can delete datasets in own workspace"
  ON datasets FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATE DASHBOARDS TABLE
-- ============================================================================
-- Add dataset_id reference to link dashboards to shareable datasets

ALTER TABLE dashboards ADD COLUMN dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL;

-- Index for quick dataset → dashboards lookup
CREATE INDEX dashboards_dataset_id_idx ON dashboards(dataset_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary lookup: Find datasets by workspace
CREATE INDEX datasets_workspace_id_idx ON datasets(workspace_id);

-- BigQuery table lookup: Find existing dataset for a BigQuery table
CREATE INDEX datasets_bigquery_table_idx ON datasets(bigquery_project_id, bigquery_dataset_id, bigquery_table_id);

-- Platform filtering: Find all GSC datasets
CREATE INDEX datasets_platform_idx ON datasets((platform_metadata->>'platform'));

-- Property filtering: Find datasets for specific property
CREATE INDEX datasets_property_idx ON datasets((platform_metadata->>'property'));

-- Refresh scheduling: Find datasets due for refresh
CREATE INDEX datasets_next_refresh_idx ON datasets(next_refresh_at) WHERE next_refresh_at IS NOT NULL;

-- Freshness tracking
CREATE INDEX datasets_last_refreshed_idx ON datasets(last_refreshed_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp on changes
CREATE OR REPLACE FUNCTION update_dataset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER dataset_updated_at
  BEFORE UPDATE ON datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_dataset_updated_at();

-- Function: Find or create dataset
-- This is the core function for table sharing
CREATE OR REPLACE FUNCTION find_or_create_dataset(
  p_workspace_id UUID,
  p_name TEXT,
  p_bigquery_project_id TEXT,
  p_bigquery_dataset_id TEXT,
  p_bigquery_table_id TEXT,
  p_platform_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_dataset_id UUID;
BEGIN
  -- Try to find existing dataset
  SELECT id INTO v_dataset_id
  FROM datasets
  WHERE workspace_id = p_workspace_id
    AND bigquery_project_id = p_bigquery_project_id
    AND bigquery_dataset_id = p_bigquery_dataset_id
    AND bigquery_table_id = p_bigquery_table_id
  LIMIT 1;

  -- If not found, create new dataset
  IF v_dataset_id IS NULL THEN
    INSERT INTO datasets (
      workspace_id,
      name,
      bigquery_project_id,
      bigquery_dataset_id,
      bigquery_table_id,
      platform_metadata
    ) VALUES (
      p_workspace_id,
      p_name,
      p_bigquery_project_id,
      p_bigquery_dataset_id,
      p_bigquery_table_id,
      p_platform_metadata
    )
    RETURNING id INTO v_dataset_id;
  END IF;

  RETURN v_dataset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get dashboards using a dataset
CREATE OR REPLACE FUNCTION get_dataset_dashboards(p_dataset_id UUID)
RETURNS TABLE (
  dashboard_id UUID,
  dashboard_name TEXT,
  created_at TIMESTAMPTZ,
  component_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.created_at,
    (
      SELECT COUNT(*)::INTEGER
      FROM jsonb_array_elements(
        COALESCE(d.config->'pages', '[]'::jsonb)
      ) page,
      jsonb_array_elements(
        COALESCE(page->'rows', '[]'::jsonb)
      ) row_data,
      jsonb_array_elements(
        COALESCE(row_data->'columns', '[]'::jsonb)
      ) column_data
      WHERE column_data->>'type' IS NOT NULL
    ) as component_count
  FROM dashboards d
  WHERE d.dataset_id = p_dataset_id
  ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS FOR CONVENIENCE
-- ============================================================================

-- View: Dataset summary with dashboard count
CREATE VIEW dataset_summary AS
SELECT
  d.id,
  d.workspace_id,
  d.name,
  d.bigquery_table_id,
  d.platform_metadata->>'platform' as platform,
  d.platform_metadata->>'property' as property,
  d.last_refreshed_at,
  d.estimated_row_count,
  COUNT(DISTINCT dash.id) as dashboard_count,
  d.created_at,
  d.updated_at
FROM datasets d
LEFT JOIN dashboards dash ON dash.dataset_id = d.id
GROUP BY d.id;

-- View: Datasets needing refresh
CREATE VIEW datasets_needing_refresh AS
SELECT
  d.*,
  w.user_id,
  EXTRACT(EPOCH FROM (NOW() - d.last_refreshed_at)) / 86400 as days_since_refresh
FROM datasets d
JOIN workspaces w ON d.workspace_id = w.id
WHERE d.next_refresh_at <= NOW()
  OR (d.last_refreshed_at IS NULL AND d.created_at < NOW() - INTERVAL '1 day')
ORDER BY d.next_refresh_at ASC NULLS FIRST;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE datasets IS 'Registry of shareable BigQuery tables for dashboards with workspace isolation';
COMMENT ON COLUMN datasets.workspace_id IS 'Workspace that owns this dataset (for multi-tenancy)';
COMMENT ON COLUMN datasets.bigquery_table_id IS 'BigQuery table name (e.g., gsc_performance_shared)';
COMMENT ON COLUMN datasets.platform_metadata IS 'Platform-specific config (e.g., {"platform": "gsc", "property": "sc-domain:example.com"})';
COMMENT ON COLUMN datasets.refresh_interval_days IS 'How often data should be refreshed (in days)';

COMMENT ON FUNCTION find_or_create_dataset(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) IS 'Find existing dataset or create new one (prevents duplicates)';
COMMENT ON FUNCTION get_dataset_dashboards(UUID) IS 'Get all dashboards using a specific dataset';

COMMENT ON VIEW dataset_summary IS 'Summary view with dashboard count per dataset';
COMMENT ON VIEW datasets_needing_refresh IS 'Datasets that need data refresh based on schedule';

-- ============================================================================
-- MIGRATE EXISTING DASHBOARDS
-- ============================================================================
-- Create dataset entries for existing dashboards with bigquery_table

DO $$
DECLARE
  dashboard_record RECORD;
  v_dataset_id UUID;
  v_project_id TEXT;
  v_dataset_id_bq TEXT;
  v_table_parts TEXT[];
BEGIN
  -- Default GCP project (adjust if needed)
  v_project_id := 'mcp-servers-475317';
  v_dataset_id_bq := 'wpp_marketing';

  FOR dashboard_record IN
    SELECT * FROM dashboards WHERE bigquery_table IS NOT NULL AND dataset_id IS NULL
  LOOP
    -- Parse table name to extract components
    -- Format could be: gsc_property_timestamp OR gsc_performance_shared
    v_table_parts := regexp_split_to_array(dashboard_record.bigquery_table, '_');

    -- Create or find dataset
    v_dataset_id := find_or_create_dataset(
      dashboard_record.workspace_id,
      dashboard_record.name || ' - Dataset',
      v_project_id,
      v_dataset_id_bq,
      dashboard_record.bigquery_table,
      jsonb_build_object(
        'platform', v_table_parts[1],  -- e.g., 'gsc'
        'property', 'auto-created'
      )
    );

    -- Link dashboard to dataset
    UPDATE dashboards
    SET dataset_id = v_dataset_id
    WHERE id = dashboard_record.id;

    RAISE NOTICE 'Migrated dashboard % to dataset %', dashboard_record.id, v_dataset_id;
  END LOOP;
END $$;
