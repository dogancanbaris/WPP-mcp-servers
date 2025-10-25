#!/bin/bash

# Create a temporary directory for backups
BACKUP_DIR="/tmp/chart-backups-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

CHARTS_DIR="/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/src/components/dashboard-builder/charts"

# List of chart files to process
CHARTS=(
  "PieChart.tsx"
  "TableChart.tsx"
  "Scorecard.tsx"
  "GaugeChart.tsx"
  "TreemapChart.tsx"
  "AreaChart.tsx"
  "ScatterChart.tsx"
  "HeatmapChart.tsx"
  "FunnelChart.tsx"
  "RadarChart.tsx"
)

echo "Starting cleanup of chart files..."
echo "Backup directory: $BACKUP_DIR"

for chart in "${CHARTS[@]}"; do
  FILE="$CHARTS_DIR/$chart"
  if [ -f "$FILE" ]; then
    echo "Processing $chart..."
    # Create backup
    cp "$FILE" "$BACKUP_DIR/$chart"
    echo "  - Backed up to $BACKUP_DIR/$chart"
  else
    echo "  - File not found: $FILE"
  fi
done

echo "Backups complete. Now cleaning up charts..."