# Google Ads Keyword Update Operations - Implementation Complete

**Date:** October 31, 2025
**Agent:** Agent 4 - Keyword Update Operations
**Task:** Implement 2 keyword update tools (`update_keyword`, `pause_keyword`)
**Status:** ✅ COMPLETE

---

## Overview

Implemented 2 MCP tools for updating existing Google Ads keywords, complementing the existing read and write operations.

### Tools Implemented

1. **`update_keyword`** - Comprehensive keyword update (match type, status, bid)
2. **`pause_keyword`** - Quick pause operation for underperforming keywords

---

## Files Created/Modified

### New Files

1. **`/src/ads/tools/keywords-update.ts`** (689 lines)
   - Contains both update tools with full interactive workflows
   - Integrated approval enforcement and vagueness detection
   - Rich agent guidance and discovery flows

### Modified Files

1. **`/src/ads/client.ts`**
   - Added `updateKeyword()` method - Updates keyword properties via Google Ads API
   - Added `listKeywords()` method - Queries keywords with detailed info for selection

2. **`/src/ads/tools/index.ts`**
   - Exported `updateKeywordTool` and `pauseKeywordTool`
   - Added to `googleAdsTools` array (main tool collection)
   - Added to `writeAdsTools` array (write operations requiring approval)

---

## Tool 1: update_keyword

### Purpose
Update a keyword's match type, status, or CPC bid. Flexible tool supporting single or multiple field updates.

### Interactive Discovery Flow

**Step 1: Account Selection**
- Lists all accessible Google Ads accounts
- User selects account containing keyword to update

**Step 2: Campaign Selection**
- Shows campaigns in selected account with status
- User selects campaign containing keyword

**Step 3: Ad Group Selection**
- Prompts for ad group ID (ad group listing tool not yet implemented)
- User provides ad group ID directly

**Step 4: Keyword Selection**
- Queries all keywords in ad group using `client.listKeywords()`
- Displays formatted list with:
  - Keyword text
  - Match type (EXACT, PHRASE, BROAD)
  - Status (ENABLED, PAUSED, REMOVED)
  - Max CPC bid or "Ad group default"
  - Resource name for API calls
- User selects keyword by providing resource name

**Step 5: Update Specification**
- Shows current keyword details
- Prompts for updates (can update multiple fields):
  - **Match Type**: Change between EXACT ↔ PHRASE ↔ BROAD
  - **Status**: Change between ENABLED ↔ PAUSED ↔ REMOVED
  - **Max CPC Bid**: Set keyword-level bid override (in dollars)

**Step 6: Dry-Run Preview**
- Builds change preview with approval enforcer
- Shows:
  - All field changes (before → after)
  - Risk warnings (e.g., BROAD match, large bid changes, REMOVED status)
  - Recommendations
- Generates confirmation token

**Step 7: Execution**
- User provides confirmation token
- Validates token with approval enforcer
- Calls `client.updateKeyword()` with updates
- Returns success with change summary

### Example Usage

**Change match type + adjust bid:**
```json
{
  "tool": "update_keyword",
  "customerId": "2191558405",
  "campaignId": "123456",
  "adGroupId": "789012",
  "keywordResourceName": "customers/2191558405/adGroupCriteria/789012~345678",
  "matchType": "PHRASE",
  "maxCpcDollars": 2.50
}
```

**Pause keyword (status change):**
```json
{
  "tool": "update_keyword",
  "customerId": "2191558405",
  "keywordResourceName": "customers/2191558405/adGroupCriteria/789012~345678",
  "status": "PAUSED"
}
```

### Risk Detection

**Match Type Risks:**
- Expanding to BROAD → Warning + recommendation to add negatives
- Shows impact of match type changes on reach and control

**Bid Change Risks:**
- Changes >50% → Warning about traffic fluctuation
- Calculates percent change and absolute difference

**Status Risks:**
- REMOVED status → Warning that it's permanent and irreversible
- Must recreate keyword to restore

---

## Tool 2: pause_keyword

### Purpose
Quick pause operation for underperforming keywords. Simplified version of `update_keyword` focused on stopping traffic immediately.

### Interactive Discovery Flow

**Steps 1-4:** Same as `update_keyword` (account → campaign → ad group → keyword selection)

**Step 5: Confirmation**
- Shows keyword details
- Checks if already paused (returns early if so)
- Builds dry-run preview with:
  - Status change: ENABLED → PAUSED
  - Recommendations (reversible, consider alternatives)
- Generates confirmation token

