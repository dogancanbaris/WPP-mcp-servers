# WPP Digital Marketing MCP - Project Backbone

## 🎯 Vision: The Command Center for Digital Marketing at Scale

This document defines **why we built this MCP server** and **how it will be used** by 1,000+ practitioners across the global WPP network to manage hundreds of client accounts with LLM-powered automation, safety, and intelligence.

---

## The Problem We're Solving

### Before MCP Server:

**A typical practitioner's workflow:**

1. **Data Collection (3 hours):**
   - Export Google Ads data → CSV
   - Export Search Console data → CSV
   - Export Google Analytics data → CSV
   - Export Facebook Ads data → CSV
   - Export TikTok Ads data → CSV
   - Manual downloads, one platform at a time

2. **Data Blending (2 hours):**
   - Open Excel/Google Sheets
   - Import 5 CSVs
   - Manual VLOOKUP to match search terms across platforms
   - Fix data formatting issues
   - Create pivot tables

3. **Analysis (1 hour):**
   - Review numbers manually
   - Calculate metrics
   - Identify trends
   - Make decisions

4. **Platform Changes (2 hours):**
   - Log into Google Ads → adjust budgets
   - Log into Search Console → submit sitemaps
   - Log into GA4 → configure tracking
   - Log into Facebook → update campaigns
   - Each platform separately

5. **Reporting (2 hours):**
   - Create PowerPoint slides
   - Copy/paste data and charts
   - Write insights manually
   - Format for client

**Total time:** 10 hours per week
**Annual cost per practitioner:** 500 hours × $50/hour = **$25,000/year**
**For 1,000 practitioners:** **$25 million/year in manual work**

### After MCP Server:

**Same workflow, LLM-powered:**

**Total time:** 30 minutes
**Annual savings:** $24,000/year per practitioner
**For 1,000 practitioners:** **$24 million/year saved**

---

## The Solution: MCP Server as Command Center

### Architecture Philosophy

```
                    ┌─────────────────────────┐
                    │    PRACTITIONER         │
                    │  (via Claude Code CLI)   │
                    └───────────┬─────────────┘
                                │
                    Single natural language request:
                    "Analyze search performance across all platforms"
                                │
                                ▼
              ┌─────────────────────────────────────┐
              │         MCP SERVER                   │
              │      (Command Center)                │
              │                                      │
              │  • Authorization (who can do what)  │
              │  • Safety (budget caps, approvals)  │
              │  • Orchestration (data flow)        │
              │  • Intelligence (LLM integration)   │
              └──┬──────────┬─────────┬────────┬───┘
                 │          │         │        │
                 ▼          ▼         ▼        ▼
            ┌────────┐ ┌────────┐ ┌──────┐ ┌──────┐
            │ Google │ │Facebook│ │TikTok│ │ Etc. │
            │  APIs  │ │  API   │ │ API  │ │      │
            └────────┘ └────────┘ └──────┘ └──────┘
                 │          │         │        │
                 └──────────┴─────────┴────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   BigQuery    │
                    │  (Data Lake)  │
                    └───────┬───────┘
                            │
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
              ┌──────────┐    ┌──────────┐
              │ Metabase │    │  Claude  │
              │Dashboard │    │ Analysis │
              └──────────┘    └──────────┘
```

**The MCP server is the ONLY interface practitioners use.**
- No more logging into 5 different platforms
- No more manual data exports
- No more Excel VLOOKUPs
- One conversation with an AI agent that handles everything

---

## Real-World Integrated Example: Holistic Search Analysis

### Scenario: SEM Practitioner Managing E-Commerce Client

**Practitioner's Request:**
> "Analyze our search performance across all channels for the last month. I want to see which search terms are driving traffic and revenue from organic (Google), paid search (Google Ads), and social (Facebook, TikTok). Blend the data, show me what's working, and help me optimize budgets."

---

### Step 1: Automated Data Collection

**What happens behind the scenes:**

