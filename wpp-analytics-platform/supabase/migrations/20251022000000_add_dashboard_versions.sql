-- Dashboard Version History System
-- Created: October 22, 2025
-- Purpose: Track all changes to dashboards with full snapshot history

-- ============================================================================
-- DASHBOARD VERSIONS TABLE
-- ============================================================================
-- Stores complete snapshots of dashboard state for version history
-- Enables time-travel, undo/redo, and visual diff comparison

CREATE TABLE dashboard_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to parent dashboard
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,

  -- Version metadata
  version_number INTEGER NOT NULL,  -- Sequential version (1, 2, 3, ...)

  -- Complete snapshot of dashboard state at this version
  snapshot JSONB NOT NULL,  -- Full dashboard config including layout, filters, etc.

  -- Change metadata
  change_summary TEXT,  -- Human-readable description of what changed
  change_type TEXT CHECK (change_type IN (
    'created',           -- Dashboard created
    'layout_modified',   -- Rows/columns changed
    'component_added',   -- Component added
    'component_removed', -- Component removed
    'component_updated', -- Component properties changed
    'style_changed',     -- Visual styling changed
    'filter_changed',    -- Filters modified
    'manual_save',       -- User explicitly saved
    'auto_save'          -- Automatic save
  )),

  -- User who made the change (optional for auto-saves)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Size tracking for storage optimization
  snapshot_size_bytes INTEGER,

  -- Unique constraint: one version number per dashboard
  UNIQUE(dashboard_id, version_number)
);

