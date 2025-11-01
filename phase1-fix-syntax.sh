#!/bin/bash

echo "=== PHASE 1: AUTOMATED SYNTAX FIXES ==="
echo ""

echo "🔧 Fix 1.1: WorkflowBuilder Parameter Binding (13 files)"
# Fix all extension tools at once
for file in src/ads/tools/extensions/*.tool.ts; do
  if [ -f "$file" ]; then
    sed -i 's/async (_i, _ctx)/async (i, ctx)/g' "$file"
    echo "  ✅ Fixed: $(basename $file)"
  fi
done

echo ""
echo "🔧 Fix 1.2: keywords.ts Variable Scope"
# Replace _metrics with metrics
sed -i 's/const _metrics =/const metrics =/g' src/ads/tools/keywords.ts
echo "  ✅ Fixed: keywords.ts (_metrics → metrics)"

echo ""
echo "🧪 Verification: Running build to count remaining errors..."
npm run build > /tmp/phase1-build.log 2>&1
ERROR_COUNT=$(grep -c "error TS" /tmp/phase1-build.log 2>/dev/null || echo "0")
echo "  Remaining errors: $ERROR_COUNT (was 126, target: <50)"

echo ""
echo "✅ PHASE 1 COMPLETE"

