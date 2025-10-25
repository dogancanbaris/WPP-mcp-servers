# WPP MCP Platform - AI Agent Usage Guide

**Guide for Claude and other AI agents using MCP tools**

**Version:** 1.0
**For:** Claude Desktop, LLM agents, MCP clients
**Last Updated:** October 22, 2025

---

## Quick Start for AI Agents

### What You Have Access To

You (the AI agent) have access to **58 production-ready MCP tools** across 11 modules:

| Module | Tools | Purpose |
|--------|-------|---------|
| **Google Ads** | 25 | Campaign management, keyword research, bidding, budgets, reporting |
| **Search Console** | 18 | Performance analytics, URL inspection, sitemaps, indexing |
| **Google Analytics** | 8 | Traffic reports, real-time data, property admin |
| **BigQuery** | 3 | SQL queries, table creation, data loading |
| **Google Business Profile** | 2 | Location management, insights |
| **CrUX** | 1 | Core Web Vitals metrics |
| **SERP** | 1 | Google search results |
| **WPP Analytics** | 2 | Dashboard CRUD via frontend platform |

**Total:** 58 tools covering complete digital marketing intelligence platform.

---

## Tool Naming Convention

All tools follow this pattern:

```
{platform}_{entity}_{action}

Examples:
- google_ads_list_campaigns
- gsc_query_analytics
- ga_run_report
- bigquery_query
```

---

## Common Workflows & Tool Sequences

### Workflow 1: Weekly Performance Review

```
User: "Show me last week's Google Ads performance for account 1234567890"

Agent workflow:
1. Call: google_ads_campaign_performance_report
   Input: {customerId: "1234567890", dateRange: "LAST_7_DAYS"}

2. Process results, identify insights
3. Present summary with key metrics
```

**Tool Used:** `google_ads_campaign_performance_report`

**Input Schema:**
```json
{
  "customerId": "string (required)",
  "dateRange": "enum [TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, CUSTOM]",
  "metrics": ["clicks", "impressions", "cost_micros", "conversions", "ctr", "cpc"],
  "limit": "number (default: 100)"
}
```

**Output:**
```json
{
  "campaigns": [
    {
      "id": "12345",
      "name": "Brand Campaign",
      "clicks": 1234,
      "impressions": 45678,
      "cost": 5678.90,
      "conversions": 23,
      "ctr": 0.027,
      "cpc": 4.60
    }
  ],
  "summary": {
    "totalSpend": 12345.67,
    "totalConversions": 89,
    "avgROAS": 3.4
  }
}
```

---

### Workflow 2: Keyword Research & Planning

```
User: "Find keyword opportunities for 'email marketing software'"

Agent workflow:
1. Call: google_ads_generate_keyword_ideas
   Input: {seed_keywords: ["email marketing software"]}

2. Get top 20 ideas with search volume

3. Call: google_ads_get_keyword_forecasts
   Input: {keywords: [...top 20], cpc_bid: 5.00}

4. Present recommendations with estimated traffic/cost
```

**Tools Used:**
1. `google_ads_generate_keyword_ideas`
2. `google_ads_get_keyword_forecasts`

---

### Workflow 3: Budget Optimization

```
User: "Which campaigns should I increase budget for?"

Agent workflow:
1. Call: google_ads_campaign_performance_report
   Input: {customerId, dateRange: "LAST_30_DAYS"}

2. Analyze ROAS per campaign

3. Call: google_ads_get_budget_recommendations
   Input: {customerId}

4. If user approves:
   Call: google_ads_update_campaign_budget (requires approval!)
   Input: {customerId, campaignId, newBudget}

5. Snapshot created automatically
```

**⚠️ Safety Note:** Budget changes trigger approval workflow!

---

### Workflow 4: Cross-Platform Analysis

```
User: "Compare paid vs organic performance for my site"

Agent workflow:
1. Call: google_ads_keyword_performance_report
   Input: {customerId, dateRange: "LAST_30_DAYS"}

2. Call: gsc_query_analytics
   Input: {propertyUrl, startDate, endDate, dimensions: ["query"]}

3. Join data on search queries

4. Present insights:
   - Which queries have both paid & organic
   - Cannibalization analysis
   - Recommendations
```

**Tools Used:**
1. `google_ads_keyword_performance_report`
2. `gsc_query_analytics`

---

### Workflow 5: Technical SEO Audit

```
User: "Find indexing issues on example.com"

Agent workflow:
1. Call: gsc_get_index_coverage
   Input: {propertyUrl: "https://example.com"}

2. Call: gsc_get_core_web_vitals
   Input: {propertyUrl: "https://example.com"}

3. For errors found:
   Call: gsc_inspect_url
   Input: {propertyUrl, url: "https://example.com/problem-page"}

4. Present prioritized fix list
```

