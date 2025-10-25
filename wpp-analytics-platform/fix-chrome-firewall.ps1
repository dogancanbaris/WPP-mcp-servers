# Chrome DevTools WSL2 Firewall Fix
# Run this in PowerShell AS ADMINISTRATOR (one-time setup)

Write-Host "🔧 Configuring Windows Firewall for Chrome DevTools MCP..." -ForegroundColor Cyan

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "❌ ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Remove old rule if exists
Write-Host "Removing old firewall rule (if exists)..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "Chrome DevTools WSL2" -ErrorAction SilentlyContinue

# Create new firewall rule
Write-Host "Creating firewall rule for port 9222..." -ForegroundColor Yellow
New-NetFirewallRule `
    -DisplayName "Chrome DevTools WSL2" `
    -Direction Inbound `
    -LocalPort 9222 `
    -Protocol TCP `
    -Action Allow `
    -Profile Any `
    -Enabled True

Write-Host ""
Write-Host "✅ SUCCESS! Windows Firewall configured" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run start-chrome-debug.bat to launch Chrome with debugging"
Write-Host "2. From WSL2, test: curl http://10.255.255.254:9222/json/version"
Write-Host "3. Chrome DevTools MCP tools should now work!"
Write-Host ""
