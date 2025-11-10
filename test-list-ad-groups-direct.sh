#!/bin/bash

REFRESH_TOKEN=$(cat config/gsc-tokens.json | jq -r '.refresh_token')

echo "Listing ad groups in campaign 23249734522..."

curl -s -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-Google-Refresh-Token: $REFRESH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_ad_groups",
      "arguments": {
        "customerId": "2041738707",
        "campaignId": "23249734522"
      }
    }
  }' | jq -r '.result.content[0].text // .result.data // .error.message // "Unknown response"'
