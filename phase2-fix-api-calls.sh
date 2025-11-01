#!/bin/bash

echo "=== PHASE 2: API INTEGRATION FIXES ==="
echo ""

echo "🔧 Fix 2.1: Asset Service Method Calls"

# The pattern from client.ts is: customer.assets.create([operations])
# Agents used: customer.assetService which doesn't exist

# Fix in create-call-extension.tool.ts
sed -i 's/customer\.assetService/customer.assets/g' src/ads/tools/extensions/create-call-extension.tool.ts
sed -i 's/customer\.assets\.call/customer.assets.create/g' src/ads/tools/extensions/create-call-extension.tool.ts

# Fix in update-call-extension.tool.ts
sed -i 's/customer\.assetService/customer.assets/g' src/ads/tools/extensions/update-call-extension.tool.ts
sed -i 's/customer\.assets\.call/customer.assets.update/g' src/ads/tools/extensions/update-call-extension.tool.ts

# Fix in create-structured-snippet.tool.ts
sed -i 's/customer\.assetService/customer.assets/g' src/ads/tools/extensions/create-structured-snippet.tool.ts
sed -i 's/customer\.assets\.call/customer.assets.create/g' src/ads/tools/extensions/create-structured-snippet.tool.ts

# Fix in update-structured-snippet.tool.ts
sed -i 's/customer\.assetService/customer.assets/g' src/ads/tools/extensions/update-structured-snippet.tool.ts
sed -i 's/customer\.assets\.call/customer.assets.update/g' src/ads/tools/extensions/update-structured-snippet.tool.ts

echo "  ✅ Fixed asset service calls in 4 files"

echo ""
echo "🧪 Verification..."
npm run build > /tmp/phase2a-build.log 2>&1
ERROR_COUNT=$(grep -c "error TS" /tmp/phase2a-build.log 2>/dev/null || echo "0")
echo "  Remaining errors: $ERROR_COUNT"

