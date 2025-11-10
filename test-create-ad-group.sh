#!/bin/bash

# Test create_ad_group with OAuth tokens
# This tests the approval workflow and confirmation token accessibility

REFRESH_TOKEN=$(cat config/gsc-tokens.json | jq -r '.refresh_token')

echo "=========================================="
echo "Testing create_ad_group Tool"
echo "=========================================="
echo ""
echo "Step 1: Call without confirmation token (get preview)"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-Google-Refresh-Token: $REFRESH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_ad_group",
      "arguments": {
        "customerId": "2041738707",
        "campaignId": "23249734522",
        "name": "Dell XPS Laptops - Premium",
        "cpcBidMicros": 2500000,
        "status": "PAUSED"
      }
    }
  }')

echo "Response structure:"
echo "$RESPONSE" | jq '{
  hasContent: (.result.content != null),
  hasConfirmationToken: (.result.confirmationToken != null),
  hasRequiresApproval: (.result.requiresApproval != null),
  hasMeta: (.result._meta != null)
}'

echo ""
echo "Confirmation token accessible at root level:"
TOKEN=$(echo "$RESPONSE" | jq -r '.result.confirmationToken // "NOT FOUND"')
echo "Token: ${TOKEN:0:20}... (truncated)"

echo ""
echo "Preview content (first 200 chars):"
echo "$RESPONSE" | jq -r '.result.content[0].text // "NO CONTENT"' | head -c 200
echo "..."

if [ "$TOKEN" != "NOT FOUND" ] && [ "$TOKEN" != "null" ]; then
  echo ""
  echo "=========================================="
  echo "✅ SUCCESS: Token is accessible!"
  echo "=========================================="
  echo ""
  echo "Step 2: Confirm with token (execute operation)"
  echo ""

  CONFIRM_RESPONSE=$(curl -s -X POST http://localhost:3100/mcp \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "X-Google-Refresh-Token: $REFRESH_TOKEN" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"id\": 2,
      \"method\": \"tools/call\",
      \"params\": {
        \"name\": \"create_ad_group\",
        \"arguments\": {
          \"customerId\": \"2041738707\",
          \"campaignId\": \"23249734522\",
          \"name\": \"Dell XPS Laptops - Premium\",
          \"cpcBidMicros\": 2500000,
          \"status\": \"PAUSED\",
          \"confirmationToken\": \"$TOKEN\"
        }
      }
    }")

  echo "Execution response:"
  echo "$CONFIRM_RESPONSE" | jq '{
    success: .result.success,
    hasData: (.result.data != null),
    adGroupId: .result.data.adGroupId,
    message: .result.data.message
  }'

  AD_GROUP_ID=$(echo "$CONFIRM_RESPONSE" | jq -r '.result.data.adGroupId // "NONE"')

  if [ "$AD_GROUP_ID" != "NONE" ] && [ "$AD_GROUP_ID" != "null" ]; then
    echo ""
    echo "=========================================="
    echo "✅ AD GROUP CREATED: $AD_GROUP_ID"
    echo "=========================================="

    # Save for next test
    echo "$AD_GROUP_ID" > /tmp/test_ad_group_id.txt
  else
    echo ""
    echo "❌ Ad group creation failed"
    echo "Full response:"
    echo "$CONFIRM_RESPONSE" | jq '.'
  fi
else
  echo ""
  echo "=========================================="
  echo "❌ FAILED: Token not accessible"
  echo "=========================================="
  echo "Full response:"
  echo "$RESPONSE" | jq '.'
fi
