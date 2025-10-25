@echo off
REM Chrome DevTools Launcher for WSL2 MCP
REM Double-click this file to start Chrome with remote debugging

echo ================================================
echo  Chrome DevTools Launcher for WSL2 MCP
echo ================================================
echo.

REM Kill existing Chrome instances
echo Closing existing Chrome instances...
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Chrome with remote debugging...
echo Port: 9222
echo URL: http://localhost:3000
echo.

REM Start Chrome with remote debugging
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9222 ^
  --remote-debugging-address=0.0.0.0 ^
  --user-data-dir="%TEMP%\chrome-debug-profile" ^
  "http://localhost:3000/dashboard/example/builder"

echo.
echo Chrome started!
echo DevTools: http://localhost:9222
echo.
pause
