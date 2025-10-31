#!/bin/bash

echo "=== FINAL COMPREHENSIVE REVIEW ==="
echo ""

echo "🔍 ISSUE 1: search_google (SERP)"
echo "Status: Has discovery logic BUT missing injectGuidance import"
grep -n "import.*injectGuidance" src/serp/tools.ts || echo "  ❌ Missing import"
grep -n "return {" src/serp/tools.ts | head -2
echo ""

echo "🔍 ISSUE 2: Tools with required params (should be required: [])"
echo "Files that need schema update:"
for file in src/wpp-analytics/tools/push-data-to-bigquery.ts src/wpp-analytics/tools/create-dashboard-from-table.ts src/wpp-analytics/tools/dashboards/update-dashboard.tool.ts; do
  if [ -f "$file" ]; then
    echo "  📄 $file"
    grep -A 1 "required:" "$file" | head -2
  fi
done

echo ""
echo "🔍 ISSUE 3: Tools that may have been partially transformed"
echo "Checking if tools have guidance but wrong return format..."
grep -l "guidanceText\|guidance" src/serp/tools.ts src/wpp-analytics/tools/*.ts 2>/dev/null | while read file; do
  if ! grep -q "inject Guidance" "$file"; then
    echo "  ⚠️  $file has guidance text but not using injectGuidance()"
  fi
done

echo ""
echo "=== TRANSFORMATION STATUS BY ORIGINAL PLAN ==="
echo ""
echo "📦 Batch 1: Google Ads Simple READ (7/7) ✅"
echo "📦 Batch 2: GSC + Business Profile (6/6) ✅"
echo "📦 Batch 3: Analytics (8/8) ✅"
echo "📦 Batch 4: CrUX (5/5) ✅"
echo "📦 Batch 5: BigQuery + SERP + Business (3/4) ⚠️"
echo "  - BigQuery tools: ✅"
echo "  - Business Profile: ✅"
echo "  - SERP (search_google): ❌ INCOMPLETE - has discovery but missing injectGuidance"
echo ""
echo "📦 Batch 6: Ads WRITE Budgets/Campaigns (4/4) ✅"
echo "📦 Batch 7: Ads WRITE Keywords/Conversions (6/6) ✅"
echo "📦 Batch 8: Ads Audiences (1/1) ✅"
echo "📦 Batch 9: WPP Analytics Dashboard (5/5) ✅"
echo "📦 Batch 10: WPP Analytics WRITE (2/5) ⚠️"
echo "  - delete_dashboard: ✅"
echo "  - analyze_gsc_data: ✅"
echo "  - update_dashboard_layout: ❌ NOT STARTED"
echo "  - create_dashboard_from_table: ❌ NOT STARTED"
echo "  - push_platform_data_to_bigquery: ❌ NOT STARTED"
echo ""
echo "=== TOTAL: 47/51 tools fully complete (92%) ==="
echo "=== 1 tool incomplete (search_google) ==="
echo "=== 3 tools not started (Batch 10 remainder) ==="

