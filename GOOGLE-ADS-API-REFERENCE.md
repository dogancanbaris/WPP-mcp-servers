# Google Ads API v21 - Complete Reference

## Overview

This document outlines all available operations through the Google Ads API v21 for the MCP server implementation.

**API Version:** v21 (Latest as of Oct 2025)
**Authentication:** OAuth 2.0 + Developer Token
**Customer Account:** 2191558405

---

## Authentication Setup ✅

**Completed:**
- ✅ OAuth Client ID & Secret (reused from GSC)
- ✅ OAuth Scope added: `https://www.googleapis.com/auth/adwords`
- ✅ Developer Token: `_rj-sEShX-fFZuMAIx3ouA`
- ✅ Refresh Token obtained with Google Ads scope
- ✅ API Connection tested successfully

---

## MCP Tools to Implement

### Category 1: Account & Access Management (5 tools)

#### 1.1 `list_accessible_accounts` ✅ TESTED
**Description:** List all Google Ads accounts accessible with current credentials
**Type:** Read
**Risk:** None
**Returns:**
- Customer IDs (resource names)
- Account accessibility

**Agent Guidance:**
- Always run this first to discover available accounts
- Use returned customer IDs for all subsequent operations

#### 1.2 `get_account_info`
**Description:** Get detailed information about a specific account
**Type:** Read
**Risk:** None
**Returns:**
- Account name
- Currency code
- Time zone
- Manager account status
- Descriptive name

#### 1.3 `get_account_hierarchy`
**Description:** Get manager account structure
**Type:** Read
**Risk:** None
**Returns:**
- Parent accounts
- Child accounts
- Account relationships

#### 1.4 `list_account_labels`
**Description:** List all labels applied to accounts
**Type:** Read
**Risk:** None

#### 1.5 `get_account_budget_summary`
**Description:** Get account-level budget overview
**Type:** Read
**Risk:** None
**Returns:**
- Total budget across campaigns
- Spend to date
- Remaining budget
- Budget utilization %

---

### Category 2: Campaign Management (8 tools)

#### 2.1 `list_campaigns`
**Description:** List all campaigns with status and performance summary
**Type:** Read
**Risk:** None
**Returns:**
- Campaign ID, name, status
- Campaign type (Search, Display, Video, Shopping, Performance Max)
- Start/end dates
- Budget assignment
- Bidding strategy
- Serving status

**Agent Guidance:**
- Use this to discover all campaigns before making changes
- Check status before modifications
- Identify campaign type before applying type-specific changes

#### 2.2 `get_campaign_details`
**Description:** Get comprehensive details for a specific campaign
**Type:** Read
**Risk:** None
**Returns:**
- All campaign settings
- Targeting parameters
- Ad rotation settings
- URL options
- Tracking template

#### 2.3 `create_campaign`
**Description:** Create a new campaign
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow
**Parameters:**
- Campaign name
- Campaign type
- Budget ID
- Bidding strategy
- Targeting settings

**Agent Guidance:**
⚠️ SAFETY NOTES:
- Verify budget exists before creating campaign
- Default to paused status for new campaigns
- Always set end date for test campaigns
- Confirm targeting settings to avoid overspend

💡 BEST PRACTICES:
- Start with small daily budget for testing
- Use descriptive naming convention
- Set up conversion tracking before launch
- Review all settings in dry-run preview

#### 2.4 `update_campaign_status`
**Description:** Pause, enable, or remove a campaign
**Type:** Write
**Risk:** Medium-High
**Requires:** Approval workflow

**Agent Guidance:**
⚠️ CRITICAL WARNINGS:
- Pausing campaigns stops all ad delivery immediately
- Enabling campaigns resumes spend immediately
- Removing campaigns is irreversible - use with extreme caution
- Check current performance before pausing high-performing campaigns

📊 RECOMMENDED WORKFLOW:
1. Get current campaign performance
2. Check current spend status
3. Preview impact of status change
4. Get user approval
5. Execute change
6. Monitor for next 30 minutes

#### 2.5 `update_campaign_settings`
**Description:** Modify campaign configuration
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow
**Can modify:**
- Campaign name
- Start/end dates
- Ad rotation
- URL expansion settings
- Tracking parameters

#### 2.6 `get_campaign_targeting`
**Description:** Get targeting settings for campaign
**Type:** Read
**Risk:** None
**Returns:**
- Location targeting
- Language targeting
- Device targeting
- Ad schedule
- Audience targeting

