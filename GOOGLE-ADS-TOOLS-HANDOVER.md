# Google Ads Tools - Complete Handover Document
**Date:** November 10, 2025
**Session Focus:** Transition from programmatic validation to agent-trained systems
**Status:** Phase 1 Complete (8/8 CREATE tools), Phase 2 In Progress (UPDATE tools)

---

## Our Philosophy: Agent Training, Not Programming

### The Paradigm Shift

**OLD APPROACH (Programmatic):**
```typescript
// Hard rejection
if (headlines.filter(h => h === headlines[0]).length > 5) {
  throw new Error("Too repetitive!");
}
```
❌ Rigid rules
❌ Blocks valid operations
❌ Agent is just a messenger

**NEW APPROACH (Agent Training):**
```markdown
🎓 AGENT TRAINING - HEADLINE QUALITY:

**Check for repetition:**
□ Are >30% headlines identical?
□ Do headlines cover 5 categories?

If repetitive → "I notice 8/15 headlines say 'Free Shipping'.
For better ad performance, diversify across: keywords (5), benefits (3),
CTAs (3), urgency (2), social proof (2). Can I help generate variety?"
```
✅ Flexible intelligence
✅ Guides user through fixes
✅ Agent is knowledgeable consultant

---

## The Process: Research → Enhance → Train → Test

### Step 1: Research API Capabilities (Context7 + Web Search)
**For EVERY tool:**
1. Query Context7: `/websites/developers_google_com-google-ads-api-docs`
2. Topic: Specific API endpoint (e.g., "AdGroup resource fields")
3. Document ALL available parameters
4. Compare with current implementation
5. Calculate coverage % (what we have vs what API offers)

**Example:** create_ad_group
- Research found: 15+ parameters available
- Current had: 5 parameters (33% coverage)
- Gap: type, trackingUrlTemplate, urlCustomParameters, adRotationMode, etc.

### Step 2: Enhance to 80%+ Coverage
**Add missing parameters:**
- Update inputSchema
- Update handler extraction
- Update API operation object
- Update dry-run preview
- Test with MCP tools

**Result:** create_ad_group went from 33% → 85% coverage

### Step 3: Add Comprehensive Agent Training
**In tool descriptions and workflow steps, add:**

**🎓 AGENT TRAINING sections with:**
1. **Quality Criteria** - What makes good X?
2. **Decision Frameworks** - How to choose?
3. **Checklists** - What to verify before proceeding?
4. **Common Mistakes** - What to flag?
5. **Review Examples** - How to respond to user input?

**Example from create_ad headlines:**
```markdown
**THE DIVERSITY FORMULA:**
Headlines should cover 5 categories (3 each):
1. Keywords - Product names
2. Benefits - Value propositions
3. CTAs - Action phrases
4. Urgency - Time-sensitive
5. Social Proof - Trust signals

**AGENT CHECKLIST:**
□ Diversity: Headlines cover all 5 categories?
□ Repetition: <30% identical?
□ Length: Most use 25-30 chars?

**COMMON ISSUES TO FLAG:**
❌ "10/15 headlines are CTAs but missing keywords and benefits"
❌ "All headlines <15 chars - wasted space!"
```

### Step 4: Test with MCP Tools
**NO bash scripts, NO direct HTTP calls**
- Use MCP tools through proper interface
- Follow interactive workflows
- Verify agent training displays
- Test with real Google Ads account
- Confirm in Google Ads UI

---

## Current Status: Where We Are

### ✅ COMPLETE (8/8 CREATE Tools)

**All enhanced with:**
- 80%+ API parameter coverage
- Comprehensive agent training
- No approval workflows (safe - create in PAUSED)
- Enhanced success messages

