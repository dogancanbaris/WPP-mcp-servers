#!/bin/bash

# Test script for Help Menu Dialogs
# Usage: ./test-help-menu.sh [dev|prod]

echo "======================================"
echo "Help Menu Dialogs - Test Suite"
echo "======================================"
echo ""

# Set base URL
if [ "$1" = "prod" ]; then
    BASE_URL="https://your-production-url.com"
    echo "Testing PRODUCTION environment"
else
    BASE_URL="http://localhost:3000"
    echo "Testing DEVELOPMENT environment"
fi

echo "Base URL: $BASE_URL"
echo ""

# Check if server is running
echo "1. Checking if server is running..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start with: npm run dev"
    exit 1
fi
echo ""

# Test Feedback API
echo "2. Testing Feedback API..."
FEEDBACK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_type": "suggestion",
    "message": "Test feedback from script",
    "email": "test@example.com",
    "context": "/dashboard/test"
  }')

if echo "$FEEDBACK_RESPONSE" | grep -q "success"; then
    echo "✅ Feedback API working"
    echo "   Response: $FEEDBACK_RESPONSE"
else
    echo "❌ Feedback API failed"
    echo "   Response: $FEEDBACK_RESPONSE"
fi
echo ""

# Test Linear API
echo "3. Testing Linear Issue API..."
LINEAR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcp/linear/create-issue" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Issue from Script",
    "description": "Testing Linear integration",
    "team": "wpp-analytics",
    "priority": 2,
    "labels": ["bug"]
  }')

if echo "$LINEAR_RESPONSE" | grep -q "success"; then
    echo "✅ Linear Issue API working"
    echo "   Response: $LINEAR_RESPONSE"
else
    echo "⚠️  Linear Issue API requires LINEAR_API_KEY"
    echo "   Response: $LINEAR_RESPONSE"
fi
echo ""

# Check environment variables
echo "4. Checking environment variables..."
if [ -f .env.local ]; then
    echo "✅ .env.local file exists"

    if grep -q "LINEAR_API_KEY" .env.local; then
        echo "✅ LINEAR_API_KEY configured"
    else
        echo "⚠️  LINEAR_API_KEY not found in .env.local"
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_URL configured"
    else
        echo "⚠️  NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi

    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo "✅ SUPABASE_SERVICE_ROLE_KEY configured"
    else
        echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
    fi
else
    echo "❌ .env.local file not found"
    echo "   Create it with required environment variables"
fi
echo ""

# Check files exist
echo "5. Checking if dialog files exist..."
FILES=(
    "src/components/dashboard-builder/dialogs/ReportIssueDialog.tsx"
    "src/components/dashboard-builder/dialogs/FeedbackDialog.tsx"
    "src/components/dashboard-builder/dialogs/ChangelogDialog.tsx"
    "src/app/api/feedback/route.ts"
    "src/app/api/mcp/linear/create-issue/route.ts"
    "public/CHANGELOG.md"
)

ALL_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file NOT FOUND"
        ALL_EXIST=false
    fi
done
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
if [ "$ALL_EXIST" = true ]; then
    echo "✅ All dialog files exist"
else
    echo "❌ Some files are missing"
fi

echo ""
echo "Manual Testing Required:"
echo "1. Open browser to $BASE_URL/dashboard/[id]/builder"
echo "2. Click Help > Report an issue"
echo "3. Click Help > Send feedback"
echo "4. Click Help > What's new"
echo ""
echo "Expected Results:"
echo "- All dialogs should open"
echo "- Forms should validate required fields"
echo "- Submit should show success toast"
echo "- Forms should reset after submission"
echo ""
echo "Documentation:"
echo "- HELP_MENU_INTEGRATION_GUIDE.md"
echo "- HELP_MENU_QUICK_REFERENCE.md"
echo "- HELP_MENU_IMPLEMENTATION_SUMMARY.md"
echo "- HELP_MENU_ARCHITECTURE.md"
echo ""
