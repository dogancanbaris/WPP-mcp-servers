#!/bin/bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  GOOGLE_BACKEND_URL=http://localhost:3100/mcp \
  ENABLE_GOOGLE=true \
  MCP_TRANSPORT=stdio \
  LOG_LEVEL=info \
  node dist/router/server.js 2>&1 | \
  jq -r '.result.tools | length'