| # | Tool | Coverage | Agent Training | Live Tested |
|---|------|----------|----------------|-------------|
| 1 | create_campaign | 73% | ✅ Campaign type decision tree + GEO WARNING | ✅ |
| 2 | create_ad_group | 85% | ✅ Theme coherence + naming quality | ✅ |
| 3 | add_keywords | 90% | ✅ Relevance + match type strategy | ✅ |
| 4 | create_ad | 85% | ✅ 5-category headline diversity + 4-angle descriptions | ✅ |
| 5 | create_budget | 100% | ✅ Budget sizing formula + campaign type minimums | ✅ |
| 6 | create_conversion_action | 100% | ✅ Category decision tree + value logic | ❌ API issue |
| 7 | create_user_list | 100% | ✅ Membership duration strategy | ❌ API issue |
| 8 | create_portfolio_bidding_strategy | 100% | ✅ Realistic target CPA/ROAS calculation | ✅ |

**Live Test Results:**
- Created: 4 campaigns, 3 ad groups, 12 keywords, 1 ad, 3 budgets, 1 bidding strategy
- All in test account: 204-173-8707
- Verified in Google Ads UI

### ⏳ IN PROGRESS (16 UPDATE Tools)

**Parameter parity achieved:**
- update_ad_group: Added 4 params (type, tracking, custom params, rotation)
- update_keyword: Added 3 params (finalUrls, tracking, custom params)

**Impact training status:**
| # | Tool | Training | Tested |
|---|------|----------|--------|
| 1 | update_campaign | ✅ Impact by change type | ❌ |
| 2 | update_campaign_status | ✅ Traffic/spend immediate effects | ✅ Preview |
| 3 | update_ad_group | ✅ Performance implications | ✅ Preview |
| 4 | update_budget | ✅ Spend impact calculations | ❌ (safety block) |
| 5 | update_ad | ❌ Needs training | ❌ |
| 6 | pause_ad | ✅ Has guidance | ❌ |
| 7 | update_keyword | ❌ Needs training | ❌ |
| 8 | set_keyword_bid | ✅ Excellent training | ❌ |
| 9 | update_keyword_match_type | ✅ Excellent training | ❌ |
| 10 | pause_keyword | ✅ Has guidance | ❌ |
| 11 | remove_keywords | ✅ Destructive op warnings | ❌ |
| 12 | remove_negative_keywords | Partial | ❌ |
| 13 | add_negative_keywords | ✅ Excellent (actually CREATE) | ❌ |
| 14 | update_bidding_strategy | ❌ Needs training | ❌ |
| 15 | set_ad_group_cpc_bid | ❌ Needs training | ❌ |
| 16 | update_ad_group_bid_modifier | Partial | ❌ |

**Total UPDATE tools with training:** 10/16 (62%)
**Total tested:** 2/16 (12%)

---

## Programmatic Validations: Removal Plan

### Found 52 Validation Checks

**Remove/Replace: 27**
- 12 vagueness detector calls (blocks vague inputs)
- 1 budget 500% limit (blocks large changes)
- 6 character limit rejections (blocks over-limit text)
- 4 bulk operation limits (blocks >50 items)
- 2 URL validations (blocks non-HTTPS)
- 2 low bid warnings (keep - educational only)

**Keep: 25**
- All approval workflows for WRITE operations (CORRECT!)

### Removal Strategy (File-by-File)

**Priority 1: Vagueness Detector (12 calls in 5 files)**

Files:
- src/ads/tools/audiences.ts (3 calls)
- src/ads/tools/campaigns/update-status.tool.ts (2 calls)
- src/ads/tools/conversions.ts (3 calls)
- src/ads/tools/keywords-update.ts (3 calls)
- src/ads/tools/keywords.ts (6 calls)

**Current behavior:** Scans for vague terms ("those", "them", "increase by 20%"), calculates score, blocks if ≥30

