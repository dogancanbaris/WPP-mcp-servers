-- Add dashboard sharing functionality
-- Allows users to share dashboards with specific users or publicly

-- Dashboard shares table
CREATE TABLE IF NOT EXISTS dashboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  shared_with UUID REFERENCES auth.users(id), -- NULL for public shares
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(dashboard_id, shared_with)
);

-- Enable RLS
ALTER TABLE dashboard_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view shares for dashboards they own or are shared with"
  ON dashboard_shares FOR SELECT
  USING (
    shared_by = auth.uid() OR
    shared_with = auth.uid() OR
    (shared_with IS NULL AND dashboard_id IN (
      SELECT id FROM dashboards WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Dashboard owners can create shares"
  ON dashboard_shares FOR INSERT
  WITH CHECK (
    dashboard_id IN (
      SELECT id FROM dashboards WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Share creators can delete their shares"
  ON dashboard_shares FOR DELETE
  USING (shared_by = auth.uid());

-- Update dashboards RLS to include shared dashboards
DROP POLICY IF EXISTS "Users can view dashboards in own workspace" ON dashboards;

CREATE POLICY "Users can view own or shared dashboards"
  ON dashboards FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    ) OR
    id IN (
      SELECT dashboard_id FROM dashboard_shares
      WHERE shared_with = auth.uid() OR shared_with IS NULL
    )
  );

-- Add indexes for performance
CREATE INDEX idx_dashboard_shares_dashboard_id ON dashboard_shares(dashboard_id);
CREATE INDEX idx_dashboard_shares_shared_with ON dashboard_shares(shared_with);
CREATE INDEX idx_dashboard_shares_shared_by ON dashboard_shares(shared_by);
