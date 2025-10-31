-- Add config column for multi-page dashboard architecture
-- Created: October 30, 2025
-- Purpose: Support modern dashboard configuration format with pages array

-- Add config column to dashboards table
ALTER TABLE dashboards ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN dashboards.config IS 'Modern dashboard configuration with pages, theme, and settings. Replaces legacy layout field.';

-- Create GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS dashboards_config_idx ON dashboards USING gin(config);

-- Migrate existing dashboards: populate config from layout
UPDATE dashboards
SET config = jsonb_build_object(
  'rows', COALESCE(layout, '[]'::jsonb),
  'pages', '[]'::jsonb,
  'theme', jsonb_build_object(
    'primaryColor', '#191D63',
    'backgroundColor', '#ffffff',
    'textColor', '#1f2937',
    'borderColor', '#e5e7eb'
  ),
  'datasource', bigquery_table
)
WHERE config = '{}'::jsonb OR config IS NULL;
