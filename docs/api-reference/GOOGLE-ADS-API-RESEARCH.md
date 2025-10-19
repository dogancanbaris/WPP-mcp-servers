# Google Ads API Research & Integration Plan

## OAuth Compatibility with GSC

### Good News: Can Reuse OAuth Client Credentials ✅

**Same OAuth Client Can Be Used:**
- ✅ Client ID and Client Secret from GSC setup can be reused
- ✅ Same OAuth 2.0 application credentials work for both APIs
- ✅ Just need to add Google Ads API scope to the OAuth consent screen

**Additional Requirements:**
- ❌ **Developer Token Required** (22-character alphanumeric string)
- This is separate from OAuth and unique to Google Ads API
- Obtained from Google Ads Manager Account → API Center

### OAuth Scope Differences

**Google Search Console:**
- Current scope: `https://www.googleapis.com/auth/webmasters`

**Google Ads API:**
- Required scope: `https://www.googleapis.com/auth/adwords`

**Implementation:**
- Add Google Ads scope to existing OAuth consent screen
- Re-authorize to get tokens with both scopes
- Same OAuth client works for both APIs

---

## Developer Token Setup

### How to Get Developer Token

**Prerequisites:**
1. Must have a Google Ads **Manager Account** (MCC)
2. Access: TOOLS & SETTINGS → SETUP → API Center
3. Complete API Access form
4. Accept Terms and Conditions

**Token Characteristics:**
- 22-character alphanumeric string
- Free to obtain
- Required for ALL Google Ads API calls

### Access Levels

**Test Access (Default):**
- Granted immediately upon signup
- Works only with Test Accounts
- No approval needed
- Perfect for development and testing

**Basic Access:**
- Requires application review
- Works with production accounts
- Need to describe your use case
- Approval process can take several days

**Standard Access:**
- For large-scale applications
- Higher rate limits
- Requires more detailed application

### Testing Strategy

**Phase 1: Test Account (Immediate)**
1. Create test Google Ads Manager Account
2. Get developer token (automatic test access)
3. Build and test MCP server with test account
4. No approval needed - start immediately

**Phase 2: Production Access (After Testing)**
1. Apply for Basic Access
2. Describe WPP Media use case
3. Wait for approval
4. Switch to production accounts

---

## Google Ads API Capabilities (v21 - Latest)

### Latest Version Status
- **Current**: v21 (released August 2025)
- **Also Active**: v20, v19
- **Sunset Schedule**: v17 sunsets June 4, 2025

### Core Operations Categories

#### 1. Campaign Management
**Resources:**
- Campaigns (Search, Display, Video, Shopping, Performance Max, Demand Gen)
- Ad Groups
- Ads (Responsive Search Ads, Display Ads, Video Ads)
- Campaign Budgets
- Bidding Strategies

**Operations:**
- Create campaigns with various types
- Modify campaign settings (status, budget, bidding)
- Assign budgets to campaigns
- Set bid strategies (Target CPA, Target ROAS, Maximize Conversions)
- Campaign-level keyword match type control (v17+)

#### 2. Budget Management
**Capabilities:**
- Create campaign budgets
- Assign budgets to campaigns
- Modify average daily spend
- Budget recommendations
- Shared budgets across campaigns

**Safety Controls Possible:**
- Read current spend
- Set budget limits
- Monitor spend against limits
- Budget utilization reports

#### 3. Bidding & Optimization
**Bidding Strategies:**
- Maximize Clicks
- Target CPA (Cost Per Acquisition)
- Target ROAS (Return on Ad Spend)
- Maximize Conversions
- Enhanced CPC
- Manual CPC

**Advanced Features:**
- Bid simulations (what-if scenarios)
- Performance forecasting
- Automated bidding rules

#### 4. Keyword & Targeting
**Operations:**
- Add/remove keywords
- Set match types (exact, phrase, broad)
- Negative keywords
- Audience targeting
- Location targeting
- Demographic targeting
- Device targeting

#### 5. Reporting & Analytics
**Performance Metrics:**
- Impressions, clicks, CTR
- Cost, conversions, conversion value
- Average CPC, average position
- Quality Score
- Search impression share

**Reporting Dimensions:**
- Campaign, Ad Group, Ad, Keyword
- Date (hourly, daily, weekly, monthly)
- Geographic (country, region, city)
- Device (desktop, mobile, tablet)
- Network (Search, Display, Shopping)
- Time of day, day of week

**Report Types:**
- Campaign performance
- Keyword performance
- Search term reports
- Auction insights
- Placement reports
- Geographic reports
- Demographic reports

#### 6. Asset Management
**Assets:**
- Images
- Videos
- Text assets
- Sitelinks
- Callouts
- Structured snippets
- Call assets
- Location assets

