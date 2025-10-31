#!/bin/bash

echo "=== TRANSFORMATION REVIEW SCRIPT ==="
echo ""

# Count tools by checking for injectGuidance usage (indicator of transformation)
echo "📊 Tools Using injectGuidance (Transformed):"
grep -r "injectGuidance" src/ --include="*.ts" | cut -d: -f1 | sort -u | wc -l

echo ""
echo "📊 Tools Using formatDiscoveryResponse (Interactive Discovery):"
grep -r "formatDiscoveryResponse" src/ --include="*.ts" | cut -d: -f1 | sort -u | wc -l

echo ""
echo "📋 Files Modified in Each Directory:"
echo "GSC tools:"
ls -la src/gsc/tools/*.ts | wc -l
grep -l "injectGuidance\|formatDiscoveryResponse" src/gsc/tools/*.ts 2>/dev/null | wc -l

echo ""
echo "Ads tools:"
find src/ads/tools -name "*.ts" -type f | wc -l
grep -rl "injectGuidance\|formatDiscoveryResponse" src/ads/tools/ 2>/dev/null | wc -l

echo ""
echo "Analytics tools:"
find src/analytics/tools -name "*.ts" -type f | wc -l
grep -rl "injectGuidance\|formatDiscoveryResponse" src/analytics/tools/ 2>/dev/null | wc -l

echo ""
echo "CrUX tools:"
grep -c "injectGuidance" src/crux/tools.ts

echo ""
echo "BigQuery tools:"
grep -c "injectGuidance" src/bigquery/tools.ts

echo ""
echo "SERP tools:"
grep -c "injectGuidance" src/serp/tools.ts

echo ""
echo "Business Profile tools:"
grep -c "injectGuidance" src/business-profile/tools.ts

echo ""
echo "WPP Analytics tools:"
find src/wpp-analytics/tools -name "*.ts" -type f | wc -l
grep -rl "injectGuidance\|formatDiscoveryResponse" src/wpp-analytics/tools/ 2>/dev/null | wc -l

echo ""
echo "=== Checking for required imports ==="
echo "Files missing injectGuidance import:"
for file in $(find src/ -name "*.tool.ts" -o -name "*tools.ts" | grep -v node_modules); do
  if grep -q "handler.*async" "$file" 2>/dev/null; then
    if ! grep -q "injectGuidance" "$file" 2>/dev/null; then
      echo "  ⚠️  $file"
    fi
  fi
done

echo ""
echo "=== Checking for minimal descriptions ==="
echo "Tools with multi-line descriptions (should be single line):"
grep -A 2 "description:" src/*/tools/*.ts src/*/tools/*/*.ts 2>/dev/null | grep -B 1 '^\s*`' | grep "description:" | wc -l

