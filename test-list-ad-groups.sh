#!/bin/bash

# Check if we have any ad groups in the test account

REFRESH_TOKEN=$(cat config/gsc-tokens.json | jq -r '.refresh_token')

echo "=========================================="
echo "Checking for existing ad groups"
echo "=========================================="

# Query for ad groups in campaign 23249734522
curl -s -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-Google-Refresh-Token: $REFRESH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "execute_tool",
      "arguments": {
        "toolName": "list_ad_groups",
        "params": {
          "customerId": "2041738707",
          "campaignId": "23249734522"
        }
      }
    }
  }' | jq '.result.content[0].text // .result // .'