-- Enable RLS
ALTER TABLE dashboard_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view versions of dashboards in their workspace
CREATE POLICY "Users can view versions in own workspace"
  ON dashboard_versions FOR SELECT
  USING (
    dashboard_id IN (
      SELECT d.id
      FROM dashboards d
      JOIN workspaces w ON d.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Policy: Users can insert versions for dashboards in their workspace
CREATE POLICY "Users can insert versions in own workspace"
  ON dashboard_versions FOR INSERT
  WITH CHECK (
    dashboard_id IN (
      SELECT d.id
      FROM dashboards d
      JOIN workspaces w ON d.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Policy: Users can delete versions (for cleanup)
CREATE POLICY "Users can delete versions in own workspace"
  ON dashboard_versions FOR DELETE
  USING (
    dashboard_id IN (
      SELECT d.id
      FROM dashboards d
      JOIN workspaces w ON d.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary lookup: Get all versions for a dashboard
CREATE INDEX dashboard_versions_dashboard_id_idx ON dashboard_versions(dashboard_id, version_number DESC);

-- Timeline queries: Get recent versions across all dashboards
CREATE INDEX dashboard_versions_created_at_idx ON dashboard_versions(created_at DESC);

-- User activity tracking
CREATE INDEX dashboard_versions_created_by_idx ON dashboard_versions(created_by);

-- Change type filtering
CREATE INDEX dashboard_versions_change_type_idx ON dashboard_versions(change_type);

-- Size optimization queries
CREATE INDEX dashboard_versions_size_idx ON dashboard_versions(snapshot_size_bytes);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically create version on dashboard save
CREATE OR REPLACE FUNCTION create_dashboard_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
  snapshot_data JSONB;
  snapshot_bytes INTEGER;
  change_summary_text TEXT;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM dashboard_versions
  WHERE dashboard_id = NEW.id;

  -- Build snapshot (full dashboard state)
  snapshot_data := jsonb_build_object(
    'id', NEW.id,
    'name', NEW.name,
    'description', NEW.description,
    'bigquery_table', NEW.bigquery_table,
    'cube_model_name', NEW.cube_model_name,
    'layout', NEW.layout,
    'filters', NEW.filters,
    'config', NEW.config,
    'created_at', NEW.created_at,
    'updated_at', NEW.updated_at
  );

  -- Calculate snapshot size
  snapshot_bytes := length(snapshot_data::text);

  -- Generate change summary
  IF TG_OP = 'INSERT' THEN
    change_summary_text := 'Dashboard created';
  ELSE
    -- Detect what changed
    IF OLD.layout IS DISTINCT FROM NEW.layout THEN
      change_summary_text := 'Layout modified';
    ELSIF OLD.filters IS DISTINCT FROM NEW.filters THEN
      change_summary_text := 'Filters changed';
    ELSIF OLD.name IS DISTINCT FROM NEW.name THEN
      change_summary_text := 'Dashboard renamed';
    ELSE
      change_summary_text := 'Dashboard updated';
    END IF;
  END IF;

  -- Insert version
  INSERT INTO dashboard_versions (
    dashboard_id,
    version_number,
    snapshot,
    change_summary,
    change_type,
    created_by,
    snapshot_size_bytes
  ) VALUES (
    NEW.id,
    next_version,
    snapshot_data,
    change_summary_text,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      ELSE 'auto_save'
    END,
    auth.uid(),
    snapshot_bytes
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create version on dashboard insert/update
CREATE TRIGGER dashboard_auto_version
  AFTER INSERT OR UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION create_dashboard_version();

-- ============================================================================
-- VERSION CLEANUP FUNCTIONS
-- ============================================================================

-- Function to prune old versions (keep last N versions per dashboard)
CREATE OR REPLACE FUNCTION prune_old_versions(
  p_dashboard_id UUID,
  p_keep_count INTEGER DEFAULT 50
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH versions_to_keep AS (
    SELECT id
    FROM dashboard_versions
    WHERE dashboard_id = p_dashboard_id
    ORDER BY version_number DESC
    LIMIT p_keep_count
  )
  DELETE FROM dashboard_versions
  WHERE dashboard_id = p_dashboard_id
    AND id NOT IN (SELECT id FROM versions_to_keep)
  RETURNING 1 INTO deleted_count;

  RETURN COALESCE(deleted_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get version statistics for a dashboard
CREATE OR REPLACE FUNCTION get_version_stats(p_dashboard_id UUID)
RETURNS TABLE (
  total_versions INTEGER,
  oldest_version TIMESTAMPTZ,
  newest_version TIMESTAMPTZ,
  total_size_bytes BIGINT,
  avg_size_bytes NUMERIC,
  version_types JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    MIN(created_at),
    MAX(created_at),
    SUM(snapshot_size_bytes)::BIGINT,
    AVG(snapshot_size_bytes)::NUMERIC,
    jsonb_object_agg(
      change_type,
      count
    ) AS version_types
  FROM (
    SELECT
      created_at,
      snapshot_size_bytes,
      change_type,
      COUNT(*) OVER (PARTITION BY change_type) as count
    FROM dashboard_versions
    WHERE dashboard_id = p_dashboard_id
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS FOR CONVENIENCE
-- ============================================================================

-- View: Latest version for each dashboard
CREATE VIEW dashboard_latest_versions AS
SELECT DISTINCT ON (dashboard_id)
  dv.*,
  d.name as dashboard_name,
  d.workspace_id
FROM dashboard_versions dv
JOIN dashboards d ON dv.dashboard_id = d.id
ORDER BY dashboard_id, version_number DESC;

-- View: Version history with change details
CREATE VIEW dashboard_version_history AS
SELECT
  dv.id,
  dv.dashboard_id,
  dv.version_number,
  dv.change_summary,
  dv.change_type,
  dv.created_at,
  dv.snapshot_size_bytes,
  d.name as dashboard_name,
  u.email as created_by_email,
  -- Next version for diff comparison
  LEAD(dv.id) OVER (
    PARTITION BY dv.dashboard_id
    ORDER BY dv.version_number
  ) as next_version_id,
  -- Previous version for diff comparison
  LAG(dv.id) OVER (
    PARTITION BY dv.dashboard_id
    ORDER BY dv.version_number
  ) as previous_version_id
FROM dashboard_versions dv
JOIN dashboards d ON dv.dashboard_id = d.id
LEFT JOIN auth.users u ON dv.created_by = u.id
ORDER BY dv.dashboard_id, dv.version_number DESC;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE dashboard_versions IS 'Complete version history for all dashboard changes with full snapshots';
COMMENT ON COLUMN dashboard_versions.snapshot IS 'Full JSONB snapshot of dashboard state at this version';
COMMENT ON COLUMN dashboard_versions.version_number IS 'Sequential version number starting at 1';
COMMENT ON COLUMN dashboard_versions.change_type IS 'Category of change that triggered this version';
COMMENT ON COLUMN dashboard_versions.snapshot_size_bytes IS 'Size of snapshot for storage optimization';

COMMENT ON FUNCTION create_dashboard_version() IS 'Automatically creates version snapshot on dashboard save';
COMMENT ON FUNCTION prune_old_versions(UUID, INTEGER) IS 'Cleanup old versions, keeping last N versions';
COMMENT ON FUNCTION get_version_stats(UUID) IS 'Get statistics about version history for a dashboard';

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create versions for existing dashboards (if any)
DO $$
DECLARE
  dashboard_record RECORD;
BEGIN
  FOR dashboard_record IN
    SELECT * FROM dashboards
  LOOP
    -- Create initial version for existing dashboards
    PERFORM create_dashboard_version();
  END LOOP;
END $$;
