#!/bin/bash

echo "=== AGENT OUTPUT SUMMARY ==="
echo ""

echo "📁 NEW DIRECTORIES CREATED:"
ls -ld src/ads/tools/ad-groups 2>/dev/null && echo "  ✅ ad-groups/" || echo "  ❌ ad-groups/"
ls -ld src/ads/tools/ads 2>/dev/null && echo "  ✅ ads/" || echo "  ❌ ads/"
ls -ld src/ads/tools/extensions 2>/dev/null && echo "  ✅ extensions/" || echo "  ❌ extensions/"
ls -ld src/ads/tools/targeting 2>/dev/null && echo "  ✅ targeting/" || echo "  ❌ targeting/"
ls -ld src/ads/tools/bid-modifiers 2>/dev/null && echo "  ✅ bid-modifiers/" || echo "  ❌ bid-modifiers/"

echo ""
echo "📊 NEW FILES CREATED:"
find src/ads/tools -name "*.tool.ts" -newer src/ads/tools/index.ts 2>/dev/null | wc -l | xargs echo "  Tool files:"
find src/ads/tools -name "*.ts" -newer src/ads/tools/budgets.ts 2>/dev/null | wc -l | xargs echo "  Total new TS files:"

echo ""
echo "📈 TOOLS PER CATEGORY:"
echo "  Ad Groups:" && ls src/ads/tools/ad-groups/*.tool.ts 2>/dev/null | wc -l
echo "  Ads:" && ls src/ads/tools/ads/*.tool.ts 2>/dev/null | wc -l
echo "  Extensions:" && ls src/ads/tools/extensions/*.tool.ts 2>/dev/null | wc -l
echo "  Targeting:" && ls src/ads/tools/targeting/*.tool.ts 2>/dev/null | wc -l
echo "  Bid Modifiers:" && ls src/ads/tools/bid-modifiers/*.tool.ts 2>/dev/null | wc -l
echo "  Labels:" && grep -c "export const.*LabelTool" src/ads/tools/labels.ts 2>/dev/null || echo "0"

echo ""
echo "🔧 BUILD STATUS:"
npm run build > /tmp/build.log 2>&1
ERROR_COUNT=$(grep -c "error TS" /tmp/build.log)
echo "  TypeScript Errors: $ERROR_COUNT"

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo ""
  echo "📋 ERROR CATEGORIES:"
  grep "error TS" /tmp/build.log | cut -d'(' -f2 | cut -d')' -f1 | sort | uniq -c | head -10
fi