**Tools Used:**
1. `gsc_get_index_coverage`
2. `gsc_get_core_web_vitals`
3. `gsc_inspect_url`

---

## Safety System (Critical for Write Operations)

### 9-Layer Protection

When calling ANY write operation tool (budget changes, keyword additions, campaign creation), the safety system automatically:

1. **Account Authorization:** Verifies user has access
2. **Approval Workflow:** Shows preview, requires user confirmation
3. **Snapshot Creation:** Saves current state for rollback
4. **Financial Impact Calculation:** Shows cost projections
5. **Vagueness Detection:** Blocks unclear requests
6. **Pattern Matching:** Validates input formats
7. **Notifications:** Alerts stakeholders
8. **Audit Logging:** Records all changes
9. **Budget Caps:** Enforces spending limits

### Example: Budget Change Approval

```
User: "Increase budget for Campaign X to $500/day"

Agent: Call google_ads_update_campaign_budget
Input: {customerId, campaignId, newBudget: 500}

System Response:
{
  "status": "APPROVAL_REQUIRED",
  "preview": {
    "campaign": "Campaign X",
    "currentBudget": 200,
    "newBudget": 500,
    "dailyIncrease": 300,
    "monthlyImpact": 9000,
    "percentChange": 150
  },
  "approvalPrompt": "⚠️ Budget increase requires approval. Proceed? (yes/no)"
}

Agent: Present approval prompt to user

User: "yes"

Agent: Call tool again with approval=true

System Response:
{
  "status": "SUCCESS",
  "snapshotId": "snapshot_20251022_143022",
  "message": "✅ Budget updated. Rollback available via: rollback_to_snapshot('snapshot_20251022_143022')"
}
```

### Write Operations That Require Approval

- `google_ads_create_campaign`
- `google_ads_update_campaign_budget`
- `google_ads_update_bidding_strategy`
- `google_ads_add_keywords`
- `google_ads_update_keyword_bids`
- `google_ads_pause_campaign`
- `google_ads_remove_keywords`
- `gsc_request_indexing` (rate limited)
- Any tool with `create`, `update`, `delete`, `remove` in name

### Read-Only Operations (No Approval)

- All `list_*` tools
- All `get_*` tools
- All `query_*` tools
- All `_report` tools

---

## Tool Input Best Practices

### ✅ DO: Provide Complete Inputs

```json
// GOOD
{
  "customerId": "1234567890",
  "campaignId": "12345",
  "newBudget": 500,
  "reason": "High ROAS (4.2), want to scale"
}
```

### ❌ DON'T: Use Vague Inputs

```json
// BAD - Will be rejected by vagueness detector
{
  "customerId": "1234567890",
  "campaignId": "some campaign",  // ❌ Which campaign?
  "newBudget": "more"  // ❌ How much more?
}
```

### Required vs Optional Parameters

Check each tool's `inputSchema` for required parameters.

**Example:**

```typescript
// google_ads_list_campaigns
{
  customerId: "required",
  status: "optional (default: all)",
  limit: "optional (default: 100)"
}
```

---

## Error Handling

### Common Errors & Solutions

**1. "Insufficient permissions"**
```
Error: User does not have access to account 1234567890
```

**Solution:** User needs to grant OAuth access. Ask user to:
1. Run OAuth flow: `npm run setup:auth`
2. Approve permissions for Google Ads/GSC/Analytics

---

**2. "Customer ID not found"**
```
Error: Customer ID '1234567890' does not exist
```

**Solution:** First call `google_ads_list_accessible_customers` to get valid IDs.

---

**3. "Approval required"**
```
{status: "APPROVAL_REQUIRED", preview: {...}}
```

**Solution:** Show preview to user, get confirmation, call tool again with approval.

---

**4. "Vague request detected"**
```
Error: Request too vague. Please specify: campaign ID, exact budget amount
```

**Solution:** Ask user for missing details, then retry with complete input.

---

**5. "Rate limit exceeded"**
```
Error: Google Ads API rate limit (15000 requests/day) exceeded
```

**Solution:** Wait 1 hour, use caching, batch requests.

---

## Multi-Account Management

Many users have access to multiple Google Ads accounts (manager accounts, client accounts).

### Always List Accounts First

```
User: "Show me my campaigns"

Agent:
1. Call: google_ads_list_accessible_customers
2. Present list of accounts
3. Ask: "Which account?" (or auto-select if only 1)
4. Then call: google_ads_list_campaigns with chosen customerId
```

---

## Formatting Numbers for Readability

### Use Intelligence Metadata

Tools return raw values. Use formatting hints:

```json
// Tool returns:
{
  "ctr": 0.0217,  // Raw decimal
  "cost_micros": 5678900000  // Micros
}

// Format for user:
"CTR: 2.17%"  // Multiply by 100, add %
"Cost: $5,678.90"  // Divide by 1M, add $ and commas
```

