#!/bin/bash

echo "=== FIXING MISSING IMPORTS - PROPERLY ==="
echo ""

# Find all files that use microsToAmount and add import
echo "🔧 Adding microsToAmount import to files that use it..."
grep -l "microsToAmount(" src/ads/tools/ad-groups/*.ts 2>/dev/null | while read file; do
  # Check if already imported
  if ! grep -q "microsToAmount" "$file" | head -1; then
    # Add to validation imports
    sed -i 's/import { extractCustomerId } from/import { extractCustomerId, microsToAmount } from/' "$file"
    echo "  ✅ Added to $(basename $file)"
  fi
done

# Find files that use formatNumber
echo ""
echo "🔧 Adding formatNumber import to files that use it..."
grep -l "formatNumber(" src/ads/tools/ad-groups/*.ts src/ads/tools/reporting/*.ts 2>/dev/null | while read file; do
  if ! grep -q "formatNumber" "$file" | head -1; then
    sed -i 's/from.*interactive-workflow/&/; s/injectGuidance }/injectGuidance, formatNumber }/' "$file"
    echo "  ✅ Added to $(basename $file)"
  fi
done

# Find files that use formatNextSteps
echo ""
echo "🔧 Adding formatNextSteps import to files that use it..."
grep -l "formatNextSteps(" src/ads/tools/ad-groups/*.ts src/ads/tools/ads/*.ts 2>/dev/null | while read file; do
  if ! grep -q "formatNextSteps" "$file" | head -1; then
    sed -i 's/from.*interactive-workflow/&/; s/injectGuidance }/injectGuidance, formatNextSteps }/' "$file"
    echo "  ✅ Added to $(basename $file)"
  fi
done

echo ""
echo "🔧 Adding formatSuccessSummary import to files that use it..."
grep -l "formatSuccessSummary(" src/ads/tools/ad-groups/*.ts src/ads/tools/ads/*.ts 2>/dev/null | while read file; do
  if ! grep -q "formatSuccessSummary" "$file" | head -1; then
    sed -i 's/from.*interactive-workflow/&/; s/injectGuidance }/injectGuidance, formatSuccessSummary }/' "$file"
    echo "  ✅ Added to $(basename $file)"
  fi
done

echo ""
echo "✅ Import restoration complete"