**Step 6: Execution**
- User provides confirmation token
- Calls `client.updateKeyword()` with `status: 'PAUSED'`
- Returns success message

### When to Use

**Performance Issues:**
- High cost, low conversions
- Low Quality Score (< 5)
- High CPC without returns

**Search Term Issues:**
- Triggering irrelevant searches
- Wrong intent clicks
- Cannibalizing other keywords

**Temporary Stops:**
- Seasonal keywords out of season
- Testing different strategies
- Budget preservation

### Pause vs Remove Decision

**PAUSE (Recommended):**
- ✅ Keyword stops serving immediately
- ✅ All data and history preserved
- ✅ Can be re-enabled anytime
- ✅ Reversible decision

**REMOVE:**
- ❌ Permanent deletion
- ❌ Must recreate to restore
- ❌ Loses historical Quality Score
- ❌ Irreversible decision

### Example Usage

```json
{
  "tool": "pause_keyword",
  "customerId": "2191558405",
  "campaignId": "123456",
  "adGroupId": "789012",
  "keywordResourceName": "customers/2191558405/adGroupCriteria/789012~345678"
}
```

---

## API Client Methods Added

### `client.updateKeyword()`

**Signature:**
```typescript
async updateKeyword(
  customerId: string,
  keywordResourceName: string,
  updates: {
    matchType?: string;
    status?: string;
    cpcBidMicros?: number;
  }
): Promise<any>
```

**Purpose:** Update keyword properties via Google Ads API

**Parameters:**
- `customerId`: Google Ads account ID (10 digits)
- `keywordResourceName`: Full resource name (e.g., `customers/123/adGroupCriteria/456~789`)
- `updates`:
  - `matchType`: EXACT, PHRASE, or BROAD
  - `status`: ENABLED, PAUSED, or REMOVED
  - `cpcBidMicros`: Bid in micros (1 USD = 1,000,000 micros)

**Returns:** API response from `customer.adGroupCriteria.update()`

**Implementation:**
```typescript
const operation: any = {
  resource_name: keywordResourceName,
};

if (updates.matchType) operation.keyword = { match_type: updates.matchType };
if (updates.status) operation.status = updates.status;
if (updates.cpcBidMicros) operation.cpc_bid_micros = updates.cpcBidMicros;

return await customer.adGroupCriteria.update([operation]);
```

### `client.listKeywords()`

**Signature:**
```typescript
async listKeywords(
  customerId: string,
  adGroupId?: string,
  campaignId?: string
): Promise<any[]>
```

**Purpose:** List keywords with details for selection in update operations

**Parameters:**
- `customerId`: Google Ads account ID
- `adGroupId`: (Optional) Filter to specific ad group
- `campaignId`: (Optional) Filter to specific campaign

**Returns:** Array of keyword view rows with:
- `ad_group_criterion.resource_name` - For API updates
- `ad_group_criterion.criterion_id` - Keyword ID
- `ad_group_criterion.keyword.text` - Keyword text
- `ad_group_criterion.keyword.match_type` - Match type
- `ad_group_criterion.status` - Status
- `ad_group_criterion.cpc_bid_micros` - Max CPC bid
- `ad_group.id` / `ad_group.name` - Ad group info
- `campaign.id` / `campaign.name` - Campaign info

**GAQL Query:**
```sql
SELECT
  ad_group_criterion.resource_name,
  ad_group_criterion.criterion_id,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group_criterion.status,
  ad_group_criterion.cpc_bid_micros,
  ad_group.id,
  ad_group.name,
  campaign.id,
  campaign.name
FROM keyword_view
WHERE ad_group_criterion.type = 'KEYWORD'
  [AND campaign.id = {campaignId}]
  [AND ad_group.id = {adGroupId}]
ORDER BY ad_group_criterion.keyword.text
```

---

## Safety Features

### 1. Approval Enforcement
- All updates require dry-run preview approval
- Confirmation tokens prevent accidental execution
- Detailed change summaries with before/after values

### 2. Vagueness Detection
- Ensures specific IDs provided (not vague references)
- Validates resource names and parameters
- Prevents bulk operations without clear context

### 3. Risk Warnings

**Match Type Changes:**
- BROAD match expansion → Spend increase warning
- Recommends negative keywords for BROAD

**Bid Changes:**
- Large changes (>50%) → Traffic fluctuation warning
- Shows percent change and absolute difference

**Status Changes:**
- REMOVED → Permanent deletion warning
- Recommends PAUSE as reversible alternative

### 4. Recommendations
- Alternative approaches (negatives, bid adjustments, match type changes)
- Best practices for keyword management
- Monitoring guidance

