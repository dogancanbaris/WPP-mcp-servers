# Chrome DevTools MCP "Target Closed" & "Connection Refused" - WSL2 Fix

## Problem
Getting one of these errors when trying to use chrome-devtools-mcp in WSL2:
1. `Protocol error (Target.setDiscoverTargets): Target closed`
2. `Failed to fetch browser webSocket URL from http://127.0.0.1:9222: fetch failed`
3. `Connection refused` when accessing port 9222

## Root Causes
1. **Configuration Location**: Claude Code CLI reads MCP configuration from `~/.claude.json`, NOT from the project's `.mcp.json` file
2. **WSL2 Chrome Launch Issues**: The MCP server cannot successfully auto-launch Chrome in WSL2 environments
3. **NEW ISSUE (Oct 2025)**: Running Windows Chrome from WSL2 fails because Chrome binds to 127.0.0.1 on Windows, which WSL2 cannot access due to network isolation

## ✅ WORKING SOLUTION (Updated Oct 2025)

### The Simple Fix: Use Chrome Installed in WSL2

**Why this works**: When Chrome runs in WSL2 Linux, it binds to WSL2's localhost (127.0.0.1), which the MCP server can access directly. No network crossing needed!

### Step 1: Verify Chrome is Installed in WSL2
```bash
which google-chrome
# Should output: /usr/bin/google-chrome

# If not installed:
cd /tmp
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f  # Fix any dependency issues
```

### Step 2: Launch Chrome from WSL2 (The Working Command!)
```bash
google-chrome \
  --no-sandbox \
  --remote-debugging-port=9222 \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/chrome-wsl-debug \
  "http://localhost:3000" &
```

**Flags explained:**
- `--no-sandbox`: Required when running as root in WSL2
- `--remote-debugging-port=9222`: Opens DevTools protocol on port 9222
- `--no-first-run`: Skips first-run dialogs
- `--user-data-dir=/tmp/chrome-wsl-debug`: Separate profile for debugging

### Step 3: Verify DevTools is Accessible
```bash
curl http://127.0.0.1:9222/json/version

# Should output JSON with Chrome version:
# {
#   "Browser": "Chrome/141.0.7390.122",
#   "Protocol-Version": "1.3",
#   "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/..."
# }
```

If you see the JSON response with "✅ Chrome DevTools accessible!" - you're good!

### Step 3: Update ~/.claude.json
Update the chrome-devtools configuration to connect to the running Chrome instance:

```bash
# Backup first
cp ~/.claude.json ~/.claude.json.backup

# Update configuration for your project
jq '.projects."/home/your/project/path".mcpServers."chrome-devtools" = {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "chrome-devtools-mcp@latest",
    "--browser-url=http://127.0.0.1:9222"
  ],
  "env": {}
}' ~/.claude.json > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json
```

Replace `/home/your/project/path` with your actual project path.

### Step 4: Reconnect MCP
In Claude Code, run:
```
/mcp
```

## Verification
Test that it's working:
```javascript
// In Claude Code, try:
mcp__chrome-devtools__list_pages
```

You should see your Chrome pages listed instead of "Target closed" error.

## Why This Works

**Auto-launch approach (fails in WSL2):**
- MCP tries to launch Chrome → WSL2 environment issues → Target closed

**Manual launch + browser-url approach (works):**
- You launch Chrome with proper WSL2 flags → MCP connects to existing instance → Success

## Alternative: Using Windows Chrome from WSL2

If you have Node.js installed on Windows, you can use Windows Chrome:

```json
{
  "type": "stdio",
  "command": "cmd.exe",
  "args": [
    "/c",
    "npx",
    "-y",
    "chrome-devtools-mcp@latest",
    "--headless=false",
    "--isolated=true"
  ],
  "env": {}
}
```

This requires Node.js/npx installed on Windows side.

## Key Takeaways