#### 7. Conversion Tracking
**Operations:**
- Create conversion actions
- Track conversion goals
- Import offline conversions
- Conversion attribution settings
- Enhanced conversions

#### 8. Batch Operations
**Features:**
- Batch job processing
- Create entire campaigns in single operation
- Bulk keyword uploads
- Mass edits across multiple entities

---

## API Comparison: GSC vs Google Ads

| Feature | Google Search Console | Google Ads |
|---------|----------------------|------------|
| **Auth** | OAuth 2.0 only | OAuth 2.0 + Developer Token |
| **Scope** | `webmasters` | `adwords` |
| **Access Level** | Immediate | Test (immediate) or Basic (requires approval) |
| **Primary Use** | Organic search data | Paid advertising management |
| **Data Type** | Read-only analytics | Read + Write operations |
| **Risk Level** | Low (no spend) | High (can modify budgets/campaigns) |
| **Approval Needed** | No | Yes (for production accounts) |

---

## Integration Plan for Google Ads API

### Phase 1: Setup & Authentication (1-2 hours)

**Step 1: Update OAuth Consent Screen**
- Add scope: `https://www.googleapis.com/auth/adwords`
- Re-authorize to get tokens with both scopes
- Verify token includes both GSC and Ads scopes

**Step 2: Obtain Developer Token**
- Create Google Ads Manager Account (if not exists)
- Navigate to API Center
- Copy developer token
- Add to `.env` file: `GOOGLE_ADS_DEVELOPER_TOKEN=xxx`

**Step 3: Create Test Account**
- Create test manager account for development
- Link test accounts for safe testing
- No approval needed for test access

### Phase 2: API Client Implementation (3-4 hours)

**Create:**
- `src/ads/client.ts` - Google Ads API client
- `src/ads/types.ts` - TypeScript interfaces
- `src/ads/validation.ts` - Zod schemas

**Using:**
- `google-ads-api` npm package (official client library)
- Same OAuth tokens from GSC setup
- Developer token for authentication

### Phase 3: Tool Development (4-6 hours)

**Read Operations (Safe to Start):**
- `list_campaigns` - List all campaigns with status, budget, spend
- `get_campaign_performance` - Campaign metrics (impressions, clicks, cost, conversions)
- `get_keyword_performance` - Keyword-level performance
- `get_search_terms` - Search query reports
- `get_ad_performance` - Ad-level metrics
- `list_budgets` - List all budgets with utilization
- `get_account_summary` - Account-level overview

**Write Operations (Phase 2 - After Testing):**
- `update_campaign_status` - Pause/enable campaigns
- `update_budget` - Modify daily budget (with approval workflow)
- `create_campaign` - Create new campaigns
- `add_keywords` - Add keywords to ad groups
- `update_bids` - Modify keyword bids

### Phase 4: Safety Controls (Critical)

**Must Implement:**
1. **Spend Limits** - Hard caps on budget changes
2. **Approval Workflow** - Dry-run preview for all writes
3. **Budget Alerts** - Notify before exceeding thresholds
4. **Rollback Capability** - Undo recent changes
5. **Audit Logging** - Track all operations with spend impact

**Additional Safety:**
- Test account validation before production
- Read-only mode by default
- Explicit write permission required
- Daily/weekly spend summaries

---

## Google Ads API: What Can Be Done

### Read Operations (Low Risk)

**Account & Campaign Overview:**
- List all accessible accounts
- Campaign names, status, budget assignments
- Current spend vs budget
- Campaign performance metrics

**Performance Reporting:**
- Campaign-level metrics (impressions, clicks, cost, conversions)
- Ad group performance
- Keyword performance with Quality Scores
- Search term reports (actual user queries)
- Geographic performance
- Device performance
- Time-of-day performance
- Competitor auction insights

**Budget & Spend Analysis:**
- Current budgets across all campaigns
- Daily spend tracking
- Budget utilization percentage
- Forecast spend vs actual
- Shared budget allocations

**Asset & Creative Analysis:**
- Active ads and their performance
- Asset performance (images, videos, headlines)
- Ad strength ratings
- Responsive search ad combinations

### Write Operations (Higher Risk - Requires Approval)

**Campaign Management:**
- Create new campaigns
- Pause/enable campaigns
- Update campaign settings
- Change campaign types

**Budget Modifications:**
- Increase/decrease daily budgets
- Create new budgets
- Assign budgets to campaigns
- Remove budget assignments

**Bidding Changes:**
- Update bid strategies
- Modify target CPA/ROAS
- Change keyword bids
- Update ad group bids

**Content Changes:**
- Add/remove keywords
- Create/pause ads
- Update ad copy
- Add negative keywords
- Modify audience targeting

**Conversion Tracking:**
- Create conversion actions
- Import offline conversions
- Update conversion settings

---