---

## Integration Points

### Exports in `/src/ads/tools/index.ts`

```typescript
// Keyword operations
export { addKeywordsTool, addNegativeKeywordsTool, listKeywordsTool, removeKeywordsTool } from './keywords.js';
export { updateKeywordTool, pauseKeywordTool } from './keywords-update.js';
```

### Tool Arrays

**`googleAdsTools` (main collection):**
- Added `updateKeywordTool`
- Added `pauseKeywordTool`

**`writeAdsTools` (write operations):**
- Added `updateKeywordTool`
- Added `pauseKeywordTool`

---

## Validation & Testing

### Input Validation
- Zod schemas not explicitly defined (using discovery flow)
- All parameters optional to enable step-by-step discovery
- Required parameters enforced at appropriate steps

### Error Handling
- Try-catch blocks in all handler functions
- Descriptive error messages with context
- Logging with `getLogger('ads.tools.keywords-update')`

### Test Scenarios

**Update Match Type:**
1. Call without params → Account discovery
2. Provide customerId → Campaign discovery
3. Provide campaignId → Ad group prompt
4. Provide adGroupId → Keyword selection (list shown)
5. Provide keywordResourceName → Update specification prompt
6. Provide matchType → Dry-run preview
7. Provide confirmationToken → Execute update

**Pause Keyword:**
1. Same discovery flow steps 1-4
2. Keyword selection → Dry-run preview
3. Provide confirmationToken → Execute pause

**Edge Cases:**
- Already paused keyword → Return early with message
- Keyword not found → Error with verification prompt
- No keywords in ad group → Guidance to add keywords
- Invalid resource name → Error with format example

---

## Documentation & Guidance

### Agent Guidance (Minimal - Per Router Architecture)

**Tool descriptions kept minimal for token efficiency:**
- `update_keyword`: "Update a keyword's match type, status, or CPC bid."
- `pause_keyword`: "Quickly pause a keyword to stop it from serving."

**Verbose guidance moved to tool responses** (injected when called):

**Match Type Guide:**
- EXACT: Most control, lowest reach, best for brand terms
- PHRASE: Balanced control and reach, recommended for most
- BROAD: Maximum reach, highest risk, needs negative keywords

**When to Pause:**
- High cost + low conversions
- Low Quality Score (< 5)
- Triggering irrelevant searches
- Seasonal or temporary adjustments

**Pause vs Other Options:**
- Add negative keywords (if bad searches)
- Lower bid (if too expensive)
- Change to EXACT match (if too broad)
- Improve ad relevance (if low QS)

---

## Next Steps & Recommendations

### Completed
- ✅ `update_keyword` tool with full discovery flow
- ✅ `pause_keyword` tool for quick operations
- ✅ Client methods: `updateKeyword()`, `listKeywords()`
- ✅ Integration in tool exports and arrays
- ✅ Approval enforcement and risk detection
- ✅ Comprehensive agent guidance

### Future Enhancements
1. **Bulk Update Tool** - Update multiple keywords at once
2. **Re-enable Keyword Tool** - Dedicated tool for PAUSED → ENABLED
3. **Match Type Migration** - Bulk migrate keywords to new match type
4. **Bid Adjustment Tool** - Percentage-based bid changes across keywords
5. **Quality Score Optimization** - Suggest updates based on QS components

### Related Tools to Create
- `list_ad_groups` - Simplify ad group discovery (currently manual ID entry)
- `get_keyword_details` - Detailed single keyword view before updating
- `get_keyword_history` - Show historical performance for informed decisions

---

## File Structure

```
src/ads/
├── client.ts                          [Modified - Added updateKeyword, listKeywords]
└── tools/
    ├── keywords.ts                    [Existing - Add, list, remove operations]
    ├── keywords-update.ts             [NEW - Update, pause operations]
    └── index.ts                       [Modified - Added exports]

docs/
└── google-ads-keyword-update-tools-implementation.md  [NEW - This file]
```

---

## Summary Statistics

**Lines of Code:**
- keywords-update.ts: 689 lines (2 tools)
- client.ts additions: ~115 lines (2 methods)
- index.ts additions: ~6 lines (exports + imports)

**Total:** ~810 lines of production code

**Tools Added:** 2
**Client Methods Added:** 2
**Discovery Steps:** 5-6 per tool
**Safety Features:** 4 (approval, vagueness, risks, recommendations)

**Completion Time:** ~2 hours
**Status:** ✅ Production-ready

---

**Agent 4: Keyword Update Operations - Task Complete** 🎯
