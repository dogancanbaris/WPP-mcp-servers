#!/bin/bash
# Phase 1 Security Verification Script
# Run this before each testing session with real client data

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Phase 1 Security Verification for CLI Testing${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

ERRORS=0
WARNINGS=0

# ============================================================================
# 1. FILE PERMISSIONS
# ============================================================================
echo -e "${BLUE}1️⃣ Checking File Permissions...${NC}"

check_permission() {
  local file=$1
  local expected_perm=$2
  local description=$3

  if [ -f "$file" ]; then
    actual_perm=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null)
    if [ "$actual_perm" = "$expected_perm" ]; then
      echo -e "${GREEN}✅ $description ($file): $actual_perm${NC}"
    else
      echo -e "${RED}❌ $description ($file): $actual_perm (expected $expected_perm)${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  else
    echo -e "${YELLOW}⚠️ $description not found: $file${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
}

check_permission ".env" "600" ".env"
check_permission "config/gsc-tokens.json" "600" "OAuth tokens"
check_permission "config/service-account-key.json" "600" "Service account key"
check_permission "wpp-analytics-platform/frontend/.env.local" "600" "Frontend .env.local"

# ============================================================================
# 2. GIT SAFETY
# ============================================================================
echo ""
echo -e "${BLUE}2️⃣ Checking Git Safety...${NC}"

# Check .gitignore patterns
check_gitignore() {
  local pattern=$1
  local description=$2

  if grep -q "$pattern" .gitignore; then
    echo -e "${GREEN}✅ .gitignore includes: $description${NC}"
  else
    echo -e "${RED}❌ .gitignore missing: $description${NC}"
    ERRORS=$((ERRORS + 1))
  fi
}

check_gitignore "^\.env$" ".env"
check_gitignore "^\*\.json$" "*.json"
check_gitignore "service-account.*\.json" "service-account*.json"
check_gitignore "\*-key\.json" "*-key.json"

# Check if secrets are tracked
echo ""
if git ls-files | grep -qE "\.env$|config/.*token.*\.json|.*-key\.json|.*credential.*\.json"; then
  echo -e "${RED}❌ WARNING: Secrets are tracked by git!${NC}"
  git ls-files | grep -E "\.env$|token|key|credential" | while read file; do
    echo -e "${RED}   - $file${NC}"
  done
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No secrets tracked by git${NC}"
fi

# Check git status for untracked sensitive files
UNTRACKED_SECRETS=$(git status --porcelain | grep "^??" | grep -E "\.(env|json)$" | grep -vE "(package|tsconfig|gsc-config|safety-limits|notification-config|prohibited-operations)" || true)
if [ -n "$UNTRACKED_SECRETS" ]; then
  echo -e "${YELLOW}⚠️ Untracked files that might contain secrets:${NC}"
  echo "$UNTRACKED_SECRETS"
  WARNINGS=$((WARNINGS + 1))
fi

# ============================================================================
# 3. ENVIRONMENT VARIABLES
# ============================================================================
echo ""
echo -e "${BLUE}3️⃣ Checking Environment Variables...${NC}"

check_env_var() {
  local var_name=$1
  local description=$2
  local required=$3

  if [ -n "${!var_name}" ]; then
    echo -e "${GREEN}✅ $description set${NC}"
  else
    if [ "$required" = "true" ]; then
      echo -e "${RED}❌ $description not set (required)${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${YELLOW}⚠️ $description not set (optional)${NC}"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
}

# Load .env if exists
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

check_env_var "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_ID" "true"
check_env_var "GOOGLE_CLIENT_SECRET" "GOOGLE_CLIENT_SECRET" "true"
check_env_var "GOOGLE_SERVICE_ACCOUNT_PATH" "GOOGLE_SERVICE_ACCOUNT_PATH" "false"

# Verify service account key file exists
if [ -f "config/service-account-key.json" ]; then
  echo -e "${GREEN}✅ Service account key file exists${NC}"
else
  echo -e "${YELLOW}⚠️ Service account key file not found (may use env var path)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ============================================================================
# 4. CODE SECURITY CHECKS
# ============================================================================
echo ""
echo -e "${BLUE}4️⃣ Checking Code Security...${NC}"

# Check for hardcoded secrets in source code (exclude docs, dist, examples)
HARDCODED=$(grep -r "GOCSPX-[A-Za-z0-9_-]\{10,\}\|AIza[A-Za-z0-9_-]\{10,\}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "example\|\.example\|\.env" || true)
if [ -n "$HARDCODED" ]; then
  echo -e "${RED}❌ Hardcoded secrets found in source code!${NC}"
  echo "$HARDCODED" | head -3
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No hardcoded secrets in source code (src/ only)${NC}"
fi

# Note about docs (acceptable to have example secrets in documentation)
if grep -r "GOCSPX-" docs/ README.md PROJECT-BLUEPRINT.md 2>/dev/null | head -1 >/dev/null; then
  echo -e "${BLUE}ℹ️ Documentation files contain example secrets (acceptable)${NC}"
fi

# Check SQL injection protection
if grep -q "escapeSqlValue" wpp-analytics-platform/frontend/src/lib/data/query-builder.ts; then
  echo -e "${GREEN}✅ SQL injection protection implemented${NC}"
else
  echo -e "${RED}❌ SQL injection protection missing${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check service_role key usage
SERVICE_ROLE_USAGE=$(grep -r "SUPABASE_SERVICE_ROLE_KEY" wpp-analytics-platform/frontend/src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "\.env" | wc -l)
if [ "$SERVICE_ROLE_USAGE" -eq 0 ]; then
  echo -e "${GREEN}✅ No service_role key usage in frontend code${NC}"
else
  echo -e "${RED}❌ Service_role key used in $SERVICE_ROLE_USAGE locations${NC}"
  ERRORS=$((ERRORS + 1))
fi

# ============================================================================
# 5. LOGGER SANITIZATION
# ============================================================================
echo ""
echo -e "${BLUE}5️⃣ Checking Logger Sanitization...${NC}"

if grep -q "sanitizeData" src/shared/logger.ts; then
  echo -e "${GREEN}✅ Logger has token sanitization${NC}"
else
  echo -e "${YELLOW}⚠️ Logger may not sanitize tokens${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# ============================================================================
# 6. SAFETY FEATURES
# ============================================================================
echo ""
echo -e "${BLUE}6️⃣ Checking Safety Features...${NC}"

# Check safety system files exist
SAFETY_FILES=(
  "src/shared/approval-enforcer.ts"
  "src/shared/vagueness-detector.ts"
  "src/shared/account-authorization.ts"
  "config/safety-limits.json"
  "config/prohibited-operations.json"
)

for file in "${SAFETY_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ ${file##*/}${NC}"
  else
    echo -e "${RED}❌ Missing: $file${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

# ============================================================================
# FINAL REPORT
# ============================================================================
echo ""
echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}Security Check Summary${NC}"
echo -e "${BLUE}=================================================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo -e "${GREEN}Safe to proceed with client data testing!${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️ $WARNINGS warnings found${NC}"
  echo -e "${YELLOW}Review warnings before proceeding${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS critical errors found${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️ $WARNINGS warnings found${NC}"
  fi
  echo -e "${RED}FIX ERRORS BEFORE TESTING WITH CLIENT DATA${NC}"
  exit 1
fi
