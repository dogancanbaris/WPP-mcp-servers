#!/bin/bash

# Add Time Series Chart to Dashboard via MCP HTTP
# Dashboard ID: fe674307-be20-4699-9a58-81040145bb96

set -e

echo "🔌 Step 1: Initialize MCP Session..."
INIT_RESPONSE=$(curl -s -i -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-Dev-Bypass: true" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"claude","version":"1.0.0"}}}')

SESSION_ID=$(echo "$INIT_RESPONSE" | grep "Mcp-Session-Id:" | awk '{print $2}' | tr -d '\r')

if [ -z "$SESSION_ID" ]; then
  echo "❌ Failed to get session ID"
  exit 1
fi

echo "✅ Session ID: $SESSION_ID"
echo ""

echo "📊 Step 2: Get current dashboard..."
GET_RESPONSE=$(curl -s -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "X-Dev-Bypass: true" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_dashboard",
      "arguments": {
        "dashboard_id": "fe674307-be20-4699-9a58-81040145bb96"
      }
    }
  }')

echo "Dashboard response:"
echo "$GET_RESPONSE" | jq -r '.result.content[0].text' | jq '.dashboard.name, .dashboard.rows | length'
echo ""

echo "📈 Step 3: Add time series chart..."
ADD_RESPONSE=$(curl -s -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "X-Dev-Bypass: true" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "update_dashboard_layout",
      "arguments": {
        "dashboard_id": "fe674307-be20-4699-9a58-81040145bb96",
        "operation": "add_row",
        "data": {
          "columns": [{
            "width": "1/1",
            "component": {
              "type": "time_series",
              "title": "Clicks & Impressions Over Time",
              "dimension": "date",
              "metrics": ["clicks", "impressions"]
            }
          }]
        }
      }
    }
  }')

echo "Add chart response:"
echo "$ADD_RESPONSE" | jq -r '.result.content[0].text' | jq '.'
echo ""

echo "✅ Step 4: Verify chart was added..."
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -H "X-Dev-Bypass: true" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "get_dashboard",
      "arguments": {
        "dashboard_id": "fe674307-be20-4699-9a58-81040145bb96"
      }
    }
  }')

LAST_ROW=$(echo "$VERIFY_RESPONSE" | jq -r '.result.content[0].text' | jq '.dashboard.rows[-1]')
echo "Last row component:"
echo "$LAST_ROW" | jq '.columns[0].component | {type, title, metrics, dimension}'
echo ""

echo "✅ Complete! View dashboard at:"
echo "http://localhost:3000/dashboard/fe674307-be20-4699-9a58-81040145bb96/builder"
