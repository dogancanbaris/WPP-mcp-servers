#!/bin/bash
#
# WPP Analytics Platform - Development Server Restart Script
# Ensures correct port assignments:
#   - Port 3000: Frontend (Next.js dev server)
#   - Port 3001: MCP HTTP Server
#
# Usage: bash restart-dev-servers.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} INFO: $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} SUCCESS: $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} WARNING: $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ERROR: $1"
}

# Project paths
MCP_ROOT="/home/dogancanbaris/projects/MCP Servers"
FRONTEND_ROOT="$MCP_ROOT/wpp-analytics-platform/frontend"

echo ""
log_info "=========================================="
log_info "WPP Analytics Platform - Server Restart"
log_info "=========================================="
echo ""

# Step 1: Kill processes on ports 3000, 3001, 3002
log_info "Step 1: Checking for processes on ports 3000, 3001, 3002..."

for port in 3000 3001 3002; do
    # Find process using the port
    PID=$(lsof -ti:$port 2>/dev/null || true)

    if [ -n "$PID" ]; then
        log_warning "Port $port is in use by PID $PID"

        # Get process details
        PROCESS_NAME=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        log_info "Process name: $PROCESS_NAME"

        # Kill the process
        log_info "Killing process $PID on port $port..."
        kill -9 $PID 2>/dev/null || true

        # Wait and verify
        sleep 1
        if ! lsof -ti:$port > /dev/null 2>&1; then
            log_success "Successfully killed process on port $port"
        else
            log_error "Failed to kill process on port $port"
            exit 1
        fi
    else
        log_success "Port $port is free"
    fi
done

echo ""
log_success "All target ports are now free"
echo ""

# Step 2: Start MCP HTTP Server on port 3001
log_info "Step 2: Starting MCP HTTP Server on port 3001..."

cd "$MCP_ROOT"

# Check if dist/gsc/server-http.js exists
if [ ! -f "dist/gsc/server-http.js" ]; then
    log_error "MCP server build not found at dist/gsc/server-http.js"
    log_info "Building MCP server..."
    npm run build
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start MCP HTTP server in background
log_info "Starting MCP HTTP server..."
HTTP_PORT=3001 ENABLE_DEV_BYPASS=true nohup node dist/gsc/server-http.js > logs/mcp-http-server.log 2>&1 &
MCP_PID=$!

# Wait for server to start
sleep 3

# Verify MCP server is running
if lsof -ti:3001 > /dev/null 2>&1; then
    log_success "MCP HTTP Server started successfully on port 3001 (PID: $MCP_PID)"
    log_info "Log file: $MCP_ROOT/logs/mcp-http-server.log"
    log_info "Health check: curl http://localhost:3001/health"
else
    log_error "MCP HTTP Server failed to start on port 3001"
    log_error "Check logs at: $MCP_ROOT/logs/mcp-http-server.log"
    exit 1
fi

echo ""

# Step 3: Start Frontend on port 3000
log_info "Step 3: Starting Frontend on port 3000..."

cd "$FRONTEND_ROOT"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log_warning "node_modules not found, running npm install..."
    npm install
fi

# Start Next.js dev server in background
log_info "Starting Next.js dev server..."
PORT=3000 nohup npm run dev > "$MCP_ROOT/logs/frontend-dev-server.log" 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start (Next.js takes longer)
log_info "Waiting for Next.js to start (this may take 10-30 seconds)..."
sleep 15

# Verify frontend is running
MAX_ATTEMPTS=10
ATTEMPT=0
FRONTEND_RUNNING=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if lsof -ti:3000 > /dev/null 2>&1; then
        FRONTEND_RUNNING=true
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    log_info "Waiting for frontend... attempt $ATTEMPT/$MAX_ATTEMPTS"
    sleep 3
done

if [ "$FRONTEND_RUNNING" = true ]; then
    log_success "Frontend started successfully on port 3000 (PID: $FRONTEND_PID)"
    log_info "Log file: $MCP_ROOT/logs/frontend-dev-server.log"
    log_info "Access URL: http://localhost:3000"
else
    log_error "Frontend failed to start on port 3000"
    log_error "Check logs at: $MCP_ROOT/logs/frontend-dev-server.log"
    exit 1
fi

echo ""
log_info "=========================================="
log_success "All services started successfully!"
log_info "=========================================="
echo ""
log_info "Port Assignments:"
log_info "  - Port 3000: Frontend (Next.js) - http://localhost:3000"
log_info "  - Port 3001: MCP HTTP Server - http://localhost:3001/health"
echo ""
log_info "Process IDs:"
log_info "  - MCP Server: $MCP_PID"
log_info "  - Frontend: $FRONTEND_PID"
echo ""
log_info "Log Files:"
log_info "  - MCP Server: $MCP_ROOT/logs/mcp-http-server.log"
log_info "  - Frontend: $MCP_ROOT/logs/frontend-dev-server.log"
echo ""
log_info "To stop services:"
log_info "  kill -9 $MCP_PID $FRONTEND_PID"
log_info "  or run: bash restart-dev-servers.sh (to restart)"
echo ""
log_info "To check service status:"
log_info "  lsof -i :3000 -i :3001"
echo ""
log_info "To view logs in real-time:"
log_info "  tail -f $MCP_ROOT/logs/mcp-http-server.log"
log_info "  tail -f $MCP_ROOT/logs/frontend-dev-server.log"
echo ""