#### 2.7 `update_campaign_targeting`
**Description:** Modify campaign targeting
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow

**Agent Guidance:**
⚠️ WARNING: Changing targeting can significantly impact delivery
- Narrow targeting reduces reach but improves relevance
- Broad targeting increases reach but may reduce quality
- Location changes affect eligibility immediately
- Language changes affect ad serving instantly

#### 2.8 `delete_campaign`
**Description:** Permanently remove a campaign
**Type:** Write (Destructive)
**Risk:** HIGH
**Requires:** Approval workflow + confirmation

**Agent Guidance:**
🚨 DESTRUCTIVE OPERATION:
- Cannot be undone
- All campaign history is lost
- All ads and keywords are deleted
- Use remove/pause instead of delete when possible
- Export campaign data before deletion

📋 REQUIRED CHECKS:
1. Confirm campaign has no recent conversions
2. Export campaign settings for backup
3. Verify user really wants permanent deletion
4. Double-check campaign ID is correct

---

### Category 3: Budget Management (6 tools)

#### 3.1 `list_budgets`
**Description:** List all campaign budgets
**Type:** Read
**Risk:** None
**Returns:**
- Budget ID, name
- Amount (daily average)
- Delivery method (standard/accelerated)
- Assigned campaigns
- Current spend
- Utilization %

#### 3.2 `get_budget_details`
**Description:** Get detailed info for specific budget
**Type:** Read
**Risk:** None
**Returns:**
- All budget configuration
- Spending history
- Assigned campaigns
- Recommended budget

#### 3.3 `create_budget`
**Description:** Create new campaign budget
**Type:** Write
**Risk:** Low-Medium
**Requires:** Approval workflow
**Parameters:**
- Budget name
- Amount (micro currency)
- Delivery method

**Agent Guidance:**
💡 BEST PRACTICES:
- Use clear naming: "Campaign Name - $XX/day"
- Start conservative for new campaigns
- Consider account-level budget constraints
- Standard delivery recommended for most cases

#### 3.4 `update_budget`
**Description:** Modify existing budget amount
**Type:** Write
**Risk:** HIGH
**Requires:** Approval workflow

**Agent Guidance:**
🚨 CRITICAL - THIS AFFECTS SPEND:
- Increasing budget increases potential daily spend
- Decreasing budget may pause ads if already spent more
- Changes take effect immediately
- Monitor closely for 24-48 hours after changes

⚠️ SAFETY CHECKS:
- Get current spend before modifying
- Calculate % change (flag if >20%)
- Check if campaigns are currently delivering
- Verify budget not already exhausted today
- Confirm user understands spend impact

💰 SPEND IMPACT CALCULATION:
- Show current daily budget
- Show new daily budget
- Calculate difference ($X/day more/less)
- Estimate monthly impact ($X * 30)
- Show % change

📊 RECOMMENDED WORKFLOW:
1. Check current campaign performance
2. Get current spend vs budget
3. Calculate recommended budget based on goals
4. Preview change with spend impact
5. Get user approval with dollar amounts clear
6. Execute change
7. Monitor spend for next 2 days

#### 3.5 `get_budget_recommendations`
**Description:** Get Google's budget recommendations
**Type:** Read
**Risk:** None
**Returns:**
- Recommended budget amount
- Reason for recommendation
- Expected performance impact

#### 3.6 `assign_budget_to_campaign`
**Description:** Assign or reassign budget to campaign
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow

---

### Category 4: Keyword Management (7 tools)

#### 4.1 `list_keywords`
**Description:** List all keywords across ad groups
**Type:** Read
**Risk:** None
**Returns:**
- Keyword text, match type, status
- Bids (CPC)
- Quality Score
- Performance metrics
- Ad group assignment

#### 4.2 `get_keyword_performance`
**Description:** Detailed keyword performance metrics
**Type:** Read
**Risk:** None
**Returns:**
- Impressions, clicks, CTR
- Cost, conversions, conversion rate
- Average CPC, average position
- Quality Score breakdown
- Search impression share

#### 4.3 `add_keywords`
**Description:** Add keywords to an ad group
**Type:** Write
**Risk:** Low-Medium
**Requires:** Approval workflow
**Parameters:**
- Ad group ID
- Keyword text
- Match type (EXACT, PHRASE, BROAD)
- Max CPC bid

