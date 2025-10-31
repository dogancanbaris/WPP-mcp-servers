# WPP Analytics Platform - Port Management & Development Server Guide

## ⚠️ CRITICAL: Port Assignments

**These port assignments MUST be strictly followed:**

- **Port 3000:** Frontend (Next.js dev server) - **REQUIRED for OAuth callbacks**
- **Port 3001:** MCP HTTP Server - External agent connections
- **Port 3002:** DO NOT USE - Reserved for conflicts only

## Why Port 3000 Matters for Frontend

The frontend **MUST** run on port 3000 because:

1. **OAuth callbacks configured for `localhost:3000`**
2. **API endpoints expect `localhost:3000`**
3. **Frontend ENV vars reference `localhost:3000`**
4. **Changing ports breaks authentication flow**

## Starting Services Correctly

### Option 1: Use Restart Script (RECOMMENDED)

```bash
cd /home/dogancanbaris/projects/MCP\ Servers
bash restart-dev-servers.sh
```

**The script will:**
1. Kill all processes on ports 3000, 3001, 3002
2. Start MCP HTTP Server on port 3001
3. Start Frontend on port 3000
4. Log all actions and verify success
5. Display service status and access URLs

### Option 2: Manual Start (Advanced)

**Terminal 1 - Start MCP HTTP Server:**
```bash
cd /home/dogancanbaris/projects/MCP\ Servers
HTTP_PORT=3001 ENABLE_DEV_BYPASS=true node dist/gsc/server-http.js
```

**Terminal 2 - Start Frontend:**
```bash
cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/frontend
PORT=3000 npm run dev
```

## Checking Service Status

### Quick Status Check

```bash
cd /home/dogancanbaris/projects/MCP\ Servers
bash check-services.sh
```

**Expected output:**
```
=== WPP Analytics Platform Service Status ===

Port 3000 (Frontend):
  Status: RUNNING (PID: xxxxx)

Port 3001 (MCP Server):
  Status: RUNNING (PID: xxxxx)

Port 3002 (Should be FREE):
  Status: FREE

=== Health Checks ===
MCP Server (/health):
  {"status":"healthy","version":"1.0.0",...}

Frontend (/):
  HTTP 200 OK

=== Recommendations ===
  ✓ All services running correctly!
```

### Manual Health Checks

**Check if services are running:**
```bash
lsof -i :3000 -i :3001
```

Expected output:
```
node    [PID] root   21u  IPv6 ... TCP *:3001 (LISTEN)  # MCP Server
node    [PID] root   21u  IPv6 ... TCP *:3000 (LISTEN)  # Frontend
```

**Test MCP Server health:**
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"healthy","version":"1.0.0",...}`

**Test Frontend:**
```bash
curl http://localhost:3000
```
Expected: HTML response from Next.js

## Troubleshooting Port Conflicts

### If Port 3000 Shows "In Use" Error

**Option 1: Use restart script (recommended):**
```bash
cd /home/dogancanbaris/projects/MCP\ Servers
bash restart-dev-servers.sh
```

**Option 2: Kill manually:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart frontend
cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/frontend
PORT=3000 npm run dev
```

### If MCP Server Is on Wrong Port

```bash
# Check current MCP server port
ps aux | grep "server-http.js"

# Kill and restart on correct port
pkill -9 -f "server-http.js"
cd /home/dogancanbaris/projects/MCP\ Servers
HTTP_PORT=3001 ENABLE_DEV_BYPASS=true node dist/gsc/server-http.js
```

### If You See Port 3002 Being Used

This means Next.js auto-incremented because port 3000 was occupied. **This breaks OAuth!**

**Solution:**
```bash
# Use restart script to fix
cd /home/dogancanbaris/projects/MCP\ Servers
bash restart-dev-servers.sh
```

## Log Files

When using the restart script, logs are saved to:

- **MCP Server:** `/home/dogancanbaris/projects/MCP Servers/logs/mcp-http-server.log`
- **Frontend:** `/home/dogancanbaris/projects/MCP Servers/logs/frontend-dev-server.log`

### View Logs in Real-Time

```bash
# MCP Server logs
tail -f "/home/dogancanbaris/projects/MCP Servers/logs/mcp-http-server.log"

# Frontend logs
tail -f "/home/dogancanbaris/projects/MCP Servers/logs/frontend-dev-server.log"
```