## Risk Assessment

### Low Risk Operations (Safe to Implement First)
✅ List campaigns and accounts
✅ Get performance reports
✅ Search term analysis
✅ Keyword performance tracking
✅ Budget monitoring (read-only)
✅ Quality Score analysis

### Medium Risk Operations (Need Approval Workflow)
⚠️ Pause/enable campaigns
⚠️ Add keywords
⚠️ Add negative keywords
⚠️ Create new campaigns (with spend limits)
⚠️ Update ad copy

### High Risk Operations (Need Strong Controls)
❌ Increase budgets significantly
❌ Change bidding strategies
❌ Delete campaigns
❌ Modify conversion tracking
❌ Bulk operations without review

---

## Recommended Implementation Approach

### Start Small: Read-Only Google Ads Integration

**Immediate Value (No Risk):**
1. Connect to Google Ads API
2. Implement read-only reporting tools
3. Test with your own accounts
4. Validate data accuracy
5. Build confidence in the system

**Tools to Build First:**
- `list_accessible_accounts` - See all accounts you can access
- `get_campaign_summary` - Overview of all campaigns
- `get_campaign_performance` - Detailed campaign metrics
- `get_keyword_report` - Keyword-level performance
- `get_search_terms` - Search query mining
- `get_budget_status` - Budget utilization across accounts

### Later: Controlled Write Operations

**With Strong Safety Controls:**
- Dry-run previews showing exact changes
- Spend impact calculations
- User approval required
- Audit trail of all modifications
- Rollback capability
- Daily spend limits

---

## Next Steps to Test Google Ads API

### Option 1: Quick Test (Recommended)

**Using Your Existing OAuth Credentials:**

1. **Add Google Ads Scope to OAuth:**
   - Go to Google Cloud Console → OAuth Consent Screen
   - Add scope: `https://www.googleapis.com/auth/adwords`
   - Save changes

2. **Get Developer Token:**
   - Go to Google Ads → Tools → API Center
   - Copy your developer token
   - Add to `.env`: `GOOGLE_ADS_DEVELOPER_TOKEN=your-token-here`

3. **Re-run OAuth Setup:**
   - Run `npm run setup:auth` again
   - This will get new tokens with both GSC + Ads scopes
   - Existing GSC functionality remains unchanged

4. **Test API Access:**
   - I'll implement a simple test tool
   - Call `list_accessible_accounts` to verify it works
   - See what campaigns/data is available

**Time Required:** 30 minutes setup + 2 hours implementation

### Option 2: Full Implementation

Build complete Google Ads MCP server with:
- All read operations
- Write operations with approval
- Safety controls
- Multi-account support

**Time Required:** 2-3 days

---

## Estimation: What's Possible with Google Ads API

### Reporting & Analytics
- ✅ All campaign performance metrics
- ✅ Keyword-level analysis
- ✅ Search term reports
- ✅ Budget tracking and spend analysis
- ✅ Quality Score monitoring
- ✅ Auction insights
- ✅ Geographic performance
- ✅ Device performance
- ✅ Time-based analysis
- ✅ Conversion tracking data

### Campaign Management
- ✅ Create/modify campaigns
- ✅ Pause/enable campaigns
- ✅ Budget adjustments
- ✅ Bidding strategy changes

### Keyword Management
- ✅ Add/remove keywords
- ✅ Modify bids
- ✅ Add negative keywords
- ✅ Keyword recommendations

### Ad Management
- ✅ Create/pause ads
- ✅ Update ad copy
- ✅ Asset management
- ✅ Ad performance analysis

### Safety Features Available
- ✅ Read current state before changes
- ✅ Preview changes before execution
- ✅ Track spend impact
- ✅ Implement budget caps
- ✅ Audit all operations

---

## Recommendation

**Start with Quick Test (Option 1)**

Pros:
- Uses existing OAuth credentials
- Fast to implement (30 min setup)
- Low risk (read-only initially)
- Validates API access before full build
- Confirms developer token works
- See actual available data

Cons:
- Limited to read operations initially

**After Quick Test Success:**
- Decide whether to build full write operations
- Implement safety controls if proceeding
- Apply for Basic Access if needed for production

---

## Summary

**OAuth Credentials:** ✅ Can reuse existing GSC OAuth client
**Additional Requirements:** Developer token (easy to get)
**Access Level:** Test access immediate, production requires approval
**Capabilities:** Comprehensive - reporting, management, optimization
**Risk:** Manageable with proper controls
**Integration Effort:** Low (2-3 hours for read-only), Medium (2-3 days for full)

The same OAuth setup used for Google Search Console can absolutely be extended to Google Ads API. The main addition is the developer token, which is straightforward to obtain.

---

Last Updated: 2025-10-17
Next Action: Add Google Ads scope + get developer token to test API access
