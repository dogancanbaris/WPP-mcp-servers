#!/bin/bash

echo "=== CHECKING SPECIFIC TOOLS FROM HANDOVER DOC ==="
echo ""

# Batch 1: Google Ads Simple READ (7 tools)
echo "📦 BATCH 1 - Google Ads Simple READ (7 tools):"
echo "1. get_keyword_performance:" && grep -q "formatDiscoveryResponse" src/ads/tools/reporting/get-keyword-performance.tool.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "2. generate_keyword_ideas:" && grep -q "formatDiscoveryResponse" src/ads/tools/keyword-planning.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "3. list_bidding_strategies:" && grep -q "formatDiscoveryResponse" src/ads/tools/bidding.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "4. list_ad_extensions:" && grep -q "formatDiscoveryResponse" src/ads/tools/extensions.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "5. list_user_lists:" && grep -q "formatDiscoveryResponse" src/ads/tools/audiences.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "6. list_conversion_actions:" && grep -q "formatDiscoveryResponse" src/ads/tools/conversions.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "7. get_conversion_action:" && grep -q "formatDiscoveryResponse" src/ads/tools/conversions.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"

echo ""
echo "📦 BATCH 5 - SERP Tool:"
echo "1. search_google:" && grep -q "injectGuidance" src/serp/tools.ts && echo "  ✅ Transformed" || echo "  ❌ MISSING"

echo ""
echo "📦 BATCH 10 - WPP Analytics (Should have 2/5):"
echo "1. delete_dashboard:" && grep -q "formatDiscoveryResponse" src/wpp-analytics/tools/dashboards/delete-dashboard.tool.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "2. analyze_gsc_data_for_insights:" && grep -q "formatDiscoveryResponse" src/wpp-analytics/tools/analyze-data-insights.ts && echo "  ✅ Transformed" || echo "  ❌ Missing"
echo "3. update_dashboard_layout:" && grep -q "formatDiscoveryResponse" src/wpp-analytics/tools/dashboards/update-dashboard.tool.ts && echo "  ⚠️  Should be missing" || echo "  ❓ Check status"
echo "4. create_dashboard_from_table:" && grep -q "formatDiscoveryResponse" src/wpp-analytics/tools/create-dashboard-from-table.ts && echo "  ⚠️  Should be missing" || echo "  ❓ Check status"
echo "5. push_platform_data_to_bigquery:" && grep -q "formatDiscoveryResponse" src/wpp-analytics/tools/push-data-to-bigquery.ts && echo "  ⚠️  Should be missing" || echo "  ❓ Check status"

echo ""
echo "=== SUMMARY OF REQUIRED PARAMS ==="
echo "Tools with required: [] (discovery enabled):"
grep -r "required: \[\]" src/ --include="*.ts" | wc -l

echo ""
echo "Tools still with required params (may need fixing):"
grep -r "required: \[" src/ --include="*.ts" | grep -v "required: \[\]" | grep -v "node_modules" | cut -d: -f1 | sort -u

