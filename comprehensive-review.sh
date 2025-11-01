#!/bin/bash

echo "=== COMPREHENSIVE REVIEW OF ALL GOOGLE ADS TOOLS ==="
echo ""

echo "📊 CURRENT BUILD STATUS:"
npm run build > /tmp/review-build.log 2>&1
TOTAL_ERRORS=$(grep -c "error TS" /tmp/review-build.log 2>/dev/null || echo "0")
CRITICAL_ERRORS=$(grep "error TS" /tmp/review-build.log | grep -v "TS6133\|TS6198\|TS6196" | wc -l)
STYLE_WARNINGS=$(grep -c "error TS6133\|TS6198\|TS6196" /tmp/review-build.log 2>/dev/null || echo "0")

echo "  Total Errors: $TOTAL_ERRORS"
echo "  Critical Errors: $CRITICAL_ERRORS"
echo "  Style Warnings: $STYLE_WARNINGS"

echo ""
echo "📁 TOOLS CREATED BY CATEGORY:"
echo "  Ad Groups: $(ls src/ads/tools/ad-groups/*.tool.ts 2>/dev/null | wc -l) tools"
echo "  Ads: $(ls src/ads/tools/ads/*.tool.ts 2>/dev/null | wc -l) tools"
echo "  Extensions: $(ls src/ads/tools/extensions/*.tool.ts 2>/dev/null | wc -l) tools"
echo "  Targeting: $(ls src/ads/tools/targeting/*.tool.ts 2>/dev/null | wc -l) tools"
echo "  Bid Modifiers: $(ls src/ads/tools/bid-modifiers/*.tool.ts 2>/dev/null | wc -l) tools"
echo "  Keywords (in keywords.ts): ~8-10 new tools"
echo "  Labels (in labels.ts): ~6 tools"
echo "  Bidding (in bidding.ts): ~3 new tools"
echo "  Reporting: $(find src/ads/tools/reporting -name "*.tool.ts" -newer src/ads/tools/budgets.ts 2>/dev/null | wc -l) new tools"

echo ""
echo "📋 CONSISTENCY CHECK:"
echo ""
echo "Checking 'required: []' pattern (should be in all new tools):"
grep -r "required: \[\]" src/ads/tools/ad-groups src/ads/tools/ads 2>/dev/null | wc -l | xargs echo "  Tools with required: [] pattern:"

echo ""
echo "Checking formatDiscoveryResponse usage (discovery workflows):"
grep -rl "formatDiscoveryResponse" src/ads/tools/ad-groups src/ads/tools/ads 2>/dev/null | wc -l | xargs echo "  Tools using discovery:"

echo ""
echo "Checking injectGuidance usage (rich responses):"
grep -rl "injectGuidance" src/ads/tools/ad-groups src/ads/tools/ads src/ads/tools/targeting 2>/dev/null | wc -l | xargs echo "  Tools using injectGuidance:"

echo ""
echo "Checking approval workflows (WRITE tools):"
grep -rl "DryRunResultBuilder\|confirmationToken" src/ads/tools/ad-groups src/ads/tools/ads 2>/dev/null | wc -l | xargs echo "  Tools with approval:"

echo ""
echo "Checking audit logging (WRITE tools):"
grep -rl "audit.logWriteOperation" src/ads/tools/ad-groups src/ads/tools/ads src/ads/tools/targeting 2>/dev/null | wc -l | xargs echo "  Tools with audit logging:"

echo ""
echo "🔍 ERROR BREAKDOWN BY FILE:"
grep "error TS" /tmp/review-build.log | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -15

echo ""
echo "🔍 ERROR BREAKDOWN BY TYPE:"
grep "error TS" /tmp/review-build.log | cut -d: -f3 | cut -d' ' -f2 | sort | uniq -c | sort -rn

