#!/bin/bash
# Count MCP tools by API

echo "=== WPP MCP Tool Count ==="
echo ""

cd "$(dirname "$0")/.."

echo "Google Search Console:"
grep -c "export const.*Tool = {" src/gsc/tools/*.ts 2>/dev/null || echo "0"

echo "Chrome UX Report:"
grep -c "export const.*Tool = {" src/crux/tools.ts 2>/dev/null || echo "0"

echo "Google Ads:"
grep -c "export const.*Tool = {" src/ads/tools/*.ts 2>/dev/null || echo "0"

echo "Google Analytics:"
grep -c "export const.*Tool = {" src/analytics/tools/*.ts 2>/dev/null || echo "0"

echo "Google Business Profile:"
grep -c "export const.*Tool = {" src/business-profile/tools.ts 2>/dev/null || echo "0"

echo "BigQuery:"
grep -c "export const.*Tool = {" src/bigquery/tools.ts 2>/dev/null || echo "0"

echo "Bright Data SERP:"
grep -c "export const.*Tool = {" src/serp/tools.ts 2>/dev/null || echo "0"

echo ""
echo "Total Tools:"
find src -name "*.ts" -path "*/tools/*" -exec grep -h "export const.*Tool = {" {} \; | wc -l

echo ""
echo "Read vs Write:"
echo "  Read-only: $(grep -r "READ-ONLY\|read-only" src/*/tools/*.ts | wc -l)"
echo "  Write ops: $(grep -r "WRITE OPERATION" src/*/tools/*.ts | wc -l)"