### Common Conversions

- **CTR, Bounce Rate:** Multiply by 100, add %
- **Cost (micros):** Divide by 1,000,000
- **Duration (seconds):** Convert to "2m 34s" format
- **Large numbers:** Add commas every 3 digits

---

## Advanced Queries

### Custom GAQL (Google Ads Query Language)

Use `google_ads_query` for complex queries:

```
User: "Show me search terms that have >100 impressions but <1% CTR"

Agent: Call google_ads_query
Input: {
  customerId: "1234567890",
  query: `
    SELECT
      search_term_view.search_term,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr
    FROM search_term_view
    WHERE metrics.impressions > 100
      AND metrics.ctr < 0.01
      AND segments.date DURING LAST_30_DAYS
    ORDER BY metrics.impressions DESC
    LIMIT 100
  `
}
```

### BigQuery SQL

Use `bigquery_query` for cross-platform analysis:

```
User: "Show me total paid + organic clicks by day for last 30 days"

Agent: Call bigquery_query
Input: {
  query: `
    SELECT
      date,
      SUM(paid_clicks) AS paid,
      SUM(organic_clicks) AS organic,
      SUM(paid_clicks + organic_clicks) AS total
    FROM (
      SELECT date, clicks AS paid_clicks, 0 AS organic_clicks
      FROM \`project.dataset.google_ads_data\`
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)

      UNION ALL

      SELECT date, 0 AS paid_clicks, clicks AS organic_clicks
      FROM \`project.dataset.gsc_data\`
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    )
    GROUP BY date
    ORDER BY date
  `
}
```

---

## Rollback Operations

If user makes mistake or wants to undo change:

```
User: "Undo that budget change"

Agent:
1. Find snapshotId from previous operation response
2. Call: rollback_to_snapshot
   Input: {snapshotId: "snapshot_20251022_143022"}

3. System restores previous state

4. Confirm: "✅ Budget restored to $200/day"
```

**Important:** Snapshots are stored for 30 days, then auto-deleted.

---

## Complete Tool Reference

### Google Ads (25 tools)

**Account Management:**
- `google_ads_list_accessible_customers` - List all accounts
- `google_ads_get_account_info` - Account details
- `google_ads_get_account_hierarchy` - Manager → sub-account tree

**Campaigns:**
- `google_ads_list_campaigns` - List campaigns
- `google_ads_get_campaign` - Campaign details
- `google_ads_create_campaign` - Create campaign ⚠️
- `google_ads_update_campaign` - Update settings ⚠️
- `google_ads_pause_campaign` - Pause campaign ⚠️
- `google_ads_enable_campaign` - Enable campaign

**Budgets:**
- `google_ads_update_campaign_budget` - Change budget ⚠️
- `google_ads_get_budget_recommendations` - Budget suggestions

**Bidding:**
- `google_ads_update_bidding_strategy` - Change bid strategy ⚠️
- `google_ads_get_bid_simulations` - Predict bid impact

**Keywords:**
- `google_ads_list_keywords` - List keywords
- `google_ads_add_keywords` - Add keywords ⚠️
- `google_ads_update_keyword_bids` - Modify bids ⚠️
- `google_ads_pause_keywords` - Pause keywords ⚠️
- `google_ads_remove_keywords` - Delete keywords ⚠️

**Keyword Planning:**
- `google_ads_generate_keyword_ideas` - Get suggestions
- `google_ads_get_keyword_forecasts` - Predict performance

**Assets:**
- `google_ads_list_ad_assets` - List headlines/descriptions/images
- `google_ads_create_responsive_search_ad` - Create RSA ⚠️
- `google_ads_list_ad_extensions` - List extensions

**Audiences:**
- `google_ads_list_audiences` - List audiences
- `google_ads_create_audience` - Create audience ⚠️

**Conversions:**
- `google_ads_list_conversion_actions` - List conversions
- `google_ads_import_offline_conversions` - Upload conversions ⚠️

**Reporting:**
- `google_ads_query` - Custom GAQL queries
- `google_ads_campaign_performance_report` - Campaign metrics
- `google_ads_keyword_performance_report` - Keyword metrics
- `google_ads_search_terms_report` - Search queries
- `google_ads_geographic_performance_report` - Location metrics
- `google_ads_device_performance_report` - Device metrics

⚠️ = Requires approval (write operation)

### Search Console (18 tools)

**Properties:**
- `gsc_list_properties` - List verified sites
- `gsc_add_property` - Verify new site ⚠️
- `gsc_delete_property` - Remove site ⚠️

**Analytics:**
- `gsc_query_analytics` - Performance data (main reporting tool)
- `gsc_get_top_queries` - Top search queries
- `gsc_get_top_pages` - Top landing pages
- `gsc_get_device_breakdown` - Mobile/desktop/tablet
- `gsc_get_country_breakdown` - Performance by country

**URL Inspection:**
- `gsc_inspect_url` - Check indexing status
- `gsc_request_indexing` - Submit URL for indexing ⚠️

**Sitemaps:**
- `gsc_list_sitemaps` - List sitemaps
- `gsc_submit_sitemap` - Submit sitemap ⚠️
- `gsc_delete_sitemap` - Remove sitemap ⚠️
- `gsc_get_sitemap_status` - Sitemap health

**Other:**
- `gsc_get_mobile_usability_issues` - Mobile-friendly check
- `gsc_get_core_web_vitals` - LCP/FID/CLS metrics
- `gsc_get_index_coverage` - Indexed vs excluded pages
- `gsc_get_crawl_errors` - Crawl issues

### Analytics (8 tools)

**Reporting:**
- `ga_run_report` - Custom report builder
- `ga_run_realtime_report` - Real-time data (last 30 min)
- `ga_get_traffic_sources_report` - Source/medium breakdown
- `ga_get_top_pages_report` - Top landing pages

**Admin:**
- `ga_list_accounts` - List accounts
- `ga_list_properties` - List properties
- `ga_get_property_metadata` - Property details
- `ga_list_data_streams` - List data streams

### BigQuery (3 tools)

- `bigquery_query` - Execute SQL
- `bigquery_create_table` - Create table ⚠️
- `bigquery_load_data` - Load data ⚠️

### Other (4 tools)

- `gbp_list_locations` - List business locations
- `gbp_get_location_insights` - Location insights
- `crux_get_metrics` - Chrome UX Report metrics
- `serp_get_results` - Google search results

---

## Performance Tips

1. **Batch requests:** Use `google_ads_query` to get multiple campaigns in one call
2. **Use date ranges:** Limit to recent data (LAST_7_DAYS vs all-time)
3. **Set limits:** Default limit is 1000 rows, reduce if not needed
4. **Cache responses:** Don't re-fetch same data multiple times
5. **Check snapshots:** Snapshots are stored for 30 days max

---

## Getting Help

**For users:** See `PLATFORM-COMPLETE-GUIDE.md`
**For developers:** See `DEVELOPER-GUIDE.md`
**For complete API docs:** See `/docs/api-reference/`

**Tool-specific help:**
- Each tool has description field with usage guidance
- Input schema shows required/optional parameters
- Output type shows what to expect

---

## Example Conversations

### Conversation 1: Performance Analysis

```
User: "How are my Google Ads campaigns performing this week?"

