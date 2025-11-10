# Google Ads MCP Tools - Testing Results

**Date:** November 9, 2025
**Test Account:** 204-173-8707 (Client account under manager 662-574-5756)
**Tools Tested:** 7 of 59
**Overall Status:** ✅ Core functionality working, error handling needs improvement

---

## Test Environment

**Manager Account:** 662-574-5756 (Test account)
**Client Account:** 204-173-8707 (Created manually - API doesn't support)
**Authentication:** TEST developer token with OAuth 2.0

---

## Issues Fixed During Testing

### 1. ✅ FIXED: Missing `campaign_bidding_strategy` Field
**Error:** `REQUIRED field was not present: campaign_bidding_strategy`
**Root Cause:** Implementation only set `bidding_strategy_type` but API requires full object
**Fix:** Added `manual_cpc` object with `enhanced_cpc_enabled: false`
**File:** `src/ads/client.ts:475-481`
**Status:** ✅ Resolved

### 2. ✅ FIXED: Missing EU Political Advertising Declaration
**Error:** `REQUIRED field was not present: contains_eu_political_advertising`
**Root Cause:** New mandatory field (Sept 3, 2025) for EU TTPA regulation
**Fix:** Added `contains_eu_political_advertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING'`
**File:** `src/ads/client.ts:481`
**Status:** ✅ Resolved

### 3. ✅ FIXED: Manager vs Client Account Hierarchy
**Error:** `OPERATION_NOT_PERMITTED_FOR_CONTEXT`
**Root Cause:** Campaigns can only be created in client accounts, not manager accounts
**Fix:** Created client account 204-173-8707 under manager 662-574-5756
**Status:** ✅ Resolved (manual account creation required)

### 4. ✅ FIXED: Client Account Access - Missing `login-customer-id`
**Error:** `USER_PERMISSION_DENIED: manager's customer id must be set in 'login-customer-id' header`
**Root Cause:** When accessing client accounts, must specify manager account in login-customer-id
**Fix:** Updated `getCustomer()` to always set `login_customer_id: '6625745756'`
**File:** `src/ads/client.ts:78-92`
**Status:** ✅ Resolved (hardcoded for testing, needs proper solution for production)

### 5. ⚠️ ISSUE: Account Creation Not Supported by Library
**Problem:** `google-ads-api` Node.js library doesn't expose `CustomerService.CreateCustomerClient`
**Attempted:** Created `createClientAccountTool` but library limitation prevents implementation
**Workaround:** Manual account creation via Google Ads UI
**Fix:** Removed the non-functional tool
**Status:** ⚠️ Library limitation - cannot be fixed without switching to REST API

---

## Tools Successfully Tested

### ✅ Account Management (2/2 tools tested)

**1. list_accessible_accounts**
- Status: ✅ Working
- Returns: Manager account 6625745756
- Notes: Properly lists accessible accounts

**2. get_account_info**
- Status: ✅ Working (with login-customer-id fix)
- Returns: Account details including test_account flag
- Notes: Requires login-customer-id for client accounts

### ✅ Budget Management (3/3 tools tested)

**3. create_budget**
- Status: ✅ Working
- Approval workflow: ✅ Working (dry-run → token → execute)
- Budgets created:
  - Dell Brand Budget: $250/day (ID: 15118753175)
  - Dell Performance Budget: $150/day (ID: 15118756283)
- Issue: Error message "undefined" on duplicate names (should show DUPLICATE_NAME)

**4. list_budgets**
- Status: ✅ Working
- Returns: All budgets with IDs, amounts, delivery method
- Notes: Properly formatted with guidance

**5. update_budget**
- Status: ⏳ Not yet tested
- Expected: Should work with approval workflow

### ✅ Campaign Management (2/4 tools tested)

**6. create_campaign**
- Status: ✅ Working
- Campaigns created:
  1. Dell Brand Protection (ID: 23245517498)
  2. Dell Laptop Sales (ID: 23249734522)
  3. Dell Desktop Sales (ID: 23240463318)
  4. Dell Accessories (ID: 23240465268)
  5. Dell Support Services (ID: 23249735701)
- Bidding strategy: ✅ Manual CPC with network settings
- EU compliance: ✅ Political advertising declaration included
- Issue: Error message "undefined" on duplicate names (should show DUPLICATE_CAMPAIGN_NAME)

**7. list_campaigns**
- Status: ✅ Working
- Returns: All campaigns with IDs, status, type
- Notes: Status/Type shown as numbers instead of readable strings (3 = PAUSED, 2 = SEARCH)

**8. update_campaign_status**
- Status: ⏳ Not yet tested

**9. get_campaign_performance**
- Status: ⏳ Not yet tested

---

## Issues Found - Need Fixing

### 🔴 CRITICAL: Error Messages Show "undefined"

**Problem:** When Google Ads API returns errors, our error handling shows:
```
Failed to create budget: undefined
Failed to create campaign: undefined
```

**Expected:** Should show actual Google Ads API error:
```
Failed to create budget: DUPLICATE_NAME - A campaign budget with this name already exists
Failed to create campaign: DUPLICATE_CAMPAIGN_NAME - Campaign name already assigned
```

**Impact:** Users can't diagnose issues
**Priority:** HIGH
**Files to fix:**
- `src/ads/client.ts` - All error catch blocks
- Pattern: `throw new Error(\`Failed to X: ${(error as Error).message}\`)`
- Should be: `throw error` or properly extract Google Ads API error details

### 🟡 MEDIUM: Status and Type Codes Not Human-Readable

**Problem:** list_campaigns shows:
```
Status: 3  (should be: PAUSED)
Type: 2    (should be: SEARCH)
```

**Expected:** Use enum mappings to show readable strings
**Impact:** Poor UX, harder to understand campaign state
**Priority:** MEDIUM
**Files to fix:**
- `src/ads/tools/reporting/list-campaigns.tool.ts` - Add enum to string conversion

### 🟡 MEDIUM: Hardcoded Manager Account ID

**Problem:** `getCustomer()` hardcodes `login_customer_id: '6625745756'`
**Current code:**
```typescript
const effectiveLoginCustomerId = loginCustomerId || '6625745756';
config.login_customer_id = effectiveLoginCustomerId;
```

**Production solution needed:**
1. Auto-detect if customer is under a manager
2. Query `customer_client_link` to find manager
3. OR require `loginCustomerId` parameter in all tools
4. OR store manager mapping in tool input

**Priority:** MEDIUM (works for testing, needs proper solution for production)
**Files to fix:**
- `src/ads/client.ts:86`

### 🟢 LOW: Missing Confirmation Token in Preview Output

**Problem:** create_ad_group preview doesn't show confirmation token in visible output
**Impact:** Token is likely in _meta but not displayed to user
**Priority:** LOW (functional, just UX issue)

---

## Test Coverage Summary

### Tested (7 tools)
- ✅ list_accessible_accounts
- ✅ get_account_info
- ✅ create_budget
- ✅ list_budgets
- ✅ create_campaign
- ✅ list_campaigns
- ⚠️ create_ad_group (preview working, confirmation pending)

### Not Yet Tested (52 tools)
- update_budget
- update_campaign_status
- get_campaign_performance
- create_ad_group (completion)
- update_ad_group
- list_ad_groups
- create_ad
- update_ad
- list_ads
- pause_ad
- add_keywords
- add_negative_keywords
- remove_keywords
- remove_negative_keywords
- list_keywords
- set_keyword_bid
- update_keyword_match_type
- update_keyword
- pause_keyword
- get_keyword_performance
- get_search_terms_report
- get_ad_group_performance
- get_ad_performance
- get_ad_group_quality_score
- update_ad_group_bid_modifier
- run_custom_report
- Conversion tools (5)
- Audience tools (4)
- Asset tools (1)
- Keyword planning tools (1)
- Bidding tools (1)
- Extension tools (13)
- Targeting tools (5)
- Bid modifier tools (4)

---

## Recommended Next Steps

### Phase 3: Complete Ad Group Testing
1. Fix confirmation token display issue
2. Create 2-3 ad groups per campaign
3. Test list_ad_groups
4. Test update_ad_group

### Phase 4: Keyword Testing
1. Test add_keywords (5-10 keywords per ad group)
2. Test list_keywords
3. Test add_negative_keywords
4. Test keyword bid management

### Phase 5: Ad Creation
1. Test create_ad (expanded text ads)
2. Test list_ads
3. Test update_ad
4. Test pause_ad

### Phase 6: Performance & Reporting
1. Test get_campaign_performance
2. Test get_keyword_performance
3. Test get_search_terms_report
4. Test run_custom_report

### Phase 7: Advanced Features
1. Test bidding strategies
2. Test targeting tools (location, language, demographic)
3. Test bid modifiers (device, location)
4. Test extensions (sitelinks, callouts)

### Phase 8: Fix Error Handling
1. Update all catch blocks in src/ads/client.ts
2. Properly extract and display Google Ads API errors
3. Add enum-to-string conversions for status/type fields
4. Test error scenarios (duplicates, invalid IDs, etc.)

---

## Production Readiness Checklist

### Before Production Deployment:

- [ ] Fix error message handling (show actual Google Ads errors)
- [ ] Remove hardcoded login-customer-id
- [ ] Implement proper manager account detection
- [ ] Add enum-to-string conversions (status, type, etc.)
- [ ] Test all 59 tools systematically
- [ ] Apply for BASIC/STANDARD developer token access
- [ ] Add input validation for all tools
- [ ] Implement rate limiting and quota management
- [ ] Add comprehensive logging for audit trail
- [ ] Document all tool limitations and requirements

---

## Current Test Data

**Account:** 204-173-8707
**Budgets:** 2
- Dell Brand Budget: $250/day (ID: 15118753175)
- Dell Performance Budget: $150/day (ID: 15118756283)

**Campaigns:** 5 (all PAUSED, all SEARCH type)
1. Dell Brand Protection (ID: 23245517498)
2. Dell Laptop Sales (ID: 23249734522)
3. Dell Desktop Sales (ID: 23240463318)
4. Dell Accessories (ID: 23240465268)
5. Dell Support Services (ID: 23249735701)

**Ad Groups:** 0 (next to create)
**Keywords:** 0
**Ads:** 0

---

## Key Learnings

1. **Google Ads API is strict** - Requires exact field configurations (bidding strategy, EU compliance)
2. **Account hierarchy matters** - Manager accounts cannot have campaigns
3. **Client account access requires login-customer-id** - Must specify manager when accessing clients
4. **Error handling is critical** - Generic "undefined" errors are not helpful
5. **Approval workflows work well** - Dry-run previews prevent accidental changes
6. **Interactive discovery is helpful** - Step-by-step parameter collection improves UX
7. **Test accounts are essential** - Production accounts blocked with TEST developer token

---

## Next Session TODO

1. Continue from Phase 3 (ad groups)
2. Fix error handling in client.ts (HIGH PRIORITY)
3. Complete systematic testing of all 59 tools
4. Document each tool's behavior and quirks
5. Create comprehensive test scenarios
6. Plan for production deployment with proper authentication

---

**Testing Progress:** 7/59 tools (12%)
**Status:** Foundation working, ready to continue systematic testing
