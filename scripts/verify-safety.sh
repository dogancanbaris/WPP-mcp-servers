#!/bin/bash
# Verify safety integration for all write tools

echo "=== WPP MCP Safety Verification ==="
echo ""

cd "$(dirname "$0")/.."

echo "Checking write operations for safety integration..."
echo ""

echo "1. Approval Workflow:"
echo "   Write tools with ApprovalEnforcer:"
grep -l "ApprovalEnforcer" src/*/tools/*.ts | wc -l

echo ""
echo "2. Vagueness Detection:"
echo "   Write tools with vagueness check:"
grep -l "detectAndEnforceVagueness" src/*/tools/*.ts | wc -l

echo ""
echo "3. Safety Feature Files:"
ls -1 src/shared/{approval-enforcer,snapshot-manager,vagueness-detector,financial-impact-calculator,account-authorization,change-history,notification-system,pattern-matcher,interceptor}.ts 2>/dev/null | wc -l
echo "   (Expected: 9)"

echo ""
echo "4. Write Tools Missing Safety:"
echo "   Tools with 'WRITE' but no ApprovalEnforcer:"
grep -l "WRITE OPERATION" src/*/tools/*.ts | while read file; do
  if ! grep -q "ApprovalEnforcer" "$file"; then
    echo "   ⚠️  $file"
  fi
done

echo ""
echo "5. Configuration Files:"
ls -1 config/{safety-limits,prohibited-operations,notification-config}.json 2>/dev/null | wc -l
echo "   (Expected: 3)"

echo ""
echo "✅ Safety verification complete"
