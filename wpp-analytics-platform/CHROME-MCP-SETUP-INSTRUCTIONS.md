# 🔧 Chrome DevTools MCP - One-Time Fix (WSL2)

## The Problem

Chrome binds DevTools to `127.0.0.1:9222` (localhost only), which WSL2 cannot access.

```
netstat shows: TCP    127.0.0.1:9222         LISTENING  ❌
We need:       TCP    0.0.0.0:9222           LISTENING  ✅
```

## ✅ THE SOLUTION (Run Once)

### Option 1: Port Forwarding (Recommended - Keeps Visual Chrome)

**Run in Windows PowerShell as Administrator** (one time only):

```powershell
netsh interface portproxy add v4tov4 listenport=9223 listenaddress=0.0.0.0 connectport=9222 connectaddress=127.0.0.1
```

This creates a proxy: `0.0.0.0:9223` → `127.0.0.1:9222`

Then update Chrome DevTools MCP config to use port **9223** instead of 9222.

### Option 2: Run Chrome in WSL2 (Simpler)

Install Chrome in WSL2 and run it there:

```bash
# Install Chrome in WSL2 (one time)
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

# Run Chrome from WSL2 (every session)
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-wsl http://localhost:3000 &
```

Now MCP can connect to `http://127.0.0.1:9222` directly!

## 🎯 Quick Start Script

Once setup is done, run this from WSL2:

```bash
# Start Chrome with debugging (from WSL2)
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-wsl "http://localhost:3000/dashboard/example/builder" &

# Test MCP connection
sleep 3
curl http://127.0.0.1:9222/json/version

# Should see Chrome version JSON
```

## 🧪 Verify MCP Works

After setup, test these MCP commands:

```bash
# List pages
mcp__chrome-devtools__list_pages

# Take screenshot
mcp__chrome-devtools__take_screenshot

# Navigate
mcp__chrome-devtools__navigate_page --url="http://localhost:3000"
```

## Why This Happened

**Before (working)**: You likely had Chrome running in WSL2 Linux, or had port forwarding configured

**Now (broken)**: Chrome is running on Windows, binding to 127.0.0.1 only

**Fix**: Either run Chrome in WSL2 OR setup port forwarding from Windows

## Recommended: Install Chrome in WSL2

This is the cleanest solution - everything stays in Linux:

```bash
cd ~
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f  # Fix dependencies

# Test
google-chrome --version
```

Then just run Chrome from WSL2 terminal - MCP will work perfectly!
