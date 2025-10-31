#!/bin/bash

echo "=== DETAILED CHECK: Tools with 'required' params ===" 
echo ""

check_file() {
  local file=$1
  echo "📄 $file"
  
  # Get all tool names
  grep -E "export const \w+Tool = \{" "$file" | sed 's/export const //;s/Tool = {//' | while read toolname; do
    # Check if this specific tool has required params
    if grep -A 20 "export const ${toolname}Tool" "$file" | grep -q "required: \["; then
      has_inject=$(grep -A 50 "export const ${toolname}Tool" "$file" | grep -c "injectGuidance\|formatDiscoveryResponse")
      required_line=$(grep -A 20 "export const ${toolname}Tool" "$file" | grep "required:" | head -1)
      
      if [ "$has_inject" -gt 0 ]; then
        echo "  ✅ $toolname - Transformed (has discovery) - $required_line"
      else
        echo "  ❌ $toolname - NOT transformed - $required_line"
      fi
    fi
  done
  echo ""
}

check_file "src/ads/tools/assets.ts"
check_file "src/serp/tools.ts"
check_file "src/wpp-analytics/tools/push-data-to-bigquery.ts"
check_file "src/wpp-analytics/tools/create-dashboard-from-table.ts"
check_file "src/wpp-analytics/tools/dashboards/update-dashboard.tool.ts"