**Agent Guidance:**
💡 BEST PRACTICES:
- Start with EXACT and PHRASE match before BROAD
- Set conservative max CPC initially
- Add negative keywords proactively
- Group related keywords in same ad group
- Use keyword research before adding

⚠️ SPEND WARNINGS:
- BROAD match can trigger on many variations (higher spend risk)
- PHRASE match offers balance of reach and control
- EXACT match is most controlled but limited reach

#### 4.4 `remove_keywords`
**Description:** Remove keywords from ad groups
**Type:** Write
**Risk:** Low
**Requires:** Approval workflow

**Agent Guidance:**
- Prefer pausing keywords over deletion (can be re-enabled)
- Export performance data before removal
- Consider adding as negative keyword elsewhere

#### 4.5 `update_keyword_bids`
**Description:** Modify keyword-level bid amounts
**Type:** Write
**Risk:** Medium-High
**Requires:** Approval workflow

**Agent Guidance:**
🚨 AFFECTS SPEND & DELIVERY:
- Higher bids = more clicks but higher cost
- Lower bids = fewer clicks but lower cost
- Changes affect auction eligibility immediately

📊 RECOMMENDED WORKFLOW:
1. Get current keyword performance
2. Calculate target CPA or ROAS
3. Get bid simulation (preview impact)
4. Show spend impact estimate
5. Get approval
6. Execute change
7. Monitor for 3-7 days

#### 4.6 `add_negative_keywords`
**Description:** Add negative keywords to prevent unwanted matches
**Type:** Write
**Risk:** Low (saves money)
**Requires:** Approval workflow

**Agent Guidance:**
💡 BEST PRACTICES:
- Use search terms report to find negatives
- Apply at campaign or account level for broad blocking
- Be careful with BROAD match negatives (can block too much)
- Review negative keyword conflicts before adding

#### 4.7 `get_keyword_ideas`
**Description:** Get keyword suggestions from Google Ads Keyword Planner
**Type:** Read
**Risk:** None
**Returns:**
- Keyword suggestions
- Search volume estimates
- Competition level
- Suggested bid ranges

---

### Category 5: Ad Management (6 tools)

#### 5.1 `list_ads`
**Description:** List all ads across ad groups
**Type:** Read
**Risk:** None
**Returns:**
- Ad ID, type, status
- Ad copy (headlines, descriptions)
- Final URLs
- Performance metrics
- Approval status

#### 5.2 `get_ad_performance`
**Description:** Detailed ad-level performance
**Type:** Read
**Risk:** None
**Returns:**
- Impressions, clicks, CTR
- Cost, conversions
- Ad strength
- Policy approval status

#### 5.3 `create_responsive_search_ad`
**Description:** Create Responsive Search Ad (RSA)
**Type:** Write
**Risk:** Low-Medium
**Requires:** Approval workflow
**Parameters:**
- Ad group ID
- Headlines (3-15)
- Descriptions (2-4)
- Final URL
- Display path

**Agent Guidance:**
💡 BEST PRACTICES:
- Use 10-15 unique headlines for best performance
- Include keywords in headlines
- Use at least 3-4 descriptions
- Pin key messaging to position 1 if needed
- Test different combinations

⚠️ REQUIREMENTS:
- Minimum 3 headlines, 2 descriptions
- Maximum 15 headlines, 4 descriptions
- Each headline max 30 characters
- Each description max 90 characters

#### 5.4 `update_ad_status`
**Description:** Pause or enable ads
**Type:** Write
**Risk:** Low-Medium
**Requires:** Approval workflow

**Agent Guidance:**
- Pausing ads stops delivery but preserves ad
- Check ad performance before pausing top performers
- Enable new ads gradually to monitor performance

#### 5.5 `update_ad_copy`
**Description:** Modify ad text/headlines/descriptions
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow + re-review

**Agent Guidance:**
⚠️ TRIGGERS RE-REVIEW:
- Ad goes back through approval process
- May be temporarily unavailable during review
- Performance history resets
- Consider creating new ad variation instead

#### 5.6 `delete_ad`
**Description:** Remove ad from ad group
**Type:** Write (Destructive)
**Risk:** Medium
**Requires:** Approval workflow

**Agent Guidance:**
- Prefer pausing over deletion
- Export performance data before deleting
- Cannot recover deleted ads

---

### Category 6: Performance Reporting (10 tools)

