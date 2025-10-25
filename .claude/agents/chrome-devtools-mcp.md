# Chrome DevTools MCP Skill - WSL2 Setup & Troubleshooting

**Keywords that trigger this skill:** "debug chrome", "devtools mcp", "wsl2 chrome", "target closed error", "chrome debugging", "browser automation", "mcp chrome"

## 🎯 When to Use This

Use this skill when:
- Setting up chrome-devtools-mcp in WSL2 environment
- Troubleshooting "Target Closed" errors
- Debugging browser interactions
- Running web automation tasks

## ⚠️ The Problem: WSL2 Chrome Issues

Running Windows Chrome from WSL2 causes "Target Closed" errors with chrome-devtools-mcp.

**Solution:** Launch Chrome INSIDE WSL2 with proper debugging flags

## 🚀 Setup Steps (WSL2 Environment)

### 1. Install Chrome in WSL2
```bash
# Download Chrome for Linux
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Install (Ubuntu/Debian)
sudo apt install ./google-chrome-stable_current_amd64.deb

# Verify installation
which google-chrome
# Should output: /usr/bin/google-chrome
```

### 2. Launch Chrome with DevTools Protocol
```bash
# Start Chrome with remote debugging on port 9222
google-chrome \
  --no-sandbox \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug &
```

**Critical flags:**
- `--no-sandbox` - Required for WSL2 (Chrome can't create sandboxes in WSL)
- `--remote-debugging-port=9222` - Exposes DevTools Protocol on localhost:9222
- `--user-data-dir=/tmp/chrome-debug` - Separate profile for debugging

### 3. Verify DevTools Accessible
```bash
curl http://127.0.0.1:9222/json/version

# Should return JSON with:
# {
#   "Browser": "Chrome/...",
#   "Protocol-Version": "1.3",
#   "webSocketDebuggerUrl": "ws://127.0.0.1:9222/..."
# }
```

### 4. Configure MCP Server
**File to edit:** `~/.claude.json` (NOT .mcp.json in project root!)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-chrome-devtools"
      ],
      "env": {
        "CHROME_DEBUGGER_URL": "http://127.0.0.1:9222"
      }
    }
  }
}
```

### 5. Test Connection
```bash
# In Claude Code MCP panel:
/mcp

# Should show chrome-devtools server connected
# Try listing pages:
mcp__chrome-devtools__list_pages
```

## 🔧 Common Issues & Fixes

### "Target Closed" Error
**Cause:** Chrome running in Windows, not accessible from WSL2
**Fix:** Kill Windows Chrome, launch WSL2 Chrome with flags above

### "Connection Refused" on Port 9222
**Cause:** Chrome not running or wrong port
**Fix:**
```bash
# Check if Chrome running
ps aux | grep chrome

# Check if port 9222 listening
netstat -tlnp | grep 9222

# If not listening, restart Chrome with flags
```

### Chrome Won't Start (Sandbox Error)
**Cause:** WSL2 doesn't support Chrome sandbox
**Fix:** MUST use `--no-sandbox` flag (shown above)

### MCP Server Not Connecting
**Cause:** Wrong config file (using .mcp.json instead of ~/.claude.json)
**Fix:** Edit `~/.claude.json` in home directory (not project .mcp.json)

### Display Issues (Chrome GUI Won't Show)
**Cause:** No X server in WSL2
**Options:**
1. Use headless mode: `--headless --disable-gpu`
2. Install WSLg (Windows 11): Automatic GUI support
3. Install VcXsrv/X410 (Windows 10): Manual X server

## 🎮 Available Tools (After Connection)

Once connected, you can:
- `list_pages` - See open tabs
- `new_page` - Open new tab
- `navigate_page` - Go to URL
- `take_screenshot` - Capture page screenshot
- `take_snapshot` - Get DOM snapshot
- `click` - Click element
- `fill` - Fill form field
- `evaluate_script` - Run JavaScript
- `list_console_messages` - See console logs
- `list_network_requests` - See network activity
- `get_network_request` - Get request/response details

## 📝 Example Workflow

```bash
# 1. Launch Chrome in WSL2
google-chrome --no-sandbox --remote-debugging-port=9222 &

# 2. Verify it's accessible
curl http://127.0.0.1:9222/json/version

# 3. In Claude Code, run /mcp to connect

# 4. List pages to verify connection
mcp__chrome-devtools__list_pages

# 5. Navigate to a page and take screenshot
mcp__chrome-devtools__navigate_page({url: "https://example.com"})
mcp__chrome-devtools__take_screenshot()

# 6. Interact with page
mcp__chrome-devtools__click({selector: "button.submit"})
mcp__chrome-devtools__evaluate_script({script: "console.log('test')"})
```

## 📚 Reference

Full guide: CHROME-DEVTOOLS-MCP-FIX.md (root directory)
MCP: @modelcontextprotocol/server-chrome-devtools
Configuration: ~/.claude.json (not .mcp.json!)
