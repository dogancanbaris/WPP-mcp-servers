#!/bin/bash

echo "=== DETAILED CONSISTENCY ANALYSIS ==="
echo ""

echo "1️⃣  CHECKING DESCRIPTION PATTERNS:"
echo ""
echo "Tools with single-line descriptions (CORRECT):"
grep -r "description: '" src/ads/tools/ad-groups/*.tool.ts src/ads/tools/ads/*.tool.ts 2>/dev/null | wc -l

echo "Tools with multi-line descriptions (INCONSISTENT):"
grep -r "description: \`" src/ads/tools/ad-groups/*.tool.ts src/ads/tools/ads/*.tool.ts src/ads/tools/targeting/*.tool.ts 2>/dev/null | wc -l

echo ""
echo "2️⃣  CHECKING OAUTH PATTERNS:"
echo ""
echo "Tools using extractRefreshToken (CORRECT):"
grep -rl "extractRefreshToken" src/ads/tools/ad-groups src/ads/tools/ads src/ads/tools/targeting 2>/dev/null | wc -l

echo "Tools using createGoogleAdsClientFromRefreshToken (CORRECT):"
grep -rl "createGoogleAdsClientFromRefreshToken" src/ads/tools/ad-groups src/ads/tools/ads src/ads/tools/targeting 2>/dev/null | wc -l

echo ""
echo "3️⃣  CHECKING WORKFLOW PATTERNS:"
echo ""
echo "Checking step numbering consistency:"
grep -h "step: '[0-9]/[0-9]'" src/ads/tools/ad-groups/*.tool.ts src/ads/tools/ads/*.tool.ts 2>/dev/null | sort | uniq -c

echo ""
echo "4️⃣  CHECKING WRITE TOOL SAFETY:"
echo ""
echo "WRITE tools by directory:"
grep -l "confirmationToken" src/ads/tools/ad-groups/*.tool.ts 2>/dev/null | wc -l | xargs echo "  Ad Groups:"
grep -l "confirmationToken" src/ads/tools/ads/*.tool.ts 2>/dev/null | wc -l | xargs echo "  Ads:"
grep -l "confirmationToken" src/ads/tools/targeting/*.tool.ts 2>/dev/null | wc -l | xargs echo "  Targeting:"
grep -l "confirmationToken" src/ads/tools/bid-modifiers/*.tool.ts 2>/dev/null | wc -l | xargs echo "  Bid Modifiers:"

echo ""
echo "5️⃣  ERRORS IN WORKING TOOLS vs BROKEN TOOLS:"
echo ""
npm run build 2>&1 | grep "^src/ads/tools" | cut -d':' -f1 | sort | uniq

echo ""
echo "6️⃣  VARIABLE NAMING ISSUES (Root Cause):"
echo ""
echo "Variables prefixed with _ but used without _:"
grep "const _" src/ads/tools/keywords.ts src/ads/tools/bidding.ts src/ads/tools/labels.ts 2>/dev/null | grep -v "//"