Agent:
1. Call: google_ads_list_accessible_customers
2. If multiple accounts: "You have 3 accounts. Which one?"
3. User selects account
4. Call: google_ads_campaign_performance_report(customerId, LAST_7_DAYS)
5. Analyze results
6. Present: "This week (Oct 15-21):
   - Total Spend: $12,345
   - Total Conversions: 234
   - Avg ROAS: 3.2
   - Top Campaign: Brand (ROAS 8.4)
   - Worst Campaign: Generic (ROAS 1.2)
   Recommendation: Increase budget for Brand by 50%"
```

### Conversation 2: Keyword Research

```
User: "Find new keyword ideas for my email marketing product"

Agent:
1. Call: google_ads_generate_keyword_ideas(seed_keywords: ["email marketing"])
2. Get top 20 by search volume
3. Present ideas with volumes
4. User: "Get forecast for top 10 with $5 bid"
5. Call: google_ads_get_keyword_forecasts(keywords: [...10], cpc_bid: 5)
6. Present: "Forecast for next 30 days:
   - Estimated clicks: 450-650
   - Estimated cost: $2,250-$3,250
   - Estimated conversions: 18-27
   Want to add these keywords? (yes/no)"
7. If yes: Call google_ads_add_keywords (approval workflow triggers)
```

### Conversation 3: Technical SEO Fix

```
User: "Check why my page isn't ranking"

Agent:
1. Call: gsc_inspect_url(url: "https://example.com/page")
2. Result shows: "Not indexed - Crawl error 500"
3. "Your page has a server error (500). Google can't crawl it.
   Would you like me to:
   A) Check all pages for 500 errors
   B) Get list of impacted URLs"
4. User: "B"
5. Call: gsc_get_crawl_errors()
6. Present: "23 pages with 500 errors:
   - /page-1
   - /page-2
   ...
   Fix these server errors, then request re-indexing."
```

---

**For full platform documentation:** `PLATFORM-COMPLETE-GUIDE.md`
**Status:** ✅ 58 Tools Production Ready | **Version:** 1.0 | **Updated:** Oct 22, 2025
