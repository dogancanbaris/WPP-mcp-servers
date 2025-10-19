#!/bin/bash
# Pre-deployment readiness check

echo "=== WPP MCP Pre-Deployment Checklist ==="
echo ""

cd "$(dirname "$0")/.."

PASS=0
FAIL=0

# Check 1: Build
echo "1. Build Test..."
if npm run build > /dev/null 2>&1; then
  echo "   ✅ Build succeeds (0 errors)"
  ((PASS++))
else
  echo "   ❌ Build fails"
  ((FAIL++))
fi

# Check 2: Tests
echo "2. Tests..."
if npm test > /dev/null 2>&1; then
  echo "   ✅ All tests passing"
  ((PASS++))
else
  echo "   ⏳ Tests pending or failing"
  ((FAIL++))
fi

# Check 3: Secrets
echo "3. Secrets Check..."
if git ls-files | grep -qE "\.env$|token.*\.json$|client_secret.*\.json$"; then
  echo "   ❌ SECRETS IN GIT!"
  ((FAIL++))
else
  echo "   ✅ No secrets in repository"
  ((PASS++))
fi

# Check 4: Documentation
echo "4. Documentation..."
DOC_COUNT=$(find docs -name "*.md" | wc -l)
if [ "$DOC_COUNT" -gt 20 ]; then
  echo "   ✅ $DOC_COUNT documentation files"
  ((PASS++))
else
  echo "   ⚠️  Only $DOC_COUNT docs (expected 25+)"
  ((FAIL++))
fi

# Check 5: Safety Features
echo "5. Safety Features..."
SAFETY_COUNT=$(ls src/shared/{approval-enforcer,snapshot-manager,vagueness-detector,financial-impact-calculator}.ts 2>/dev/null | wc -l)
if [ "$SAFETY_COUNT" -eq 4 ]; then
  echo "   ✅ Core safety features present"
  ((PASS++))
else
  echo "   ❌ Missing safety features ($SAFETY_COUNT/4)"
  ((FAIL++))
fi

# Check 6: HTTP Server
echo "6. HTTP Server..."
if [ -f "dist/http-server/server.js" ]; then
  echo "   ✅ HTTP server compiled"
  ((PASS++))
else
  echo "   ❌ HTTP server not built"
  ((FAIL++))
fi

# Check 7: Tool Count
echo "7. Tool Count..."
TOOL_COUNT=$(find src -name "*.ts" -path "*/tools/*" -exec grep -h "export const.*Tool = {" {} \; 2>/dev/null | wc -l)
echo "   📊 $TOOL_COUNT tools found"
if [ "$TOOL_COUNT" -gt 50 ]; then
  ((PASS++))
else
  ((FAIL++))
fi

echo ""
echo "================================"
echo "RESULTS: $PASS passed, $FAIL failed"
echo "================================"

if [ "$FAIL" -eq 0 ]; then
  echo "✅ READY FOR DEPLOYMENT"
  exit 0
else
  echo "⚠️  NOT READY - Fix issues above"
  exit 1
fi