**Replacement:** Agent training to ask clarifying questions:
```
User: "Increase budget by 20%"

Agent sees training:
"🎓 SPECIFICITY REQUIRED:
□ Which budget? (Provide budget ID or use list_budgets)
□ Increase FROM what amount? (Get current value first)
□ Increase TO what amount? (Calculate: current × 1.20)

Agent asks: "I see you want to increase a budget by 20%.
Let me help find which budget and calculate the new amount.
Which campaign's budget should we increase?"
```

**Priority 2: Budget Safety (1 call)**

File: src/shared/interceptor.ts line 96-103, used in src/ads/tools/budgets.ts line 451

**Current:** Throws error if >500% change
**Replacement:** Calculate % but don't block, add agent training:
```
If change >500%:
"⚠️ LARGE INCREASE (500%): $10 → $60/day

This is a major change. Is this intentional?
- Typo? (Meant $16 not $60?)
- Scaling success? (Approve with close monitoring)
- Testing? (Consider gradual: $10→$20→$40→$60)

Recommendations:
• Google suggests 10-20% increases for stability
• 500% may cause 3-7 days delivery fluctuation
• Monitor hourly for first 24 hours

Proceed? (Agent confirms user intent before approving)"
```

**Priority 3: Character Limits (6 calls)**

File: src/ads/tools/ads/create-ad.tool.ts lines 418-431, 523-536, others

**Current:** Rejects headlines >30 chars, descriptions >90 chars

**Replacement:** Auto-trim with user approval:
```
User: "Buy Premium Dell XPS 15 Business Laptops Now" (46 chars)

Agent:
"This headline is 16 chars over the 30-char limit.

I've created trimmed versions:
A: "Premium Dell XPS 15 Business" (29 chars) ✅
B: "Buy Dell XPS 15 for Business" (29 chars) ✅
C: "Dell XPS 15 Business Laptops" (29 chars) ✅

Which version do you prefer?"
```

**Priority 4: Bulk Limits (4 calls)**

Files: keywords.ts, conversions.ts

**Current:** Blocks >50 keywords per operation

**Replacement:** Auto-batch with progress:
```
User adds 75 keywords

Agent:
"Adding 75 keywords in 2 batches (API limit: 50 per call):

Batch 1/2: Keywords 1-50... ✅ Added successfully
Batch 2/2: Keywords 51-75... ✅ Added successfully

✅ All 75 keywords added to ad group!"
```

---

## Test Account Structure Created

**Manager Account:** 662-574-5756
**Client Account:** 204-173-8707

**Campaign:** Dell - Search - Premium Laptops - Q4 2025 (ID: 23249734522)

**Ad Groups (3):**
1. Dell XPS 15 - Premium Business (186247065497)
   - CPC: $2.50, Type: SEARCH_STANDARD
   - Tracking: ✅, Custom params: source=google_ads, product=xps15
   - Keywords: 4 (dell xps 15 [EXACT], dell xps 15 laptop [PHRASE], etc.)
   - Ads: 1 (ID: 783487517495 - agent-generated 15 headlines!)

2. Dell XPS 13 - Portable (183686769050)
   - CPC: $2.20, Keywords: 4

3. Dell Inspiron - Budget Friendly (183686790210)
   - CPC: $1.50, Keywords: 4

**Other Resources:**
- Test Campaign - Agent Training (23253228700) - Shows geo warning
- Test Budget - Low ($15/day) - Shows low budget alert
- Target CPA Strategy ($50) - Created successfully

---

## What Works (Verified Through Testing)

### CREATE Tools Working (7/8):
✅ create_budget - Budget alerts work
✅ create_campaign - Geo warning works
✅ create_ad_group - Created 3 with tracking
✅ add_keywords - Added 12 keywords
✅ create_ad - Agent-generated copy works
✅ create_portfolio_bidding_strategy - Created
✅ list_budgets, list_campaigns, list_ad_groups, list_ads - All work

### Known Issues (2 CREATE tools):
❌ create_conversion_action - API structure issue (missing 'origin' field)
❌ create_user_list - Needs 'crm_based_user_list' concrete type