## For Claude Code Agents

### Before Starting Any Work That Requires the Frontend

**1. Check if services are running:**
```bash
lsof -i :3000 -i :3001
```

**2. If ports are occupied by wrong processes or services are down:**
```bash
cd /home/dogancanbaris/projects/MCP\ Servers
bash restart-dev-servers.sh
```

**3. Wait 30 seconds for services to start**

**4. Verify:**
```bash
# Quick verification
bash check-services.sh

# Or manual verification
lsof -i :3000 -i :3001
curl http://localhost:3000
curl http://localhost:3001/health
```

### DO NOT

❌ **Start frontend on alternate ports** (3001, 3002, 3003, etc.)
❌ **Kill processes without using restart script** (may leave orphans)
❌ **Change PORT values in .env files** without updating this documentation
❌ **Run multiple dev servers simultaneously** (creates port conflicts)

### DO

✅ **Always use port 3000 for frontend**
✅ **Always use port 3001 for MCP server**
✅ **Use restart script when in doubt**
✅ **Check service status before starting work**
✅ **Read logs if services fail to start**

## Environment Variables

### Root `.env` File
Location: `/home/dogancanbaris/projects/MCP Servers/.env`

```bash
# Server Configuration
PORT=6000          # OAuth redirect server (different from frontend)
HTTP_PORT=3001     # MCP HTTP Server port
```

### Frontend `.env.local` File
Location: `/home/dogancanbaris/projects/MCP Servers/wpp-analytics-platform/frontend/.env.local`

```bash
# Next.js Dev Server Port (MUST be 3000 for OAuth callbacks)
PORT=3000
```

## Common Scenarios

### Scenario 1: "Cannot connect to frontend"

```bash
# Check if frontend is running
lsof -ti:3000

# If not running, restart
bash restart-dev-servers.sh
```

### Scenario 2: "OAuth authentication failing"

```bash
# Check if frontend is on port 3000 (not 3001, 3002, etc.)
lsof -ti:3000

# If frontend is on wrong port
bash restart-dev-servers.sh
```

### Scenario 3: "MCP server not responding"

```bash
# Check if MCP server is running on port 3001
lsof -ti:3001

# Check health
curl http://localhost:3001/health

# If not running or unhealthy, restart
bash restart-dev-servers.sh
```

### Scenario 4: "Multiple background processes running"

```bash
# Kill all node processes (careful!)
pkill -9 node

# Restart properly
bash restart-dev-servers.sh
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Client (Browser)                                   │
│                                                     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Port 3000            │
         │   Next.js Frontend     │
         │   (OAuth callbacks)    │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Port 3001            │
         │   MCP HTTP Server      │
         │   (API endpoints)      │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Google APIs          │
         │   (GSC, Analytics,     │
         │    Ads, BigQuery)      │
         └────────────────────────┘
```

## Quick Reference Commands

| Task | Command |
|------|---------|
| Restart all services | `bash restart-dev-servers.sh` |
| Check service status | `bash check-services.sh` |
| Kill port 3000 | `lsof -ti:3000 \| xargs kill -9` |
| Kill port 3001 | `lsof -ti:3001 \| xargs kill -9` |
| View frontend logs | `tail -f logs/frontend-dev-server.log` |
| View MCP logs | `tail -f logs/mcp-http-server.log` |
| Test MCP health | `curl http://localhost:3001/health` |
| Test frontend | `curl http://localhost:3000` |
| List port usage | `lsof -i :3000 -i :3001 -i :3002` |

## Maintenance

### Daily Checks

Before starting development work:
```bash
cd /home/dogancanbaris/projects/MCP\ Servers
bash check-services.sh
```

### After System Restart

Services don't auto-start. Run:
```bash
cd /home/dogancanbaris/projects/MCP\ Servers
bash restart-dev-servers.sh
```

### Before Committing Code

Ensure services are running correctly:
```bash
bash check-services.sh
```

### Before Creating Pull Requests

1. Check services: `bash check-services.sh`
2. Test frontend: Open http://localhost:3000
3. Test OAuth flow: Try connecting a Google account
4. Check logs for errors

---

**Last Updated:** 2025-10-29
**Maintained By:** WPP Analytics Platform Development Team
