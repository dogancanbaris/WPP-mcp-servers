# Chrome DevTools MCP Integration

Complete guide for setting up and troubleshooting Chrome DevTools MCP in WSL2 environments.

## 📚 Contents

### [WSL2-SETUP.md](./WSL2-SETUP.md)
Complete WSL2 Chrome setup and troubleshooting guide:
- Chrome installation in WSL2
- DevTools protocol configuration
- Working solutions and failed approaches
- Quick start script for launching Chrome
- Comprehensive troubleshooting section

## 🎯 Quick Start

The key insight: **Run Chrome in WSL2, not Windows Chrome from WSL2**

### Step 1: Install Chrome in WSL2
```bash
which google-chrome
# If not installed:
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
```

### Step 2: Launch Chrome with DevTools
```bash
google-chrome \
  --no-sandbox \
  --remote-debugging-port=9222 \
  --no-first-run \
  --user-data-dir=/tmp/chrome-wsl-debug \
  "http://localhost:3000" &
```

### Step 3: Update ~/.claude.json
```bash
jq '.projects."/your/project/path".mcpServers."chrome-devtools" = {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest", "--browser-url=http://127.0.0.1:9222"]
}' ~/.claude.json > ~/.claude.json.tmp && mv ~/.claude.json.tmp ~/.claude.json
```

### Step 4: Test Connection
```bash
# In Claude Code:
mcp__chrome-devtools__list_pages
# Should list Chrome pages instead of "Target closed" error
```

## 🔧 Common Issues

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| "Target closed" error | Chrome runs on Windows, not WSL2 | Launch Chrome in WSL2 terminal |
| "Connection refused" on :9222 | Chrome on Windows binds to Windows localhost | Kill Windows Chrome, use WSL2 Chrome |
| Chrome won't launch | Missing `--no-sandbox` flag | Add flag for WSL2 root environment |
| Blank Chrome window | Display server issues | Install: `sudo apt-get install -y xdg-utils libx11-xcb1 libxcb-dri3-0` |

## 📋 Key Files

- **Configuration**: `~/.claude.json` (NOT `.mcp.json` in project)
- **Launch Script**: `~/start-chrome-mcp.sh` (optional but recommended)
- **Environment**: WSL2 (Linux), not Windows CMD/PowerShell

## 🌐 Supported MCP Operations

Once configured, you can use:
- `mcp__chrome-devtools__list_pages` - List open pages
- `mcp__chrome-devtools__navigate_page` - Navigate to URL
- `mcp__chrome-devtools__take_screenshot` - Capture screen
- `mcp__chrome-devtools__click` - Interact with page
- `mcp__chrome-devtools__evaluate_script` - Run JavaScript
- And 15+ other browser automation operations

## ✅ Verification Checklist

- [ ] Chrome installed in WSL2 (`which google-chrome`)
- [ ] Chrome can launch with remote-debugging-port flag
- [ ] `curl http://127.0.0.1:9222/json/version` returns JSON
- [ ] `~/.claude.json` configured with correct project path
- [ ] `mcp__chrome-devtools__list_pages` returns page list (not error)

## 📚 Related Documentation

- [Developer Guide](../guides/DEVELOPER-GUIDE.md#browser-automation)
- [MCP Server Architecture](../guides/DEVELOPER-GUIDE.md#mcp-server-architecture)
- [Chrome DevTools MCP NPM Package](https://www.npmjs.com/package/chrome-devtools-mcp)