#### 6.1 `get_campaign_performance`
**Description:** Campaign-level performance metrics
**Type:** Read
**Risk:** None
**Parameters:**
- Customer ID
- Campaign ID (optional - all if omitted)
- Date range
- Metrics to include

**Returns:**
- Impressions, clicks, CTR
- Cost, conversions, conversion value
- Cost per conversion
- Average CPC
- Conversion rate
- ROAS (Return on Ad Spend)

**Dimensions:**
- By campaign
- By date
- By device
- By network (Search, Display, Shopping)

#### 6.2 `get_keyword_performance_report`
**Description:** Keyword-level performance across campaigns
**Type:** Read
**Risk:** None
**Returns:**
- All campaign performance metrics
- Plus: Quality Score, search impression share
- Expected CTR, ad relevance, landing page experience

#### 6.3 `get_ad_performance_report`
**Description:** Ad-level performance metrics
**Type:** Read
**Risk:** None
**Returns:**
- Performance by ad
- Ad strength ratings
- Headline/description performance

#### 6.4 `get_search_terms_report`
**Description:** Actual search queries that triggered ads
**Type:** Read
**Risk:** None
**Returns:**
- Search query text
- Match type used
- Performance metrics
- Add as keyword option
- Add as negative option

**Agent Guidance:**
💡 EXTREMELY VALUABLE FOR:
- Finding negative keywords
- Discovering new keyword opportunities
- Understanding user intent
- Identifying wasted spend on irrelevant queries

#### 6.5 `get_auction_insights`
**Description:** Competitor performance comparison
**Type:** Read
**Risk:** None
**Returns:**
- Impression share
- Overlap rate
- Outranking share
- Position above rate
- Top of page rate

#### 6.6 `get_geographic_performance`
**Description:** Performance by location
**Type:** Read
**Risk:** None
**Returns:**
- Performance metrics by country/region/city
- Location targeting details

#### 6.7 `get_device_performance`
**Description:** Performance by device type
**Type:** Read
**Risk:** None
**Returns:**
- Desktop metrics
- Mobile metrics
- Tablet metrics
- Device bid adjustments

#### 6.8 `get_time_performance`
**Description:** Performance by time segments
**Type:** Read
**Risk:** None
**Returns:**
- Hour of day performance
- Day of week performance
- Ad schedule effectiveness

#### 6.9 `get_landing_page_performance`
**Description:** Performance by landing page URL
**Type:** Read
**Risk:** None
**Returns:**
- Landing page URLs
- Performance metrics per page
- Mobile-friendliness

#### 6.10 `get_conversion_report`
**Description:** Conversion tracking and attribution
**Type:** Read
**Risk:** None
**Returns:**
- Conversion actions
- Conversion count/value
- Cost per conversion
- Conversion rate
- Attribution model used

---

### Category 7: Bidding & Optimization (5 tools)

#### 7.1 `get_bidding_strategy`
**Description:** Get current bidding strategy for campaign
**Type:** Read
**Risk:** None
**Returns:**
- Strategy type
- Target CPA/ROAS if applicable
- Portfolio bid strategy if used

#### 7.2 `update_bidding_strategy`
**Description:** Change campaign bidding strategy
**Type:** Write
**Risk:** HIGH
**Requires:** Approval workflow

**Agent Guidance:**
🚨 HIGH IMPACT OPERATION:
- Changing bid strategy affects all keywords in campaign
- Can dramatically change spend and performance
- May cause temporary performance fluctuations
- Learning period of 7-14 days after change

⚠️ SAFETY CHECKS:
- Verify sufficient conversion data for automated strategies
- Check campaign has been running >2 weeks
- Confirm target CPA/ROAS is realistic
- Warn about learning period impact

💡 BEST PRACTICES:
- Don't change bidding strategies frequently (<30 days)
- Monitor closely for 2 weeks after change
- Have at least 30 conversions before using Target CPA
- Have sufficient conversion value data for Target ROAS

#### 7.3 `set_target_cpa`
**Description:** Set Target CPA bidding with specific cost target
**Type:** Write
**Risk:** HIGH
**Requires:** Approval workflow

**Agent Guidance:**
📊 REQUIREMENTS:
- Campaign needs 30+ conversions in last 30 days
- Realistic target based on historical CPA
- Allow 7-14 day learning period

#### 7.4 `set_target_roas`
**Description:** Set Target ROAS bidding with return goal
**Type:** Write
**Risk:** HIGH
**Requires:** Approval workflow

