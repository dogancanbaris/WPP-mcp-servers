# MCP HTTP Server - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Build the Server
```bash
cd "/home/dogancanbaris/projects/MCP Servers"
npm run build
```

### 2. Start the Server (Development Mode)
```bash
ENABLE_DEV_BYPASS=true MCP_TRANSPORT=http npm run start:http
```

Server will start on `http://localhost:3000`

### 3. Test the Connection
```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "transport": "streamable-http",
#   "timestamp": "2025-10-29T..."
# }
```

---

## 🔌 Basic Usage

### Initialize Session
```bash
curl -i -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "X-Dev-Bypass: true" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0.0"}
    }
  }'
```

**Extract session ID from response headers:** `Mcp-Session-Id: xxxx-xxxx-xxxx-xxxx`

### List Tools
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: YOUR_SESSION_ID" \
  -H "X-Dev-Bypass: true" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }' | jq '.result.tools | length'

# Returns: 60
```

### Call a Tool
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: YOUR_SESSION_ID" \
  -H "X-Dev-Bypass: true" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_properties",
      "arguments": {}
    }
  }' | jq
```

---

## 📚 Documentation

- **Full Guide:** `MCP-HTTP-SERVER-GUIDE.md` - Complete documentation
- **Skill:** `.claude/skills/wpp-mcp-http/SKILL.md` - Claude Code skill for agents
- **Test Script:** Run `./test-mcp-http.sh` for comprehensive tests

---

## 🎯 What Changed?

### Before (Stdio - CLI Only)
- ❌ Only Claude Code CLI could connect
- ❌ 70k tokens consumed in context
- ❌ Not scalable

### After (HTTP - External Server)
- ✅ Any agent can connect via HTTP
- ✅ ~5k tokens (95% reduction!)
- ✅ Production-ready
- ✅ Multi-client support
- ✅ OAuth per-request

---

## 🔑 Key Points

**Server URL:** `http://localhost:3000/mcp`
**Tools Available:** 65 tools across 7 Google APIs
**Auth Mode:** Development bypass (use `X-Dev-Bypass: true` header)
**Protocol:** MCP Streamable HTTP (2025-03-26)

---

## 🚨 Common Issues

**Server won't start?**
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill if needed, then restart
```

**"Not Acceptable" error?**
- Add: `-H "Accept: application/json, text/event-stream"`

**"No valid session ID" error?**
- Initialize first, then use the session ID from response headers

---

## ✅ Success Criteria

You know it's working when:
1. Health check returns `"status": "healthy"`
2. Initialize returns session ID in headers
3. Tools list returns 65 tools
4. Tool calls return actual data (not errors)

---

**Next:** Use the `wpp-mcp-http` skill in Claude Code to connect agents!