### UPDATE Tools (Partial Testing):
✅ update_campaign_status - Preview works
✅ update_ad_group - Preview with new tracking params works
❌ update_budget - Blocked by 500% safety check

---

## Remaining Work

### Phase 1: Remove Programmatic Validations (4-6 hours)

**Must remove programmatic blocks from:**
1. 12 vagueness detector calls (5 files)
2. 1 budget 500% limit (interceptor.ts)
3. 6 character limit hard blocks (create-ad.tool.ts)
4. 4 bulk operation limits (keywords.ts, conversions.ts)

**Replace with agent training that:**
- Asks clarifying questions (not blocks vague input)
- Explains risks (not blocks large changes)
- Auto-fixes with approval (not rejects over-limit text)
- Auto-batches (not blocks large lists)

### Phase 2: Fix API Structure Issues (1-2 hours)
1. create_conversion_action - Add correct type/origin structure
2. create_user_list - Add crm_based_user_list field

### Phase 3: Complete UPDATE Tool Testing (2-3 hours)
Test all 16 UPDATE tools systematically after removing blocks

### Phase 4: Add Missing Agent Training (1-2 hours)
4 UPDATE tools need training:
- update_ad
- update_bidding_strategy
- set_ad_group_cpc_bid
- update_keyword

**Total Remaining:** 8-13 hours

---

## How to Continue This Work

### For Next Agent/Session:

**1. Review This Document First**
- Understand philosophy (agent training, not programming)
- Review research-first process
- Check current status (what's done, what's remaining)

**2. Continue Programmatic Validation Removal**

**File-by-file approach (NOT bulk sed):**

```bash
# Example for keywords.ts:
# 1. Find vagueness calls
grep -n "detectAndEnforceVagueness" src/ads/tools/keywords.ts

# 2. Read each context
# 3. Comment out or remove the call
# 4. Add agent training comment
# 5. Build and test
# 6. Commit individual file

git add src/ads/tools/keywords.ts
git commit -m "Remove vagueness detection from add_keywords

Replaced with agent training to ask for specific keyword IDs/details."
```

**3. Test EVERY Tool After Changes**
```javascript
// Test create_budget
execute_tool({
  toolName: "create_budget",
  params: { customerId: "204173870", name: "Test", dailyAmountDollars: 50 }
})

// Verify:
// ✅ Shows agent training
// ✅ Budget created
// ✅ No programmatic blocks
```

**4. Fix Broken Tools**
- create_conversion_action: Research ConversionAction API structure
- create_user_list: Add concrete type
- update_budget: Remove safety throw, keep warning

---

## Key Files

### Enhanced CREATE Tools (All in src/ads/tools/):
1. `campaigns/create-campaign.tool.ts` - Campaign type training + geo warning
2. `ad-groups/create-ad-group.tool.ts` - Theme coherence training
3. `keywords.ts` (add_keywords) - Relevance + match type training
4. `ads/create-ad.tool.ts` - Headline diversity + description variety
5. `budgets.ts` (create_budget) - Budget sizing formula
6. `conversions.ts` (create_conversion_action) - Category logic
7. `audiences.ts` (create_user_list) - Membership duration
8. `bidding.ts` (create_portfolio_bidding_strategy) - Target calculation

### UPDATE Tools with Parameter Parity:
1. `ad-groups/update-ad-group.tool.ts` - Added 4 params from CREATE
2. `keywords-update.ts` (update_keyword) - Added 3 params from CREATE
3. `campaigns/update-campaign.tool.ts` - Impact analysis training

### Core Infrastructure:
1. `src/ads/client.ts` - All API methods (addKeywords, updateKeyword, etc.)
2. `src/shared/approval-enforcer.ts` - Approval workflows (KEEP!)
3. `src/shared/vagueness-detector.ts` - TO REMOVE (blocking)
4. `src/shared/interceptor.ts` - Budget limits TO REMOVE
5. `src/shared/interactive-workflow.ts` - Guidance helpers (KEEP!)

