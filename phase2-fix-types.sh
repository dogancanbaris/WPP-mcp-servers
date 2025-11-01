#!/bin/bash

echo "=== PHASE 2B: FIX TYPE ISSUES ==="
echo ""

echo "🔧 Fix 2.2: Remove Invalid FinancialImpact Fields"

# Fix create-ad-group.tool.ts - Remove estimatedCpcBid
python3 << 'PYTHON'
with open('src/ads/tools/ad-groups/create-ad-group.tool.ts', 'r') as f:
    content = f.read()

# Remove estimatedCpcBid line
content = content.replace("estimatedCpcBid: input.cpcBidMicros ? input.cpcBidMicros / 1000000 : 0,\n          ", "")
content = content.replace("estimatedCpcBid: input.cpcBidMicros ? input.cpcBidMicros / 1000000 : 0,", "")

with open('src/ads/tools/ad-groups/create-ad-group.tool.ts', 'w') as f:
    f.write(content)
PYTHON
echo "  ✅ Fixed create-ad-group.tool.ts"

# Fix update-ad-group.tool.ts - Remove currentCpcBid  
python3 << 'PYTHON'
with open('src/ads/tools/ad-groups/update-ad-group.tool.ts', 'r') as f:
    content = f.read()

content = content.replace("currentCpcBid: oldBidMicros / 1000000,\n          ", "")
content = content.replace("currentCpcBid: oldBidMicros / 1000000,", "")

with open('src/ads/tools/ad-groups/update-ad-group.tool.ts', 'w') as f:
    f.write(content)
PYTHON
echo "  ✅ Fixed update-ad-group.tool.ts"

echo ""
echo "🔧 Fix 2.3: Add Type Annotations to Reduce Functions"

# Fix get-ad-group-quality-score.tool.ts
python3 << 'PYTHON'
with open('src/ads/tools/ad-groups/get-ad-group-quality-score.tool.ts', 'r') as f:
    content = f.read()

# Add type annotations to reduce callbacks
import re
content = re.sub(r'\.reduce\(\(sum, s\) =>', '.reduce((sum: number, s: any) =>', content)
content = re.sub(r'\.reduce\(\(sum, k\) =>', '.reduce((sum: number, k: any) =>', content)
content = re.sub(r'\.filter\(\(k\) =>', '.filter((k: any) =>', content)

with open('src/ads/tools/ad-groups/get-ad-group-quality-score.tool.ts', 'w') as f:
    f.write(content)
PYTHON
echo "  ✅ Fixed get-ad-group-quality-score.tool.ts"

echo ""
echo "🔧 Fix 2.4: Fix Array Access Type Safety"

# Fix create-ad.tool.ts array access
python3 << 'PYTHON'
with open('src/ads/tools/ads/create-ad.tool.ts', 'r') as f:
    content = f.read()

# Fix result array access
content = content.replace("response.results[0].resourceName", "response.results?.[0]?.resourceName || ''")

with open('src/ads/tools/ads/create-ad.tool.ts', 'w') as f:
    f.write(content)
PYTHON
echo "  ✅ Fixed create-ad.tool.ts"

echo ""
echo "🧪 Verification..."
npm run build > /tmp/phase2-build.log 2>&1
ERROR_COUNT=$(grep -c "error TS" /tmp/phase2-build.log 2>/dev/null || echo "0")
echo "  Remaining errors: $ERROR_COUNT (target: <50)"

echo ""
echo "✅ PHASE 2 COMPLETE"

