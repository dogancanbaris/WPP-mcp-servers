# 🔧 Chrome DevTools MCP - WSL2 Permanent Fix

## Problem
Chrome DevTools MCP cannot connect to Chrome running on Windows from WSL2 because:
1. Windows Firewall blocks port 9222 from external connections
2. Chrome binds to 127.0.0.1 by default (localhost only)
3. WSL2 uses a virtual network adapter with different IP

## ✅ PERMANENT SOLUTION (One-Time Setup)

### Step 1: Add Windows Firewall Rule (PowerShell as Administrator)

Open **PowerShell as Administrator** and run:

```powershell
New-NetFirewallRule -DisplayName "Chrome DevTools WSL2" -Direction Inbound -LocalPort 9222 -Protocol TCP -Action Allow
```

This allows WSL2 to access port 9222 on Windows.

### Step 2: Create Chrome Launch Script

Save this as `start-chrome-debug.bat` on your Windows desktop:

```batch
@echo off
REM Kill existing Chrome instances
taskkill /F /IM chrome.exe 2>nul

REM Wait for processes to close
timeout /t 2 /nobreak >nul

REM Start Chrome with remote debugging
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9222 ^
  --remote-debugging-address=0.0.0.0 ^
  --user-data-dir="%TEMP%\chrome-debug-profile" ^
  "http://localhost:3000"

echo Chrome started with DevTools on port 9222
```

### Step 3: Test Connection from WSL2

```bash
# Get Windows host IP
WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')

# Test connection
curl http://$WINDOWS_IP:9222/json/version

# Should return Chrome version JSON
```

### Step 4: Configure Claude Code MCP (if needed)

The Chrome DevTools MCP should auto-detect, but if not, you may need to update:

`~/.config/claude-code/mcp.json` or project `.mcp.json`

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@chromedevtools/chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ]
    }
  }
}
```

## 🎯 Quick Start (Every Session)

### Option A: Run Chrome from Windows
1. Double-click `start-chrome-debug.bat` on Windows
2. Chrome opens with debugging enabled
3. MCP can now connect

### Option B: Run Chrome from WSL2 Terminal
```bash
# One-line command
/mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --user-data-dir=/tmp/chrome-debug \
  http://localhost:3000 &
```

## 🧪 Verification

After setup, these should work:

```bash
# From WSL2
curl http://localhost:9222/json/version  # May fail (WSL2 localhost forwarding)
curl http://10.255.255.254:9222/json/version  # Should work (Windows host IP)
```

Then MCP tools should work:
- `mcp__chrome-devtools__list_pages`
- `mcp__chrome-devtools__navigate_page`
- `mcp__chrome-devtools__take_screenshot`
- etc.

## 🐛 Troubleshooting

### Issue: "Connection refused"
- **Cause**: Windows Firewall blocking port
- **Fix**: Run Step 1 PowerShell command as Administrator

### Issue: "Failed to fetch browser webSocket URL"
- **Cause**: Chrome not running with debugging enabled
- **Fix**: Close all Chrome instances, then run the batch script

### Issue: "Port already in use"
- **Cause**: Chrome already running without debugging
- **Fix**: `taskkill /F /IM chrome.exe` then restart with script

### Issue: MCP still can't connect
- **Cause**: MCP using wrong URL
- **Fix**: Update MCP config to use Windows host IP:
  ```json
  "args": ["--browser-url=http://10.255.255.254:9222"]
  ```

## 📝 Technical Details

**Why this happens:**
- WSL2 runs in a Hyper-V virtual machine
- Windows and WSL2 have separate network interfaces
- Windows: Physical network adapter
- WSL2: Virtual ethernet adapter (vEthernet)
- Connection path: WSL2 → Windows vEthernet → Windows Firewall → Chrome

**What the fix does:**
- `--remote-debugging-address=0.0.0.0`: Chrome listens on all interfaces (not just 127.0.0.1)
- Firewall rule: Allows TCP connections on port 9222 from any source
- WSL2 can reach Windows via the virtual network gateway IP

## ✅ After Setup

Once configured, Chrome DevTools MCP will work consistently across sessions. Just remember to:
1. Start Chrome with the batch script (or WSL command)
2. Verify port 9222 is accessible: `curl http://10.255.255.254:9222/json/version`
3. Use MCP tools normally

No more connection issues!
