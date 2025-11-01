#!/bin/bash

echo "=== PHASE 1: FIX ALL 22 ERRORS (5 MIN) ==="
echo ""

echo "🔧 Fix 1: keywords.ts - Undo _metrics prefix"
sed -i 's/const _metrics =/const metrics =/g' src/ads/tools/keywords.ts
echo "  ✅ keywords.ts: _metrics → metrics"

echo ""
echo "🔧 Fix 2: bidding.ts - Undo _result and _targetMicros prefixes"
sed -i 's/const _result =/const result =/g' src/ads/tools/bidding.ts
sed -i 's/const _targetMicros =/const targetMicros =/g' src/ads/tools/bidding.ts
echo "  ✅ bidding.ts: _result → result, _targetMicros → targetMicros"

echo ""
echo "🔧 Fix 3: labels.ts - Actually remove unused results"
# These are truly unused, so just remove the variable capture
sed -i 's/const result = await client/await client/g' src/ads/tools/labels.ts
echo "  ✅ labels.ts: Removed unused result variables"

echo ""
echo "🔧 Fix 4: update-ad-group-bid-modifier.tool.ts - Remove unused imports and fix variable"
sed -i 's/, formatNumber//' src/ads/tools/ad-groups/update-ad-group-bid-modifier.tool.ts
sed -i 's/, formatPercentageChange//' src/ads/tools/ad-groups/update-ad-group-bid-modifier.tool.ts
sed -i 's/const _newBidMicros =/const newBidMicros =/g' src/ads/tools/ad-groups/update-ad-group-bid-modifier.tool.ts
echo "  ✅ update-ad-group-bid-modifier.tool.ts: Cleaned imports, fixed newBidMicros"

echo ""
echo "🔧 Fix 5: dry-run-builder.ts - Prefix unused operation"
sed -i 's/const { operation }/const { operation: _operation }/' src/shared/dry-run-builder.ts
echo "  ✅ dry-run-builder.ts: operation → _operation"

echo ""
echo "🧪 VERIFICATION: Running build..."
npm run build > /tmp/phase1-final.log 2>&1
ERROR_COUNT=$(grep -c "error TS" /tmp/phase1-final.log 2>/dev/null || echo "0")

echo ""
echo "════════════════════════════════════════"
echo "  BUILD ERRORS: $ERROR_COUNT"
echo "════════════════════════════════════════"
echo ""

if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "🎉🎉🎉 BUILD SUCCESSFUL! 🎉🎉🎉"
  echo ""
  echo "📊 COMPILED SUCCESSFULLY:"
  echo "  Ad Groups: $(ls dist/ads/tools/ad-groups/*.js 2>/dev/null | wc -l) tools"
  echo "  Ads: $(ls dist/ads/tools/ads/*.js 2>/dev/null | wc -l) tools"
  echo "  Targeting: $(ls dist/ads/tools/targeting/*.js 2>/dev/null | wc -l) tools"
  echo "  Bid Modifiers: $(ls dist/ads/tools/bid-modifiers/*.js 2>/dev/null | wc -l) tools"
else
  echo "⚠️  Remaining errors:"
  grep "error TS" /tmp/phase1-final.log | head -10
fi