**Agent Guidance:**
📊 REQUIREMENTS:
- Campaign needs 50+ conversions with value in last 30 days
- Realistic ROAS target based on historical data
- Requires conversion value tracking

#### 7.5 `get_bid_simulation`
**Description:** Preview impact of bid changes
**Type:** Read
**Risk:** None
**Returns:**
- Estimated impressions at different bids
- Estimated clicks at different bids
- Estimated cost at different bids

**Agent Guidance:**
💡 USE BEFORE BID CHANGES:
- Shows expected impact of bid adjustments
- Helps set realistic bids
- Prevents over/under-bidding

---

### Category 8: A/B Testing & Experiments (5 tools)

#### 8.1 `list_experiments`
**Description:** List all campaign experiments
**Type:** Read
**Risk:** None
**Returns:**
- Experiment ID, name, status
- Base campaign
- Trial campaign
- Traffic split %
- Start/end dates
- Status

#### 8.2 `create_experiment`
**Description:** Set up campaign experiment (A/B test)
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow
**Parameters:**
- Base campaign ID
- Experiment name
- Traffic split % (e.g., 50/50)
- Start/end date (max 85 days)
- Changes to test

**Agent Guidance:**
💡 A/B TESTING BEST PRACTICES:
- Run experiments for at least 2 weeks
- Use 50/50 split for equal comparison
- Test one variable at a time
- Ensure sufficient traffic for statistical significance
- Maximum 5 experiments per campaign (1 active at a time)

📊 EXPERIMENT TYPES:
- Bidding strategy comparison
- Ad copy variations
- Landing page testing
- Audience targeting tests
- Keyword match type tests (new single-campaign method in 2025)

⚠️ SPLIT OPTIONS:
- Cookie-based: User sees only one version (more accurate)
- Search-based: Faster results but less accurate

#### 8.3 `get_experiment_results`
**Description:** Get experiment performance comparison
**Type:** Read
**Risk:** None
**Returns:**
- Control arm metrics
- Treatment arm(s) metrics
- Statistical significance
- Performance delta
- Recommended action

#### 8.4 `end_experiment`
**Description:** Conclude experiment and optionally apply changes
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow
**Options:**
- End and keep original
- End and apply changes
- Promote trial to new campaign

#### 8.5 `create_experiment_arms`
**Description:** Create control and treatment arms for experiment
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow

**Agent Guidance:**
⚠️ MUST CREATE ALL ARMS IN SINGLE REQUEST
- Cannot use partial failure
- All arms share traffic split
- Traffic percentages must sum to 100%

---

### Category 9: Asset & Extension Management (4 tools)

#### 9.1 `list_assets`
**Description:** List all assets (images, videos, text)
**Type:** Read
**Risk:** None
**Returns:**
- Asset ID, type, name
- Asset content
- Performance metrics
- Approval status

#### 9.2 `upload_asset`
**Description:** Upload new asset
**Type:** Write
**Risk:** Low
**Requires:** Approval workflow
**Supports:**
- Images (various sizes)
- Videos
- Text assets
- Lead form assets

#### 9.3 `list_ad_extensions`
**Description:** List all extensions/assets
**Type:** Read
**Risk:** None
**Returns:**
- Sitelinks
- Callouts
- Structured snippets
- Call extensions
- Location extensions
- Performance data

#### 9.4 `create_ad_extension`
**Description:** Create extension
**Type:** Write
**Risk:** Low
**Requires:** Approval workflow

---

### Category 10: Audience & Targeting (4 tools)

#### 10.1 `list_audiences`
**Description:** List available audiences
**Type:** Read
**Risk:** None
**Returns:**
- Remarketing lists
- Custom audiences
- In-market audiences
- Affinity audiences
- Life events

#### 10.2 `update_audience_targeting`
**Description:** Modify audience targeting for campaign/ad group
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow

#### 10.3 `update_location_targeting`
**Description:** Modify geographic targeting
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow

**Agent Guidance:**
⚠️ AFFECTS ELIGIBILITY:
- Adding locations increases reach
- Removing locations stops delivery there
- Changes take effect immediately

#### 10.4 `update_device_bid_adjustments`
**Description:** Set bid modifiers by device
**Type:** Write
**Risk:** Medium
**Requires:** Approval workflow
**Parameters:**
- Device type
- Bid adjustment % (-90% to +900%)