```
┌─────────────────────────────────────────────────────────────┐
│ Data Transfer Service (Already Running - Set Once)          │
│                                                              │
│ Daily at 3 AM:                                              │
│                                                              │
│ ┌──────────────────┐                                        │
│ │ Google Search    │ → BigQuery table: gsc_organic_data     │
│ │ Console          │    Columns: date, query, page,         │
│ │                  │             clicks, impressions, ctr,  │
│ └──────────────────┘             position                   │
│                                                              │
│ ┌──────────────────┐                                        │
│ │ Google Ads       │ → BigQuery table: google_ads_data      │
│ │                  │    Columns: date, search_term, campaign│
│ └──────────────────┘             clicks, cost, conversions  │
│                                                              │
│ ┌──────────────────┐                                        │
│ │ Facebook Ads     │ → BigQuery table: facebook_ads_data    │
│ │ (future)         │    Columns: date, search_term, campaign│
│ └──────────────────┘             clicks, spend, conversions │
│                                                              │
│ ┌──────────────────┐                                        │
│ │ TikTok Ads       │ → BigQuery table: tiktok_ads_data      │
│ │ (future)         │    Columns: date, search_term, campaign│
│ └──────────────────┘             clicks, spend, conversions │
│                                                              │
│ Result: All platform data in BigQuery by 4 AM daily         │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 2: Data Blending (AI Agent via MCP)

**Practitioner request triggers this:**

```
┌─────────────────────────────────────────────────────────────┐
│ Claude → MCP Server → BigQuery                              │
│                                                              │
│ SQL Query (AI-Generated):                                   │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ CREATE TABLE holistic_search_performance AS                 │
│                                                              │
│ WITH normalized_terms AS (                                  │
│   -- Normalize search terms across platforms                │
│   SELECT                                                     │
│     date,                                                    │
│     LOWER(TRIM(query)) as search_term,                      │
│     'organic' as source,                                    │
│     clicks as organic_clicks,                               │
│     impressions as organic_impressions,                     │
│     0 as paid_clicks,                                       │
│     0 as paid_spend,                                        │
│     0 as social_clicks,                                     │
│     0 as social_spend,                                      │
│     0 as conversions                                        │
│   FROM `project.gsc_organic_data`                           │
│   WHERE date >= '2025-09-01'                                │
│                                                              │
│   UNION ALL                                                 │
│                                                              │
│   SELECT                                                     │
│     date,                                                    │
│     LOWER(TRIM(search_term)) as search_term,                │
│     'paid_search' as source,                                │
│     0 as organic_clicks,                                    │
│     0 as organic_impressions,                               │
│     clicks as paid_clicks,                                  │
│     cost as paid_spend,                                     │
│     0 as social_clicks,                                     │
│     0 as social_spend,                                      │
│     conversions                                             │
│   FROM `project.google_ads_data`                            │
│   WHERE date >= '2025-09-01'                                │
│                                                              │
│   UNION ALL                                                 │
│                                                              │
│   SELECT                                                     │
│     date,                                                    │
│     LOWER(TRIM(search_term)) as search_term,                │
│     'social_facebook' as source,                            │
│     0, 0, 0, 0,                                             │
│     clicks as social_clicks,                                │
│     spend as social_spend,                                  │
│     conversions                                             │
│   FROM `project.facebook_ads_data`                          │
│   WHERE date >= '2025-09-01'                                │
│     AND search_term IS NOT NULL                             │
│                                                              │
│   UNION ALL                                                 │
│                                                              │
│   SELECT                                                     │
│     date,                                                    │
│     LOWER(TRIM(search_term)) as search_term,                │
│     'social_tiktok' as source,                              │
│     0, 0, 0, 0,                                             │
│     clicks as social_clicks,                                │
│     spend as social_spend,                                  │
│     conversions                                             │
│   FROM `project.tiktok_ads_data`                            │
│   WHERE date >= '2025-09-01'                                │
│     AND search_term IS NOT NULL                             │
│ )                                                            │
│                                                              │
│ -- Aggregate by search term across all sources              │
│ SELECT                                                       │
│   search_term,                                              │
│   SUM(organic_clicks) as organic_clicks,                    │
│   SUM(organic_impressions) as organic_impressions,          │
│   SUM(paid_clicks) as paid_clicks,                          │
│   SUM(paid_spend) as paid_spend,                            │
│   SUM(social_clicks) as social_clicks,                      │
│   SUM(social_spend) as social_spend,                        │
│   SUM(conversions) as total_conversions,                    │
│                                                              │
│   -- Calculate unified metrics                              │
│   SUM(organic_clicks + paid_clicks + social_clicks)         │
│     as total_clicks,                                        │
│                                                              │
│   SUM(paid_spend + social_spend) as total_spend,            │
│                                                              │
│   SAFE_DIVIDE(                                              │
│     SUM(paid_spend + social_spend),                         │
│     SUM(conversions)                                        │
│   ) as blended_cpa,                                         │
│                                                              │
│   -- Channel contribution                                   │
│   SAFE_DIVIDE(SUM(organic_clicks),                          │
│     SUM(organic_clicks + paid_clicks + social_clicks)       │
│   ) * 100 as organic_contribution_pct,                      │
│                                                              │
│   SAFE_DIVIDE(SUM(paid_clicks),                             │
│     SUM(organic_clicks + paid_clicks + social_clicks)       │
│   ) * 100 as paid_contribution_pct,                         │
│                                                              │
│   SAFE_DIVIDE(SUM(social_clicks),                           │
│     SUM(organic_clicks + paid_clicks + social_clicks)       │
│   ) * 100 as social_contribution_pct                        │
│                                                              │
│ FROM normalized_terms                                       │
│ GROUP BY search_term                                        │
│ HAVING total_clicks > 10                                    │
│ ORDER BY total_clicks DESC                                  │
│                                                              │
│ -- Result: ONE clean table with blended search data         │
│ -- Columns: search_term, organic_clicks, paid_clicks,       │
│ --          social_clicks, paid_spend, social_spend,        │
│ --          conversions, blended_cpa, contribution %s       │
└─────────────────────────────────────────────────────────────┘

