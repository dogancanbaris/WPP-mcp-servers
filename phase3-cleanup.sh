#!/bin/bash

echo "=== PHASE 3: CLEANUP UNUSED VARIABLES ==="
echo ""

echo "🔧 Fix 3.1: Remove Unused Imports"

# Remove unused formatNextSteps
sed -i 's/, formatNextSteps//' src/ads/tools/ads/create-ad.tool.ts
sed -i 's/, formatNextSteps//' src/ads/tools/ads/update-ad.tool.ts

# Remove unused formatNumber
sed -i 's/, formatNumber//' src/ads/tools/reporting/get-auction-insights.tool.ts

# Remove unused amountToMicros
sed -i 's/, amountToMicros//' src/ads/tools/ad-groups/create-ad-group.tool.ts
sed -i 's/, amountToMicros//' src/ads/tools/ad-groups/update-ad-group.tool.ts

# Remove unused microsToAmount
sed -i 's/, microsToAmount//' src/ads/tools/ad-groups/get-ad-group-quality-score.tool.ts

# Remove unused formatPercentageChange
sed -i 's/, formatPercentageChange//' src/ads/tools/ad-groups/update-ad-group-bid-modifier.tool.ts

echo "  ✅ Removed unused imports from 7 files"

echo ""
echo "🔧 Fix 3.2: Prefix Unused Variables"

# Fix unused result variables
sed -i 's/const result =/const _result =/g' src/ads/tools/labels.ts
sed -i 's/const result =/const _result =/g' src/ads/tools/bidding.ts

# Fix unused variables in specific files
sed -i 's/const newBidMicros =/const _newBidMicros =/g' src/ads/tools/ad-groups/update-ad-group-bid-modifier.tool.ts
sed -i 's/const targetMicros =/const _targetMicros =/g' src/ads/tools/bidding.ts
sed -i 's/const extractedCountryCode =/const _extractedCountryCode =/g' src/ads/tools/extensions/create-call-extension.tool.ts

echo "  ✅ Prefixed unused variables in 5 files"

echo ""
echo "🔧 Fix 3.3: Fix Unused Context Parameters"

# Prefix unused ctx parameters in WorkflowBuilder
sed -i 's/async (i, ctx) =>/async (i, _ctx) =>/g' src/ads/tools/extensions/*.tool.ts

echo "  ✅ Fixed unused ctx parameters in extensions"

echo ""
echo "🧪 Verification..."
npm run build > /tmp/phase3-build.log 2>&1
ERROR_COUNT=$(grep -c "error TS" /tmp/phase3-build.log 2>/dev/null || echo "0")
echo "  Remaining errors: $ERROR_COUNT (target: <30)"

echo ""
echo "✅ PHASE 3 COMPLETE"

