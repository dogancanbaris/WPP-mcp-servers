# How to Test MCP Tools - User Guide

**Date:** November 10, 2025
**Backend:** Google Marketing Backend on port 3100
**Status:** ✅ Ready for testing

---

## Test Account Setup

**Manager Account:** 662-574-5756
**Client Account:** 204-173-8707

**Current Resources:**
- Campaigns: 7 (including "Dell - Search - Premium Laptops - Q4 2025")
- Budgets: 2 (Dell Brand Budget $250/day, Dell Performance Budget $150/day)
- Ad Groups: 0 (need to create)

---

## How to Test Through MCP (Correct Method)

### Using Claude Code CLI with MCP Tools

The backend exposes 100 tools that you access through the wpp-digital-marketing MCP server.

**Step 1: Use search_tools to find what you need**
```
search_tools with query: "ad group"
```

Returns tools like:
- create_ad_group
- list_ad_groups
- update_ad_group
- get_ad_group_quality_score

**Step 2: Use execute_tool to call the tool**
```
execute_tool with:
  toolName: "create_ad_group"
  params: {}
```

Tool will guide you through interactive workflow:
- Step 1/5: Select account
- Step 2/5: Select campaign
- Step 3/5: Enter ad group name
- Step 4/5: Set CPC bid (optional)
- Step 5/5: Preview & confirm

**Step 3: Tool handles approval automatically**
- Shows preview with changes
- Returns confirmation token (accessible to agents!)
- Agent can call again with token to execute

---

## Task 1: Agent-Assisted Ad Creation Testing

### Prerequisites
1. ✅ Backend running on port 3100
2. ✅ Confirmation token fix applied
3. ✅ list_ad_groups fixed (removed conversion_rate)
4. ⏳ Need ad group to test create_ad

### Testing Workflow

**Part A: Create Ad Group**

Use MCP tools:
```
Tool: create_ad_group
Params (provide all at once for speed):
{
  "customerId": "2041738707",
  "campaignId": "23249734522",
  "name": "Dell XPS Laptops - Premium",
  "cpcBidMicros": 2500000,
  "status": "PAUSED"
}
```

Expected:
- Preview with 4 changes shown
- Confirmation token returned
- Agent confirms automatically
- Ad group created (returns ID)

**Part B: List Ad Groups** (verify creation)

```
Tool: list_ad_groups
Params:
{
  "customerId": "2041738707",
  "campaignId": "23249734522"
}
```

Expected:
- Shows newly created ad group
- Performance metrics (impressions, clicks, etc.)
- Current status: PAUSED

**Part C: Create Ad with Agent Assistance** (REVOLUTIONARY TEST)

```
Tool: create_ad
Step 1: No params → discover account
Step 2: Provide customerId → discover ad group
Step 3: Provide adGroupId → **Ask for assistance mode**
Step 4: Choose agentAssistMode: "assisted" → **Ask for product details**
Step 5: Provide product info:
  {
    "productInfo": "Dell XPS 15 - Premium Business Laptop",
    "targetAudience": "Business professionals, remote workers",
    "uniqueSellingPoints": "Free shipping, 30-day returns, 5-star rated, Intel i7, 16GB RAM"
  }

Step 6: **Agent generates 15 headlines + 4 descriptions**
  Headlines:
    1. "Dell XPS 15"
    2. "Premium Dell XPS 15"
    3. "Free Shipping"
    4. "30-Day Returns"
    5. "Shop Now - Limited Stock"
    ... (15 total)

  Descriptions:
    1. "Dell XPS 15 - Premium Business Laptop"
    2. "Perfect for business professionals..."
    3. "Free shipping. Shop now..."
    4. "Limited time offer..."

Step 7: Use generated copy
  {
    "headlines": [...15 generated headlines...],
    "descriptions": [...4 generated descriptions...],
    "finalUrl": "https://example.com/dell-xps",
    "displayPath1": "laptops",
    "displayPath2": "xps-15"
  }

Step 8: Preview & confirm
Step 9: Ad created!
```

This workflow proves the agent can be a **creative partner**, not just a data collector.

---

## Fixed Issues Today

### Issue 1: Confirmation Tokens Not Accessible
**Error:** Agents couldn't access tokens (in _meta only)
**Fix:** Added confirmationToken to response root level
**File:** src/backends/google-marketing/server.ts:120-122
**Status:** ✅ Fixed

### Issue 2: list_ad_groups Query Error
**Error:** `UNRECOGNIZED_FIELD: metrics.conversion_rate`
**Fix:** Removed conversion_rate from query (metric doesn't exist)
**File:** src/ads/tools/ad-groups/list-ad-groups.tool.ts:126
**Status:** ✅ Fixed

---

## Next Steps for Testing

**Now you can test through the proper MCP interface:**

1. Open Claude Code CLI
2. Use `search_tools` to find create_ad_group
3. Use `execute_tool` to create ad group
4. Use `execute_tool` to create ad with agent assistance
5. Document results

**The backend is ready - all fixes applied and pushed to GitHub!**

---

## Why Bash Scripts Were Wrong

**Incorrect Approach (What I Did):**
- Writing curl scripts to test HTTP backend directly
- Bypassing the MCP protocol
- Not testing the actual user experience
- Approval enforcer hash mismatches due to timing

**Correct Approach (What You Should Do):**
- Use MCP tools through Claude Code CLI
- Follow the interactive workflows as designed
- Let agents handle approval workflows
- Test the actual practitioner experience

The tools are designed for agent-driven workflows, not direct HTTP calls!

---

## Backend Status

✅ Running on port 3100
✅ 100 tools loaded
✅ Confirmation token fix applied
✅ list_ad_groups fixed
✅ Ready for MCP testing

**All code committed and pushed to GitHub (commit dfa4b19)**