BigQuery processes: 3 million raw rows (from 3 platforms)
BigQuery returns: 1 clean blended table (~5,000 search terms)
Cost: $0 (under 1 TB free tier)
Time: 5 seconds
```

---

### Step 3: AI Analysis (Claude via MCP)

**Practitioner:** "Now analyze this blended data and give me insights"

```
┌─────────────────────────────────────────────────────────────┐
│ Claude → MCP Server → BigQuery                              │
│                                                              │
│ Query 1: Top Search Terms (Aggregated)                      │
│ ────────────────────────────────────────────────────────────│
│ SELECT                                                       │
│   search_term,                                              │
│   organic_clicks,                                           │
│   paid_clicks,                                              │
│   social_clicks,                                            │
│   total_clicks,                                             │
│   paid_spend,                                               │
│   social_spend,                                             │
│   total_spend,                                              │
│   total_conversions,                                        │
│   blended_cpa,                                              │
│   organic_contribution_pct,                                 │
│   paid_contribution_pct,                                    │
│   social_contribution_pct                                   │
│ FROM holistic_search_performance                            │
│ ORDER BY total_clicks DESC                                  │
│ LIMIT 100                                                   │
│                                                              │
│ Returns: 100 rows × 13 columns = 1,300 cells                │
│ Token usage: ~2,000 tokens                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude Analyzes Data (In Context)                           │
│                                                              │
│ Analysis performed:                                         │
│ ✅ Identifies top search terms across all channels          │
│ ✅ Calculates channel contribution (organic vs paid vs social│
│ ✅ Finds expensive search terms with low conversions        │
│ ✅ Spots opportunities (high organic, low paid spend)       │
│ ✅ Identifies inefficiencies (high spend, low return)       │
│                                                              │
│ Additional queries if needed (interactive):                 │
│ - "Show me hourly breakdown for 'running shoes'"            │
│ - "Compare weekday vs weekend performance"                  │
│ - "Get conversion rate by device for top 10 terms"          │
│                                                              │
│ Each query returns small aggregated result set              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude Presents Insights (In Chat)                          │
│                                                              │
│ 📊 HOLISTIC SEARCH PERFORMANCE ANALYSIS                      │
│ Period: Last 30 Days                                        │
│                                                              │
│ 🎯 KEY FINDINGS:                                             │
│                                                              │
│ 1. TOP PERFORMING SEARCH TERMS (Cross-Channel):             │
│                                                              │
│    Term: "running shoes"                                    │
│    • Organic: 12,500 clicks (45% of total)                 │
│    • Paid Search: 8,300 clicks (30% of total)              │
│    • Social: 6,900 clicks (25% of total)                   │
│    • Total Spend: $4,200                                    │
│    • Conversions: 420                                       │
│    • Blended CPA: $10.00                                    │
│                                                              │
│    Term: "best running shoes 2025"                          │
│    • Organic: 8,200 clicks (60% of total)                  │
│    • Paid Search: 3,100 clicks (23% of total)              │
│    • Social: 2,300 clicks (17% of total)                   │
│    • Total Spend: $2,100                                    │
│    • Conversions: 280                                       │
│    • Blended CPA: $7.50                                     │
│                                                              │
│ 💡 OPPORTUNITIES IDENTIFIED:                                 │
│                                                              │
│ 1. "marathon training shoes" - Strong Organic Opportunity   │
│    • Organic: 3,200 clicks (avg position #8)               │
│    • Paid: 0 clicks (not bidding on this!)                 │
│    • Recommendation: Add to Google Ads (low competition)    │
│    • Estimated: 2K additional clicks at $0.50 CPC          │
│                                                              │
│ 2. "cheap running shoes" - High Spend, Low Conversion       │
│    • Paid: 5,400 clicks, $3,200 spend                      │
│    • Conversions: 32 (0.6% conv rate)                      │
│    • CPA: $100 (10× worse than average!)                   │
│    • Recommendation: Add as negative keyword                │
│    • Potential savings: $3,000/month                        │
│                                                              │
│ 3. "trail running shoes" - Underutilized in Social          │
│    • Organic: 4,500 clicks                                 │
│    • Paid: 2,100 clicks                                    │
│    • Social: 120 clicks (only 3%!)                         │
│    • Recommendation: Increase social budget for this term   │
│    • Opportunity: 2K more clicks at $0.30 CPC              │
│                                                              │
│ 🎯 RECOMMENDED ACTIONS:                                      │
│ 1. Add "marathon training shoes" to Google Ads              │
│ 2. Add "cheap" as negative keyword                          │
│ 3. Increase social budget 30% for trail running campaign    │
│ 4. Reduce Google Ads budget 40% for "cheap" related terms   │
│                                                              │
│ Should I execute these changes?                             │
└─────────────────────────────────────────────────────────────┘
```

**Data processed:** 3M rows in BigQuery
**Data sent to Claude:** 100 aggregated rows
**Time:** 10 seconds
**Cost:** $0.00

---

### Step 4: Platform Changes (Based on Insights)

**Practitioner:** "Yes, execute changes for Google Ads. Hold on social for now."

```
┌─────────────────────────────────────────────────────────────┐
│ Claude → MCP Server → Google Ads API                        │
│                                                              │
│ Action 1: Add Keywords                                      │
│ ────────────────────────────────────────────────────────────│
│ MCP calls: add_keywords                                     │
│ Input: {                                                     │
│   adGroupId: "123",                                         │
│   keywords: [                                               │
│     { text: "marathon training shoes", matchType: "PHRASE" }│
│   ]                                                         │
│ }                                                           │
│                                                              │
│ Safety Flow:                                                │
│ 1. Preview shown: "Adding 1 keyword: 'marathon training..." │
│ 2. Practitioner confirms                                    │
│ 3. Keyword added                                            │
│ 4. Snapshot created                                         │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ Action 2: Add Negative Keywords                             │
│ ────────────────────────────────────────────────────────────│
│ MCP calls: add_negative_keywords                            │
│ Input: {                                                     │
│   campaignId: "456",                                        │
│   keywords: [                                               │
│     { text: "cheap", matchType: "PHRASE" },                │
│     { text: "discount", matchType: "PHRASE" }              │
│   ]                                                         │
│ }                                                           │
│                                                              │
│ Safety Flow:                                                │
│ 1. Preview shown with list                                  │
│ 2. Practitioner confirms                                    │
│ 3. Negatives added                                          │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ Action 3: Reduce Budget                                     │
│ ────────────────────────────────────────────────────────────│
│ MCP calls: update_budget                                    │
│ Input: {                                                     │
│   budgetId: "789",                                          │
│   newDailyAmountDollars: 60  // was $100                   │
│ }                                                           │
│                                                              │
│ Safety Flow:                                                │
│ 1. Preview shows:                                           │
│    - Current: $100/day                                      │
│    - New: $60/day                                           │
│    - Change: -40% ($1,200/month savings)                    │
│    - Risk: May reduce traffic                               │
│ 2. Practitioner confirms                                    │
│ 3. Budget updated                                           │
│ 4. Notification sent to manager                             │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ All changes executed via MCP                                │
│ All changes logged and reversible                           │
└─────────────────────────────────────────────────────────────┘
```

**Time:** 2 minutes
**Cost:** $0 (API calls are free)
**Safety:** All changes approved, can be rolled back

---

### Step 5A: Generate Written Report (In Chat)

**Practitioner:** "Great! Now create a report I can send to my client."

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Generates Report (Markdown)                          │
│                                                              │
│ ════════════════════════════════════════════════════════════│
│                                                              │
│ HOLISTIC SEARCH PERFORMANCE REPORT                          │
│ Client: Acme Running Shoes                                  │
│ Period: September 1 - October 1, 2025                       │
│ Prepared by: WPP Digital Marketing                          │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ EXECUTIVE SUMMARY                                            │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ We analyzed search performance across organic (Google       │
│ Search), paid search (Google Ads), and social platforms     │
│ (Facebook, TikTok) to identify optimization opportunities.   │
│                                                              │
│ KEY METRICS:                                                │
│ • Total Clicks: 127,500                                     │
│   - Organic: 57,375 (45%)                                  │
│   - Paid Search: 38,250 (30%)                              │
│   - Social: 31,875 (25%)                                   │
│                                                              │
│ • Total Spend: $28,400                                      │
│   - Paid Search: $18,200 (64%)                             │
│   - Social: $10,200 (36%)                                  │
│                                                              │
│ • Total Conversions: 1,840                                  │
│ • Blended CPA: $15.43                                       │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ TOP PERFORMING SEARCH TERMS                                 │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ | Search Term              | Organic | Paid | Social |      │
│ |--------------------------|---------|------|--------|      │
│ | running shoes            | 12,500  | 8,300| 6,900  |      │
│ | best running shoes 2025  |  8,200  | 3,100| 2,300  |      │
│ | trail running shoes      |  4,500  | 2,100|   120  |      │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ OPTIMIZATION OPPORTUNITIES                                  │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ 1. High-Value Addition: "marathon training shoes"           │
│    Current Status: 3,200 organic clicks, 0 paid            │
│    Opportunity: Add to Google Ads for incremental reach    │
│    Estimated Impact: +2,000 clicks/month at $0.50 CPC      │
│                                                              │
│ 2. Waste Reduction: "cheap running shoes"                  │
│    Current Status: $3,200 spend, 32 conversions ($100 CPA) │
│    Action Taken: Added as negative keyword                  │
│    Expected Savings: $3,000/month                           │
│                                                              │
│ 3. Social Expansion: "trail running shoes"                  │
│    Current Status: Only 3% of clicks from social           │
│    Opportunity: Increase social budget                      │
│    Estimated Impact: +2,000 clicks/month at $0.30 CPC      │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ ACTIONS TAKEN                                               │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ ✅ Added "marathon training shoes" to Google Ads            │
│ ✅ Added "cheap", "discount" as negative keywords           │
│ ✅ Reduced budget 40% for underperforming campaign          │
│                                                              │
│ Expected Monthly Impact:                                    │
│ • Additional Revenue: $8,500                                │
│ • Cost Savings: $3,000                                      │
│ • Net Benefit: $11,500/month                                │
│                                                              │
│ ════════════════════════════════════════════════════════════│
│                                                              │
│ Practitioner: Copies report, sends to client via email      │
└─────────────────────────────────────────────────────────────┘
```

**Time to create report:** 5 seconds
**Cost:** $0

---

### Step 5B: Create Metabase Dashboard (For Recurring Reports)

**Practitioner:** "Also create a weekly dashboard in Metabase so I can track this ongoing."

```
┌─────────────────────────────────────────────────────────────┐
│ Claude → MCP Server → Metabase API                          │
│                                                              │
│ Step 1: Create Dashboard                                    │
│ ────────────────────────────────────────────────────────────│
│ POST /api/v1/dashboard/                                     │
│ {                                                           │
│   "name": "Holistic Search Performance - Acme Running",    │
│   "description": "Cross-channel search term analysis"       │
│ }                                                           │
│ Response: dashboard_id = 123                                │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ Step 2: Create Cards (Charts)                               │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ Card 1: Top Search Terms Table                              │
│ POST /api/v1/card/                                          │
│ {                                                           │
│   "name": "Top 20 Search Terms by Total Clicks",           │
│   "display": "table",                                       │
│   "dataset_query": {                                        │
│     "type": "native",                                       │
│     "native": {                                             │
│       "query": "SELECT search_term, organic_clicks,         │
│                       paid_clicks, social_clicks,           │
│                       total_spend, conversions,             │
│                       blended_cpa                           │
│                FROM holistic_search_performance             │
│                ORDER BY total_clicks DESC LIMIT 20"         │
│     },                                                      │
│     "database": bigquery_connection_id                      │
│   }                                                         │
│ }                                                           │
│ Response: card_id = 456                                     │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ Card 2: Channel Contribution Pie Chart                      │
│ POST /api/v1/card/                                          │
│ {                                                           │
│   "name": "Traffic by Channel",                            │
│   "display": "pie",                                         │
│   "dataset_query": {                                        │
│     "native": {                                             │
│       "query": "SELECT 'Organic' as channel,                │
│                       SUM(organic_clicks) as clicks         │
│                FROM holistic_search_performance             │
│                UNION ALL                                    │
│                SELECT 'Paid', SUM(paid_clicks)              │
│                FROM holistic_search_performance             │
│                UNION ALL                                    │
│                SELECT 'Social', SUM(social_clicks)          │
│                FROM holistic_search_performance"            │
│     }                                                       │
│   }                                                         │
│ }                                                           │
│ Response: card_id = 457                                     │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ Card 3: Spend vs Conversions Bar Chart                      │
│ POST /api/v1/card/                                          │
│ {                                                           │
│   "name": "Spend & Conversions by Search Term (Top 10)",   │
│   "display": "bar",                                         │
│   "visualization_settings": {                               │
│     "graph.dimensions": ["search_term"],                    │
│     "graph.metrics": ["total_spend", "total_conversions"]  │
│   },                                                        │
│   "dataset_query": {                                        │
│     "native": {                                             │
│       "query": "SELECT search_term, total_spend,            │
│                       total_conversions                     │
│                FROM holistic_search_performance             │
│                ORDER BY total_spend DESC LIMIT 10"          │
│     }                                                       │
│   }                                                         │
│ }                                                           │
│ Response: card_id = 458                                     │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ Card 4: CPA Trend Line Chart                                │
│ POST /api/v1/card/                                          │
│ {                                                           │
│   "name": "Blended CPA Trend (Last 30 Days)",              │
│   "display": "line",                                        │
│   "dataset_query": {                                        │
│     "native": {                                             │
│       "query": "SELECT date,                                │
│                       SAFE_DIVIDE(SUM(total_spend),         │
│                                   SUM(conversions)) as cpa  │
│                FROM daily_performance                       │
│                WHERE date >= CURRENT_DATE - 30              │
│                GROUP BY date ORDER BY date"                 │
│     }                                                       │
│   }                                                         │
│ }                                                           │
│ Response: card_id = 459                                     │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ Step 3: Add Cards to Dashboard                              │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ POST /api/v1/dashboard/123/cards                            │
│ [                                                           │
│   { card_id: 456, row: 0, col: 0, sizeX: 12, sizeY: 6 },  │
│   { card_id: 457, row: 6, col: 0, sizeX: 6, sizeY: 5 },   │
│   { card_id: 458, row: 6, col: 6, sizeX: 6, sizeY: 5 },   │
│   { card_id: 459, row: 11, col: 0, sizeX: 12, sizeY: 5 }  │
│ ]                                                           │
│                                                              │
│ ────────────────────────────────────────────────────────────│
│ Result: Dashboard Created                                   │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │        Metabase Dashboard                             │   │
│ │                                                        │   │
│ │  ╔══════════════════════════════════════════════════╗ │   │
│ │  ║ Top 20 Search Terms                              ║ │   │
│ │  ║ [Data Table showing terms, clicks, spend, CPA]   ║ │   │
│ │  ╚══════════════════════════════════════════════════╝ │   │
│ │                                                        │   │
│ │  ╔═════════════════════╗  ╔══════════════════════════╗ │   │
│ │  ║ Traffic by Channel  ║  ║ Spend vs Conversions    ║ │   │
│ │  ║  [Pie Chart]        ║  ║  [Bar Chart]            ║ │   │
│ │  ╚═════════════════════╝  ╚══════════════════════════╝ │   │
│ │                                                        │   │
│ │  ╔══════════════════════════════════════════════════╗ │   │
│ │  ║ Blended CPA Trend (30 Days)                      ║ │   │
│ │  ║  [Line Chart]                                     ║ │   │
│ │  ╚══════════════════════════════════════════════════╝ │   │
│ │                                                        │   │
│ │  [Export to Excel] [Schedule Email] [Share Link]      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ When practitioner views dashboard:                          │
│ • Metabase queries BigQuery directly (live data)            │
│ • No MCP involved in viewing                                │
│ • Can export ALL data if needed (Metabase handles bulk)     │
│ • Can schedule weekly email with updated data               │
└─────────────────────────────────────────────────────────────┘
```

**Time to create dashboard:** 30 seconds
**Cost:** $0 (Metabase queries BigQuery directly)

---

## 🔄 Complete Workflow Summary

### Daily (Automatic):
```
3 AM: Data Transfer Service runs
├─ GSC data → BigQuery
├─ GA4 data → BigQuery
├─ Google Ads data → BigQuery
└─ [Future] Facebook, TikTok, etc. → BigQuery

Result: Fresh data ready by 4 AM
No practitioner involvement needed
```

### Weekly (Practitioner-Initiated):
```
Practitioner: "Analyze search performance and optimize"
                    ↓
Claude analyzes (via MCP → BigQuery smart queries)
├─ Queries return aggregated data (100-400 rows)
├─ Claude identifies patterns, opportunities
└─ Presents insights in chat
                    ↓
Practitioner: "Execute these changes"
                    ↓
Claude makes platform changes (via MCP → APIs)
├─ Add keywords
├─ Add negatives
├─ Adjust budgets
└─ All with safety approval
                    ↓
Practitioner: "Create report for client"
                    ↓
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
  Written Report        Dashboard in Metabase
  (markdown in chat)    (charts, tables, export)
```

---

## 🎯 Why This Architecture Works

### 1. **MCP Server = Crossroads** ✅

**What MCP Controls:**
✅ **Authorization:** Who can access which accounts
✅ **Safety:** All changes previewed and approved
✅ **Data Loading:** Orchestrates data from APIs to BigQuery
✅ **Smart Querying:** Sends aggregated SQL to BigQuery
✅ **Platform Changes:** All modifications go through MCP
✅ **Dashboard Creation:** Orchestrates Metabase API
✅ **Intelligence:** Routes LLM to right data source

**What MCP Does NOT Do:**
❌ Store bulk data (BigQuery does that)
❌ Proxy dashboard views (Metabase → BigQuery direct)
❌ Transfer millions of rows (aggregates first)

### 2. **BigQuery = Single Source of Truth** ✅

**Benefits:**
✅ All platform data in one place
✅ Automatic daily refreshes
✅ Unlimited historical storage
✅ Fast SQL aggregation
✅ Standard BI tool integration

### 3. **Metabase = Presentation Layer** ✅

**Benefits:**
✅ Direct BigQuery connection (fast!)
✅ Can handle millions of rows for export
✅ Dashboards persist and update automatically
✅ Shareable links, scheduled emails
✅ MCP creates dashboards, but viewing is direct

### 4. **Claude = Intelligence Layer** ✅

**Benefits:**
✅ Analyzes aggregated data (fits in context)
✅ Identifies patterns and opportunities
✅ Generates SQL for complex blending
✅ Recommends actions
✅ Executes changes with safety

---

## 💰 Cost Analysis for Your Test

### Test Scenario: 12 Months GSC Data → BigQuery → Analysis → Metabase

**Data Volume:**
- GSC: ~500K rows (12 months, typical site)
- Storage: ~50 MB
- After aggregation: ~5K unique search terms

**Costs:**

**Storage:**
- 50 MB at $0.04/GB = **$0.002/month**

**Queries:**
- Initial blending query: Processes 500K rows (~50 MB)
- Analysis queries: 10 queries × 5K rows each
- Total processed: ~100 MB
- Cost: $0 (way under 1 TB free tier)

**Data Transfer:**
- GSC → BigQuery via Data Transfer Service: **FREE**

**Metabase:**
- Self-hosted: **$0**
- Cloud: **$40/user/month**

**TOTAL TEST COST: $0.00** ✅

### At Scale (All Clients):

**Data volume:**
- 100 clients × 500K rows = 50M rows
- Storage: ~5 GB
- Queries: Process ~50 GB/month

**Costs:**
- Storage: 5 GB × $0.04 = **$0.20/month**
- Queries: 0.05 TB × $6.25 = **$0.31/month**
- **Total BigQuery: ~$1/month**

**With Metabase (self-hosted): $1/month**
**With Metabase (cloud at scale): $40/user/month**

---

## 🏗️ Implementation Requirements

### What Needs to Be Built:

**1. BigQuery Data Transfer Service Tools:**
- File: `src/bigquery/data-transfer.ts`
- Tools: 4 (create transfers, list, run manually)
- Time: 3-4 hours

**2. BigQuery Table Management:**
- File: `src/bigquery/tables.ts`
- Tools: 3 (create with schema, list, get info)
- Time: 2-3 hours

**3. Metabase Integration:**
- File: `src/metabase/client.ts` + `src/metabase/tools.ts`
- Tools: 6 (dashboard, card, question creation)
- Time: 4-5 hours

**4. Update CLAUDE.md:**
- Add complete workflow diagrams (from this doc)
- Document data flow architecture
- Add integrated examples
- Time: 1 hour

**Total: 10-13 hours**

---

## 📋 Test Execution Plan

### Phase 1: Data Foundation (30 minutes)

```
Step 1: Create BigQuery Dataset
├─ Call MCP: create_bigquery_dataset
├─ Input: { datasetId: "keepersdigital_marketing" }
└─ Result: Dataset created

Step 2: Set Up GSC Data Transfer
├─ Call MCP: create_transfer_search_console
├─ Input: {
│     datasetId: "keepersdigital_marketing",
│     property: "sc-domain:keepersdigital.com"
│  }
└─ Result: Auto-import configured

Step 3: Run Initial Import
├─ Call MCP: run_transfer_now
└─ Result: 12 months of GSC data imported (500K rows)

Step 4: Verify Data
├─ Call MCP: run_bigquery_query
├─ SQL: "SELECT COUNT(*) FROM gsc_data"
└─ Result: 500,000 rows confirmed
```

### Phase 2: Data Blending (5 minutes)

```
Step 5: Create Blended Search Table
├─ Call MCP: run_bigquery_query
├─ SQL: [Complex UNION ALL query shown above]
└─ Result: holistic_search_performance table created (5K rows)

Step 6: Verify Blended Data
├─ Call MCP: run_bigquery_query
├─ SQL: "SELECT * FROM holistic_search_performance LIMIT 10"
└─ Result: Blended data confirmed
```

### Phase 3: Analysis (10 minutes)

```
Step 7: Analyze Search Performance
├─ You ask: "Analyze this data, show top terms, find opportunities"
├─ I query BigQuery (top 100 terms)
├─ Analyze patterns
└─ Present insights in chat

Step 8: Deeper Dive (if needed)
├─ You ask: "Show me more detail on 'running shoes'"
├─ I query BigQuery (filtered for that term)
└─ Present detailed breakdown
```

### Phase 4: Reporting (5 minutes)

```
Option A: Written Report
├─ You ask: "Create client report"
└─ I generate markdown report in chat

Option B: Metabase Dashboard
├─ You ask: "Create dashboard in Metabase"
├─ I call Metabase API (create dashboard + cards)
└─ Dashboard link provided
```

**Total Test Time:** 50 minutes
**Total Cost:** $0.00

---

## 🚀 Why This Will Scale Beautifully

### Adding New Platforms (Easy):

**Want to add Facebook Ads?**
1. Build MCP tools for Facebook API (6-8 hours)
2. Set up Data Transfer to BigQuery (1 tool)
3. Update blending SQL (add UNION ALL for Facebook)
4. Done! Same workflow, same analysis, same dashboards

**Want to add TikTok Ads?**
1. Same pattern as Facebook (6-8 hours)
2. Add to blending SQL
3. Done!

**Want to add Amazon Advertising?**
1. Same pattern (6-8 hours)
2. Add to blending SQL
3. Done!

**The architecture stays the same:**
- MCP = Command center
- BigQuery = Data lake
- Metabase = Dashboards
- Claude = Intelligence

---

## 🎯 Critical Success Factors

### 1. **Smart Aggregation** (NOT Bulk Transfer)

**❌ WRONG:**
```
Query BigQuery: SELECT * FROM gsc_data
→ Returns 10 million rows
→ Send to Claude
→ Exceeds context limit
→ Expensive, slow, fails
```

**✅ RIGHT:**
```
Query BigQuery: SELECT query, SUM(clicks) FROM gsc_data GROUP BY query LIMIT 100
→ Returns 100 rows
→ Send to Claude
→ Fits easily in context
→ Fast, cheap, works
```

### 2. **MCP as Orchestrator** (NOT Data Proxy)

**MCP's job:**
- Direct traffic (which data goes where)
- Enforce safety (approvals, limits)
- Generate smart SQL (aggregate before returning)
- Create dashboards (but not serve them)

**MCP is NOT:**
- A database (BigQuery is)
- A dashboard server (Metabase is)
- A bulk data transfer service

### 3. **Two Paths to Insights**

**Path 1: Chat Analysis (Ad-Hoc)**
- Quick questions
- Immediate answers
- Iterative exploration
- Best for: Weekly analysis, decision-making

**Path 2: Metabase Dashboard (Recurring)**
- Saved dashboards
- Team sharing
- Scheduled reports
- Best for: Monthly reports, executive dashboards

---

## 📊 Workflow Diagram for CLAUDE.md

```
╔═══════════════════════════════════════════════════════════════════╗
║                    WPP DIGITAL MARKETING MCP                       ║
║              AI-Powered Marketing Command Center                   ║
╚═══════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────────┐
│ LAYER 1: DATA FOUNDATION (Always Fresh)                           │
│                                                                    │
│   Google APIs → Data Transfer Service → BigQuery Data Lake        │
│   ────────────────────────────────────────────────────────────    │
│   • Google Search Console  → gsc_data (auto daily)                │
│   • Google Analytics       → ga4_data (auto daily)                │
│   • Google Ads             → ads_data (auto daily)                │
│   • Business Profile       → gbp_data (auto daily)                │
│   • [Future] Facebook      → facebook_data                        │
│   • [Future] TikTok        → tiktok_data                          │
│                                                                    │
│   Data stored centrally, refreshed automatically                  │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ LAYER 2: MCP SERVER (Command Center)                              │
│                                                                    │
│   Practitioner ←→ Claude (LLM) ←→ MCP Server                      │
│                                      │                             │
│   MCP provides:                      │                             │
│   ├─ Authorization (2-layer)         │                             │
│   ├─ Safety (9-layer protection)     │                             │
│   ├─ Orchestration (data routing)    │                             │
│   └─ Intelligence (LLM tools)        │                             │
│                                      │                             │
│   ┌──────────────────────────────────┼────────────────────────┐   │
│   │                                  │                        │   │
│   ▼                                  ▼                        ▼   │
│ Query BigQuery              Change Platforms         Create Reports│
│ (aggregated data)           (with approval)          (Metabase API)│
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ LAYER 3: INTELLIGENCE & PRESENTATION                              │
│                                                                    │
│   ┌─────────────────────┐         ┌──────────────────────┐        │
│   │  Claude Analysis    │         │  Metabase Dashboards │        │
│   │                     │         │                      │        │
│   │  • Chat-based       │         │  • Visual reports    │        │
│   │  • Interactive      │         │  • Shareable         │        │
│   │  • Aggregated data  │         │  • Scheduled emails  │        │
│   │  • Quick insights   │         │  • Full data export  │        │
│   └─────────────────────┘         └──────────────────────┘        │
│                                            │                       │
│                                            │ Direct BigQuery       │
│                                            │ Connection            │
│                                            ▼                       │
│                                    ┌───────────────┐               │
│                                    │   BigQuery    │               │
│                                    │  (live query) │               │
│                                    └───────────────┘               │
└───────────────────────────────────────────────────────────────────┘

KEY PRINCIPLE: MCP orchestrates, BigQuery stores, Metabase presents
```

---

**This workflow is:**
✅ Efficient (aggregate before analyzing)
✅ Scalable (works for 1 client or 1,000 clients)
✅ Cost-effective ($0-1/month for BigQuery)
✅ Flexible (chat OR dashboards OR both)
✅ Safe (9-layer protection)
✅ Extendable (add new platforms easily)

Ready to implement the missing pieces!