1. **`.mcp.json` is ignored** - Claude Code uses `~/.claude.json`
2. **WSL2 needs manual Chrome launch** - Auto-launch fails with "Target closed"
3. **Use `--browser-url`** - Connect to externally-launched Chrome
4. **Proper WSL2 flags needed** - `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`

## ❌ What DOESN'T Work (Lessons Learned)

### ❌ Running Windows Chrome from WSL2
```bash
# This FAILS - Chrome binds to Windows 127.0.0.1, not accessible from WSL2
/mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe \
  --remote-debugging-port=9222

# netstat shows: TCP    127.0.0.1:9222    LISTENING (Windows only!)
# WSL2 can't reach Windows localhost without port forwarding
```

### ❌ Using --remote-debugging-address=0.0.0.0 on Windows Chrome
```bash
# This flag is IGNORED in normal Chrome mode (not headless)
chrome.exe --remote-debugging-address=0.0.0.0  # Still binds to 127.0.0.1
```

### ❌ Complex Solutions (Port Forwarding, Firewall Rules)
Don't use these - they're complicated and break easily:
- Windows netsh port proxy (requires admin)
- Windows Firewall rules (requires admin)
- SSH tunneling (requires SSH server)

## ✅ Quick Start Script (Permanent Solution)

Create this script: `~/start-chrome-mcp.sh`

```bash
#!/bin/bash
# Chrome DevTools MCP - WSL2 Launcher

# Kill any existing Chrome on port 9222
pkill -f "google-chrome.*9222" 2>/dev/null

# Start Chrome in WSL2
google-chrome \
  --no-sandbox \
  --remote-debugging-port=9222 \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/chrome-wsl-debug \
  "http://localhost:3000" &

# Wait and verify
sleep 3
curl -s http://127.0.0.1:9222/json/version && echo "" && echo "✅ Chrome ready for MCP!"
```

Make it executable:
```bash
chmod +x ~/start-chrome-mcp.sh
```

Then just run: `~/start-chrome-mcp.sh` at the start of each session.

## Troubleshooting

### "Connection refused" on port 9222
**Cause**: Chrome is running on Windows, not in WSL2
**Fix**: Kill Windows Chrome (`taskkill.exe /F /IM chrome.exe`) and run Chrome from WSL2 terminal

### "Target closed" still happening
**Cause**: MCP connecting before Chrome fully starts
**Fix**: Wait 5 seconds after launching Chrome, then try MCP command again

### Chrome won't start - "Running as root without --no-sandbox"
**Cause**: WSL2 runs as root by default
**Fix**: Add `--no-sandbox` flag (already in script above)

### Chrome displays nothing (blank window)
**Cause**: WSL2 display server issues
**Fix**: Install required packages:
```bash
sudo apt-get install -y xdg-utils libx11-xcb1 libxcb-dri3-0
```

### Port 9222 already in use
**Cause**: Another Chrome instance is running
**Fix**:
```bash
# Find and kill it
lsof -i :9222 | grep LISTEN
pkill -f "chrome.*9222"
```

## How to Know It's Working

Run this test:
```bash
# 1. Chrome is running
ps aux | grep google-chrome | grep 9222

# 2. Port is accessible
curl http://127.0.0.1:9222/json/version

# 3. MCP can connect
# In Claude Code CLI:
mcp__chrome-devtools__list_pages
```

All three should succeed!

## References
- [Chrome DevTools MCP Issue #281](https://github.com/ChromeDevTools/chrome-devtools-mcp/issues/281) - Target Closed
- [WSL2 Support Issue #131](https://github.com/ChromeDevTools/chrome-devtools-mcp/issues/131) - WSL2 Connection Issues
- [Root User Sandbox Issue #261](https://github.com/ChromeDevTools/chrome-devtools-mcp/issues/261) - --no-sandbox requirement
- **Solution verified**: October 22, 2025 - Run Chrome in WSL2, not Windows!
