#!/bin/bash
#
# WPP Analytics Platform - Service Status Checker
# Quickly checks if services are running on correct ports
#
# Usage: bash check-services.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}=== WPP Analytics Platform Service Status ===${NC}"
echo ""

# Check port 3000
echo -e "${BLUE}Port 3000 (Frontend):${NC}"
PORT_3000=$(netstat -tulpn 2>/dev/null | grep ":3000 " | awk '{print $7}' | cut -d'/' -f1 | head -1)
if [ -n "$PORT_3000" ]; then
    echo -e "  ${GREEN}Status: RUNNING${NC} (PID: $PORT_3000)"
    PROCESS_INFO=$(ps -p $PORT_3000 -o comm=,args= 2>/dev/null | head -1)
    echo "  Process: $PROCESS_INFO"
else
    echo -e "  ${RED}Status: NOT RUNNING${NC}"
fi
echo ""

# Check port 3001
echo -e "${BLUE}Port 3001 (MCP Server):${NC}"
PORT_3001=$(netstat -tulpn 2>/dev/null | grep ":3001 " | awk '{print $7}' | cut -d'/' -f1 | head -1)
if [ -n "$PORT_3001" ]; then
    echo -e "  ${GREEN}Status: RUNNING${NC} (PID: $PORT_3001)"
    PROCESS_INFO=$(ps -p $PORT_3001 -o comm=,args= 2>/dev/null | head -1)
    echo "  Process: $PROCESS_INFO"
else
    echo -e "  ${RED}Status: NOT RUNNING${NC}"
fi
echo ""

# Check port 3002
echo -e "${BLUE}Port 3002 (Should be FREE):${NC}"
PORT_3002=$(netstat -tulpn 2>/dev/null | grep ":3002 " | awk '{print $7}' | cut -d'/' -f1 | head -1)
if [ -n "$PORT_3002" ]; then
    echo -e "  ${YELLOW}Status: OCCUPIED${NC} (PID: $PORT_3002) - ${RED}SHOULD BE KILLED${NC}"
    PROCESS_INFO=$(ps -p $PORT_3002 -o comm=,args= 2>/dev/null | head -1)
    echo "  Process: $PROCESS_INFO"
else
    echo -e "  ${GREEN}Status: FREE${NC}"
fi
echo ""

# Health checks
echo -e "${BLUE}=== Health Checks ===${NC}"
echo ""

echo -e "${BLUE}MCP Server (/health):${NC}"
if command -v jq &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null)
    if [ -n "$HEALTH_RESPONSE" ]; then
        echo "$HEALTH_RESPONSE" | jq . 2>/dev/null || echo "  $HEALTH_RESPONSE"
    else
        echo -e "  ${RED}Not responding${NC}"
    fi
else
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health 2>/dev/null)
    if [ -n "$HEALTH_RESPONSE" ]; then
        echo "  $HEALTH_RESPONSE"
    else
        echo -e "  ${RED}Not responding${NC}"
    fi
fi
echo ""

echo -e "${BLUE}Frontend (/):${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "  ${GREEN}HTTP 200 OK${NC}"
else
    echo -e "  ${RED}Not responding (HTTP $FRONTEND_STATUS)${NC}"
fi
echo ""

# Recommendations
echo -e "${BLUE}=== Recommendations ===${NC}"
echo ""

NEEDS_RESTART=false

if [ -z "$PORT_3000" ] || [ -z "$PORT_3001" ]; then
    echo -e "  ${YELLOW}⚠ Some services are not running.${NC}"
    NEEDS_RESTART=true
fi

if [ -n "$PORT_3002" ]; then
    echo -e "  ${YELLOW}⚠ Port 3002 is occupied (should be free).${NC}"
    NEEDS_RESTART=true
fi

if [ "$NEEDS_RESTART" = true ]; then
    echo -e "  ${GREEN}→ Run:${NC} bash restart-dev-servers.sh"
    echo ""
else
    echo -e "  ${GREEN}✓ All services running correctly!${NC}"
    echo ""
fi