**Agent Guidance:**
💡 COMMON ADJUSTMENTS:
- Mobile: -20% to +50% based on mobile conversion rate
- Desktop: Often baseline (0%)
- Tablet: -30% to +30%

---

### Category 11: Conversion Tracking (3 tools)

#### 11.1 `list_conversion_actions`
**Description:** List all conversion actions
**Type:** Read
**Risk:** None
**Returns:**
- Conversion action name, ID
- Conversion category
- Counting method
- Attribution model
- Value settings

#### 11.2 `create_conversion_action`
**Description:** Set up new conversion tracking
**Type:** Write
**Risk:** Low
**Requires:** Approval workflow

#### 11.3 `import_offline_conversions`
**Description:** Upload offline conversion data
**Type:** Write
**Risk:** Low
**Requires:** Approval workflow

---

## Agent Guidance System Implementation

### Method 1: Enhanced Tool Descriptions (RECOMMENDED)

Each tool description includes:
```
{tool purpose}

⚠️ SAFETY NOTES:
- {risk factors}
- {spend impact warnings}

💡 BEST PRACTICES:
- {recommended approach}
- {tips for success}

📊 RECOMMENDED WORKFLOW:
1. {step by step process}

🚨 CRITICAL WARNINGS:
- {destructive operations}
- {irreversible actions}
```

### Method 2: Validation Layer with Contextual Help

Tool handlers check for risky patterns and provide guidance:
```typescript
if (budgetIncrease > 20%) {
  warnings.push("⚠️ Large budget increase detected (>20%). Consider gradual increases of 10-15% to allow algorithm optimization.");
}

if (changingBiddingStrategy && campaignAge < 14) {
  warnings.push("⚠️ Campaign is less than 14 days old. Bidding strategy changes are not recommended during initial learning period.");
}
```

### Method 3: MCP Resources for Documentation

Create readable resources:
- `google_ads_best_practices` - General best practices
- `budget_change_guidelines` - Budget modification rules
- `bid_strategy_guide` - When to use each strategy
- `experiment_guide` - A/B testing methodology

Agents can read these resources before using tools.

---

## Risk Classification

### 🟢 Low Risk (No Approval Needed)
- All read/reporting operations
- Listing operations
- Getting details/summaries
- Bid simulations (preview only)

### 🟡 Medium Risk (Approval with Preview)
- Adding keywords
- Creating campaigns (paused)
- Pausing campaigns
- Budget increases <20%
- Adding negative keywords
- Creating ads

### 🔴 High Risk (Approval + Confirmation)
- Budget increases >20%
- Changing bidding strategies
- Enabling campaigns
- Deleting keywords
- Budget decreases that may pause delivery

### 🚨 Critical Risk (Multiple Confirmations)
- Deleting campaigns
- Deleting budgets in use
- Removing conversion tracking
- Bulk deletions

---

## Total Tools Planned: ~40

**Breakdown:**
- Account Management: 5 tools
- Campaign Management: 8 tools
- Budget Management: 6 tools
- Keyword Management: 7 tools
- Ad Management: 6 tools
- Performance Reporting: 10 tools
- Bidding & Optimization: 5 tools
- A/B Testing: 5 tools
- Asset Management: 4 tools
- Audience & Targeting: 4 tools
- Conversion Tracking: 3 tools

**Read Operations:** ~25 tools (safe, immediate value)
**Write Operations:** ~15 tools (require approval workflows)

---

## Implementation Priority

### Phase 1: Read-Only (Immediate Value, No Risk)
1. list_accessible_accounts ✅ TESTED
2. list_campaigns
3. get_campaign_performance
4. get_keyword_performance_report
5. get_search_terms_report
6. list_budgets
7. get_ad_performance
8. get_auction_insights

### Phase 2: Safe Writes (Low Risk)
1. add_negative_keywords (saves money)
2. create_campaign (paused status)
3. add_keywords (with conservative bids)
4. create_responsive_search_ad

### Phase 3: Controlled Writes (Medium Risk)
1. update_campaign_status
2. update_budget (<20% changes)
3. update_keyword_bids
4. update_ad_status

### Phase 4: High-Impact Writes (After Thorough Testing)
1. update_bidding_strategy
2. Large budget modifications
3. create_experiment
4. Deletion operations

---

Last Updated: 2025-10-17
API Version: Google Ads API v21
Status: Research Complete, Ready for Implementation
Next Step: Build infrastructure and Phase 1 tools