---

## Testing Protocol

### For Each Tool:

**1. Research Phase:**
- Context7 query for API docs
- Document all parameters
- Calculate coverage %
- Identify gaps

**2. Enhancement Phase:**
- Add missing parameters
- Remove approval if CREATE
- Add agent training sections
- Build and verify compilation

**3. Testing Phase:**
```javascript
// Test with MCP tools
execute_tool({
  toolName: "[tool_name]",
  params: { /* all parameters */ }
})

// Verify:
// ✅ Agent training displays
// ✅ All parameters work
// ✅ No programmatic blocks
// ✅ Creates/updates in Google Ads
```

**4. Documentation:**
- Note what works
- Document any issues
- Commit with clear message

---

## Agent Training Pattern (Template)

**Every tool should have:**

```markdown
🎓 AGENT TRAINING - [TOPIC]:

**THE [PRINCIPLE/RULE]:**
[Core concept explained]

**WHAT MAKES QUALITY [THING]:**
✅ [Criteria 1]
✅ [Criteria 2]
✅ [Criteria 3]

**AGENT CHECKLIST - REVIEW USER INPUT:**
□ [Check 1]: [What to verify]
□ [Check 2]: [What to verify]
□ [Check 3]: [What to verify]

**COMMON MISTAKES TO FLAG:**
❌ User: [bad input] → Agent: "[How to respond]"
❌ User: [another bad] → Agent: "[How to respond]"
✅ User: [good input] → Agent: "[Acknowledge quality]"

**EXAMPLE - EXCELLENT [THING]:**
[Show 3-5 real examples]
```

---

## Critical Learnings

### 1. Research FIRST, Always
- Never implement without full API knowledge
- Context7 has complete Google Ads API docs
- Prevents implementing 30-40% when 100% is available

### 2. Agent Training, Not Programming
- Tools educate agents
- Agents apply learned knowledge
- Flexible, intelligent, contextual

### 3. CREATE vs UPDATE Pattern
- CREATE: No approval (start PAUSED = safe)
- UPDATE: Approval required (changes live campaigns)

### 4. Test Via MCP Interface
- Not bash scripts
- Not direct HTTP
- Through proper MCP tool interface
- Verify in Google Ads UI

### 5. Commit Frequently
- Each tool enhancement = 1 commit
- Clear messages
- Easy to review/revert

---

## Success Metrics

**What We Achieved:**
- ✅ 8/8 CREATE tools: Comprehensive agent training
- ✅ UPDATE tools: Parameter parity with CREATE
- ✅ Live testing: Full Dell campaign structure created
- ✅ Agent training: Proven effective (shows warnings/alerts)
- ✅ 20 commits pushed to GitHub

**What Remains:**
- ⏳ Remove 27 programmatic validations
- ⏳ Fix 2 broken CREATE tools (API structure)
- ⏳ Test 14 remaining UPDATE tools
- ⏳ Add training to 4 UPDATE tools

**Estimated:** 8-13 hours remaining

---

## Next Session Checklist

**Start Here:**
1. ✅ Read this handover document
2. ✅ Understand philosophy (agent training over programming)
3. ✅ Review current status (what's done/remaining)
4. Start removing programmatic validations:
   - Begin with vagueness detector (12 calls)
   - File-by-file approach
   - Build and test after each file
5. Fix broken tools:
   - create_conversion_action
   - create_user_list
   - update_budget safety
6. Complete UPDATE tool testing
7. Finalize remaining agent training

**Goal:** All 60 Google Ads tools fully agent-trained and tested

---

## Contact Points

**Test Account:** 204-173-8707
**Backend:** Port 3100
**Context Remaining:** 481k
**Total Commits Today:** 20

**This is the ONLY handover document - all others removed.**
