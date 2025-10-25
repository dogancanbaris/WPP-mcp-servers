# WPP Platform - Complete Component Catalog

**Comprehensive reference for all platform components**

**Version:** 1.0
**Total Components:** 80+ (Backend: 58 tools | Frontend: 24+ components)
**Last Updated:** October 22, 2025

---

## Table of Contents

1. [MCP Server Backend Components (58 Tools)](#mcp-server-backend-components)
2. [Frontend Dashboard Components](#frontend-dashboard-components)
3. [Cube.js Data Models](#cubejs-data-models)
4. [Database Schema](#database-schema)
5. [Utility Libraries](#utility-libraries)

---

## MCP Server Backend Components

### Module 1: Google Ads (25 Tools)

#### Account Management (3 tools)

**`google_ads_list_accessible_customers`**
- **Purpose:** List all Google Ads accounts user can access
- **Input:** None (uses OAuth token)
- **Output:** Array of {customerId, descriptiveName, currencyCode, timeZone}
- **Use Case:** First call in any workflow to get account list
- **Safety:** Read-only ✅

**`google_ads_get_account_info`**
- **Purpose:** Get detailed account information
- **Input:** `{customerId: string}`
- **Output:** Account details (manager status, test account, billing setup)
- **Use Case:** Verify account configuration
- **Safety:** Read-only ✅

**`google_ads_get_account_hierarchy`**
- **Purpose:** Get manager account → client account tree
- **Input:** `{managerId: string}`
- **Output:** Tree structure of linked accounts
- **Use Case:** Agencies managing multiple client accounts
- **Safety:** Read-only ✅

#### Campaign Management (6 tools)

**`google_ads_list_campaigns`**
- **Purpose:** List all campaigns in account
- **Input:** `{customerId: string, status?: enum, limit?: number}`
- **Output:** Array of campaigns with ID, name, status, budget
- **Use Case:** View all campaigns
- **Safety:** Read-only ✅

**`google_ads_get_campaign`**
- **Purpose:** Get single campaign details
- **Input:** `{customerId: string, campaignId: string}`
- **Output:** Full campaign config (targeting, bidding, schedule, budget)
- **Use Case:** Deep-dive into specific campaign
- **Safety:** Read-only ✅

**`google_ads_create_campaign`**
- **Purpose:** Create new campaign
- **Input:** `{customerId, name, budget, biddingStrategy, targetingSettings}`
- **Output:** `{campaignId, snapshotId, status}`
- **Use Case:** Launch new campaign
- **Safety:** ⚠️ Approval required, snapshot created

**`google_ads_update_campaign`**
- **Purpose:** Modify campaign settings
- **Input:** `{customerId, campaignId, updates: {name?, status?, targeting?}}`
- **Output:** `{success, snapshotId}`
- **Use Case:** Change campaign configuration
- **Safety:** ⚠️ Approval required, snapshot created

**`google_ads_pause_campaign`**
- **Purpose:** Pause active campaign
- **Input:** `{customerId, campaignId, reason?: string}`
- **Output:** `{success, snapshotId}`
- **Use Case:** Stop campaign temporarily
- **Safety:** ⚠️ Approval required, snapshot created

**`google_ads_enable_campaign`**
- **Purpose:** Re-enable paused campaign
- **Input:** `{customerId, campaignId}`
- **Output:** `{success, previousStatus}`
- **Use Case:** Resume paused campaign
- **Safety:** Read-only (enabling is safe) ✅

#### Budget Management (2 tools)

**`google_ads_update_campaign_budget`**
- **Purpose:** Change campaign daily budget
- **Input:** `{customerId, campaignId, newBudget: number}`
- **Output:** `{oldBudget, newBudget, dailyImpact, monthlyImpact, snapshotId}`
- **Use Case:** Scale up/down spending
- **Safety:** ⚠️ Approval required, financial impact shown, snapshot created

**`google_ads_get_budget_recommendations`**
- **Purpose:** Get AI-powered budget optimization suggestions
- **Input:** `{customerId, campaignId?}`
- **Output:** Array of {campaign, currentBudget, recommendedBudget, reason}
- **Use Case:** Optimize budget allocation
- **Safety:** Read-only ✅

#### Bidding Management (2 tools)

**`google_ads_update_bidding_strategy`**
- **Purpose:** Change bid strategy (Manual CPC, Target CPA, Maximize Conversions, etc.)
- **Input:** `{customerId, campaignId, strategy: enum, targetCpa?: number}`
- **Output:** `{success, oldStrategy, newStrategy, snapshotId}`
- **Use Case:** Switch from manual to automated bidding
- **Safety:** ⚠️ Approval required, snapshot created

**`google_ads_get_bid_simulations`**
- **Purpose:** Predict impact of bid changes
- **Input:** `{customerId, campaignId, bidMultiplier: number}`
- **Output:** `{currentMetrics, predictedMetrics, estimatedImpact}`
- **Use Case:** Test bid scenarios before changing
- **Safety:** Read-only ✅

#### Keyword Management (5 tools)

**`google_ads_list_keywords`**
- **Purpose:** List keywords in ad group
- **Input:** `{customerId, adGroupId?, status?, limit?}`
- **Output:** Array of {keywordId, text, matchType, bid, status, qualityScore}
- **Use Case:** View keyword inventory
- **Safety:** Read-only ✅

**`google_ads_add_keywords`**
- **Purpose:** Add keywords to ad group
- **Input:** `{customerId, adGroupId, keywords: [{text, matchType, bid}]}`
- **Output:** `{added: number, failed: number, snapshotId}`
- **Use Case:** Expand keyword targeting
- **Safety:** ⚠️ Approval required, vagueness detection, snapshot created

**`google_ads_update_keyword_bids`**
- **Purpose:** Modify keyword bids
- **Input:** `{customerId, keywords: [{keywordId, newBid}]}`
- **Output:** `{updated: number, snapshotId}`
- **Use Case:** Optimize bids based on performance
- **Safety:** ⚠️ Approval required, financial impact shown

**`google_ads_pause_keywords`**
- **Purpose:** Pause keywords
- **Input:** `{customerId, keywordIds: string[]}`
- **Output:** `{paused: number, snapshotId}`
- **Use Case:** Stop underperforming keywords
- **Safety:** ⚠️ Snapshot created (safe operation but tracked)

**`google_ads_remove_keywords`**
- **Purpose:** Delete keywords
- **Input:** `{customerId, keywordIds: string[]}`
- **Output:** `{removed: number, snapshotId}`
- **Use Case:** Clean up keyword list
- **Safety:** ⚠️ Approval required, snapshot created

#### Keyword Planning (2 tools)

**`google_ads_generate_keyword_ideas`**
- **Purpose:** Get keyword suggestions and search volumes
- **Input:** `{seed_keywords?: string[], url?: string, language?: string, location?: string}`
- **Output:** Array of {keyword, avgMonthlySearches, competition, suggestedBid}
- **Use Case:** Research new keyword opportunities
- **Safety:** Read-only ✅

**`google_ads_get_keyword_forecasts`**
- **Purpose:** Predict performance of keywords before adding
- **Input:** `{keywords: string[], cpc_bid: number, dateRange?: string}`
- **Output:** `{estimatedClicks, estimatedImpressions, estimatedCost, estimatedConversions}`
- **Use Case:** Estimate ROI before campaign launch
- **Safety:** Read-only ✅

#### Ad Assets (2 tools)

**`google_ads_list_ad_assets`**
- **Purpose:** List headlines, descriptions, images for ads
- **Input:** `{customerId, adGroupId?}`
- **Output:** `{headlines: [], descriptions: [], images: []}`
- **Use Case:** Review ad creative inventory
- **Safety:** Read-only ✅

**`google_ads_create_responsive_search_ad`**
- **Purpose:** Create RSA with multiple headlines/descriptions
- **Input:** `{customerId, adGroupId, headlines: string[], descriptions: string[], finalUrls: string[]}`
- **Output:** `{adId, status, snapshotId}`
- **Use Case:** Create/test new ad variations
- **Safety:** ⚠️ Approval required, snapshot created

#### Ad Extensions (1 tool)

**`google_ads_list_ad_extensions`**
- **Purpose:** List sitelinks, callouts, structured snippets
- **Input:** `{customerId, campaignId?}`
- **Output:** `{sitelinks: [], callouts: [], snippets: []}`
- **Use Case:** Review extensions
- **Safety:** Read-only ✅

#### Audience Management (2 tools)

**`google_ads_list_audiences`**
- **Purpose:** List remarketing audiences
- **Input:** `{customerId}`
- **Output:** Array of {audienceId, name, size, type, status}
- **Use Case:** View available audiences
- **Safety:** Read-only ✅

**`google_ads_create_audience`**
- **Purpose:** Create custom audience
- **Input:** `{customerId, name, rules: {}, membershipDuration: number}`
- **Output:** `{audienceId, snapshotId}`
- **Use Case:** Build remarketing lists
- **Safety:** ⚠️ Approval required (PII handling)

#### Conversion Tracking (2 tools)

**`google_ads_list_conversion_actions`**
- **Purpose:** List tracked conversion actions
- **Input:** `{customerId}`
- **Output:** Array of {conversionId, name, category, countingType, value}
- **Use Case:** Review conversion tracking setup
- **Safety:** Read-only ✅

**`google_ads_import_offline_conversions`**
- **Purpose:** Upload offline conversions (phone calls, in-store visits)
- **Input:** `{customerId, conversions: [{gclid, conversionDate, conversionValue}]}`
- **Output:** `{imported: number, failed: number, snapshotId}`
- **Use Case:** Connect online ads to offline sales
- **Safety:** ⚠️ Approval required (PII handling), snapshot created

#### Reporting (6 tools)

**`google_ads_query`**
- **Purpose:** Execute custom GAQL (Google Ads Query Language) queries
- **Input:** `{customerId, query: string, limit?: number}`
- **Output:** Array of query results
- **Use Case:** Complex custom reports not covered by other tools
- **Safety:** Read-only ✅

**`google_ads_campaign_performance_report`**
- **Purpose:** Pre-built campaign performance report
- **Input:** `{customerId, dateRange, metrics: string[]}`
- **Output:** Campaign-level metrics (impressions, clicks, cost, conversions, ROAS)
- **Use Case:** Weekly/monthly performance review
- **Safety:** Read-only ✅

**`google_ads_keyword_performance_report`**
- **Purpose:** Keyword-level performance
- **Input:** `{customerId, dateRange, metrics: string[]}`
- **Output:** Keyword metrics with quality scores
- **Use Case:** Keyword optimization
- **Safety:** Read-only ✅

**`google_ads_search_terms_report`**
- **Purpose:** Actual search queries that triggered ads
- **Input:** `{customerId, dateRange, minImpressions?: number}`
- **Output:** Search terms with match type and performance
- **Use Case:** Find negative keywords, discover new keywords
- **Safety:** Read-only ✅

**`google_ads_geographic_performance_report`**
- **Purpose:** Performance by location (country, state, city)
- **Input:** `{customerId, dateRange, granularity: enum}`
- **Output:** Location metrics
- **Use Case:** Geographic targeting optimization
- **Safety:** Read-only ✅

**`google_ads_device_performance_report`**
- **Purpose:** Performance by device (mobile, desktop, tablet)
- **Input:** `{customerId, dateRange}`
- **Output:** Device-level metrics
- **Use Case:** Device-specific bid adjustments
- **Safety:** Read-only ✅

---

### Module 2: Google Search Console (18 Tools)

#### Property Management (3 tools)

**`gsc_list_properties`**
- **Purpose:** List all verified websites
- **Input:** None (uses OAuth)
- **Output:** Array of {propertyUrl, permissionLevel}
- **Use Case:** See all sites user has access to
- **Safety:** Read-only ✅

**`gsc_add_property`**
- **Purpose:** Verify new website
- **Input:** `{propertyUrl: string, verificationType: enum}`
- **Output:** `{verified: boolean, verificationMethod}`
- **Use Case:** Add new site to Search Console
- **Safety:** ⚠️ Approval required (domain verification)

**`gsc_delete_property`**
- **Purpose:** Remove verified website
- **Input:** `{propertyUrl: string}`
- **Output:** `{success: boolean, snapshotId}`
- **Use Case:** Clean up old properties
- **Safety:** ⚠️ Approval required, snapshot created

#### Performance Analytics (5 tools)

**`gsc_query_analytics`**
- **Purpose:** Main reporting tool - get clicks, impressions, CTR, position
- **Input:** `{propertyUrl, startDate, endDate, dimensions: enum[], filters?: {}, rowLimit?: number}`
- **Output:** Performance data grouped by query/page/country/device/date
- **Use Case:** All performance reporting needs
- **Safety:** Read-only ✅
- **Dimensions Available:** query, page, country, device, searchAppearance, date
- **Metrics:** clicks, impressions, ctr, position

**`gsc_get_top_queries`**
- **Purpose:** Get top N search queries by clicks
- **Input:** `{propertyUrl, startDate, endDate, limit: number}`
- **Output:** Top queries with metrics
- **Use Case:** Quick view of best performers
- **Safety:** Read-only ✅

**`gsc_get_top_pages`**
- **Purpose:** Get top landing pages by clicks
- **Input:** `{propertyUrl, startDate, endDate, limit: number}`
- **Output:** Top pages with metrics
- **Use Case:** Identify high-traffic pages
- **Safety:** Read-only ✅

**`gsc_get_device_breakdown`**
- **Purpose:** Performance split by mobile/desktop/tablet
- **Input:** `{propertyUrl, startDate, endDate}`
- **Output:** Device metrics
- **Use Case:** Mobile vs desktop analysis
- **Safety:** Read-only ✅

**`gsc_get_country_breakdown`**
- **Purpose:** Performance by country
- **Input:** `{propertyUrl, startDate, endDate}`
- **Output:** Country-level metrics
- **Use Case:** International SEO analysis
- **Safety:** Read-only ✅

#### URL Inspection (2 tools)

**`gsc_inspect_url`**
- **Purpose:** Check indexing status and crawl details for specific URL
- **Input:** `{propertyUrl, inspectionUrl: string}`
- **Output:** `{indexStatus, lastCrawlDate, crawlStatus, mobileUsability, structuredData}`
- **Use Case:** Debug why page isn't ranking
- **Safety:** Read-only ✅

**`gsc_request_indexing`**
- **Purpose:** Submit URL to Google for indexing/re-indexing
- **Input:** `{propertyUrl, url: string}`
- **Output:** `{requestId, estimatedCrawlDate}`
- **Use Case:** Get new/updated pages indexed faster
- **Safety:** ⚠️ Rate limited (10 URLs/day), approval required

#### Sitemap Management (4 tools)

**`gsc_list_sitemaps`**
- **Purpose:** List submitted sitemaps
- **Input:** `{propertyUrl}`
- **Output:** Array of {sitemapUrl, lastSubmitted, status, warnings, errors}
- **Use Case:** Check sitemap health
- **Safety:** Read-only ✅

**`gsc_submit_sitemap`**
- **Purpose:** Submit new sitemap to Google
- **Input:** `{propertyUrl, sitemapUrl: string}`
- **Output:** `{success, snapshotId}`
- **Use Case:** Add sitemap for new site/section
- **Safety:** ⚠️ Snapshot created

**`gsc_delete_sitemap`**
- **Purpose:** Remove sitemap
- **Input:** `{propertyUrl, sitemapUrl: string}`
- **Output:** `{success, snapshotId}`
- **Use Case:** Clean up old sitemaps
- **Safety:** ⚠️ Approval required, snapshot created

**`gsc_get_sitemap_status`**
- **Purpose:** Get detailed sitemap processing info
- **Input:** `{propertyUrl, sitemapUrl: string}`
- **Output:** `{urlsSubmitted, urlsIndexed, errors: []}`
- **Use Case:** Debug sitemap issues
- **Safety:** Read-only ✅

#### Other (4 tools)

**`gsc_get_mobile_usability_issues`**
- **Purpose:** Find mobile-unfriendly pages
- **Input:** `{propertyUrl}`
- **Output:** Array of {url, issueType, description}
- **Use Case:** Mobile optimization
- **Safety:** Read-only ✅

**`gsc_get_core_web_vitals`**
- **Purpose:** Get Core Web Vitals (LCP, FID, CLS) via CrUX integration
- **Input:** `{propertyUrl, formFactor?: enum}`
- **Output:** `{goodUrls: number, needsImprovementUrls: number, poorUrls: number, topIssues: []}`
- **Use Case:** Page speed optimization
- **Safety:** Read-only ✅

**`gsc_get_index_coverage`**
- **Purpose:** See indexed vs excluded pages
- **Input:** `{propertyUrl}`
- **Output:** `{validPages: number, excludedPages: number, errorPages: number, reasons: []}`
- **Use Case:** Find indexing problems
- **Safety:** Read-only ✅

**`gsc_get_crawl_errors`**
- **Purpose:** Get 404s, 500s, redirect errors
- **Input:** `{propertyUrl}`
- **Output:** Array of {url, errorType, firstDetected, lastSeen}
- **Use Case:** Fix technical SEO issues
- **Safety:** Read-only ✅

---

### Module 3: Google Analytics 4 (8 Tools)

#### Reporting (4 tools)

**`ga_run_report`**
- **Purpose:** Custom report builder
- **Input:** `{propertyId, dimensions: string[], metrics: string[], dateRange, filters?, orderBy?}`
- **Output:** Report data
- **Use Case:** Flexible analytics reporting
- **Safety:** Read-only ✅
- **Available Dimensions:** date, country, city, device, page, source, medium, campaign
- **Available Metrics:** sessions, users, pageviews, bounceRate, sessionDuration, conversions, revenue

**`ga_run_realtime_report`**
- **Purpose:** Real-time data (last 30 minutes)
- **Input:** `{propertyId, dimensions: string[], metrics: string[]}`
- **Output:** Real-time metrics
- **Use Case:** Monitor live traffic
- **Safety:** Read-only ✅

**`ga_get_traffic_sources_report`**
- **Purpose:** Pre-built traffic source breakdown
- **Input:** `{propertyId, dateRange}`
- **Output:** Source/medium/campaign metrics
- **Use Case:** Attribution analysis
- **Safety:** Read-only ✅

**`ga_get_top_pages_report`**
- **Purpose:** Top landing pages by sessions
- **Input:** `{propertyId, dateRange, limit: number}`
- **Output:** Top pages with metrics
- **Use Case:** Content performance
- **Safety:** Read-only ✅

#### Admin (4 tools)

**`ga_list_accounts`**
- **Purpose:** List GA4 accounts
- **Input:** None (uses OAuth)
- **Output:** Array of {accountId, displayName}
- **Use Case:** Account selection
- **Safety:** Read-only ✅

**`ga_list_properties`**
- **Purpose:** List properties in account
- **Input:** `{accountId?: string}`
- **Output:** Array of {propertyId, displayName, timeZone}
- **Use Case:** Property selection
- **Safety:** Read-only ✅

**`ga_get_property_metadata`**
- **Purpose:** Get property details
- **Input:** `{propertyId: string}`
- **Output:** Property config (timezone, currency, industry)
- **Use Case:** Verify setup
- **Safety:** Read-only ✅

**`ga_list_data_streams`**
- **Purpose:** List web/iOS/Android data streams
- **Input:** `{propertyId: string}`
- **Output:** Array of {streamId, type, name}
- **Use Case:** Check tracking setup
- **Safety:** Read-only ✅

---

### Module 4: BigQuery (3 Tools)

**`bigquery_query`**
- **Purpose:** Execute SQL queries on BigQuery datasets
- **Input:** `{query: string, projectId?: string, useLegacySql?: boolean}`
- **Output:** Query results as JSON array
- **Use Case:** Cross-platform analysis, custom reports
- **Safety:** Read-only ✅ (SELECT queries only)
- **Example:** Join Google Ads + Search Console + Analytics data

**`bigquery_create_table`**
- **Purpose:** Create new BigQuery table
- **Input:** `{projectId, datasetId, tableId, schema: []}`
- **Output:** `{tableId, created, snapshotId}`
- **Use Case:** Set up data warehouse tables
- **Safety:** ⚠️ Approval required, snapshot created

**`bigquery_load_data`**
- **Purpose:** Load data from Cloud Storage into BigQuery
- **Input:** `{projectId, datasetId, tableId, sourceUri: string, format: enum}`
- **Output:** `{rowsLoaded: number, status}`
- **Use Case:** Bulk data imports
- **Safety:** ⚠️ Approval required

---

### Module 5: Google Business Profile (2 Tools)

**`gbp_list_locations`**
- **Purpose:** List business locations
- **Input:** `{accountId?: string}`
- **Output:** Array of {locationId, name, address, placeId}
- **Use Case:** Multi-location business management
- **Safety:** Read-only ✅

**`gbp_get_location_insights`**
- **Purpose:** Get location performance (views, actions, direction requests)
- **Input:** `{locationId: string, dateRange}`
- **Output:** `{views, searches, actions, directions, calls, websiteClicks}`
- **Use Case:** Local SEO performance
- **Safety:** Read-only ✅

---

### Module 6: Chrome UX Report (1 Tool)

**`crux_get_metrics`**
- **Purpose:** Get real user experience metrics (LCP, FID, CLS)
- **Input:** `{url: string, formFactor?: enum}`
- **Output:** `{lcp: {good, needsImprovement, poor}, fid: {}, cls: {}}`
- **Use Case:** Page speed & UX optimization
- **Safety:** Read-only ✅

---

### Module 7: SERP API (1 Tool)

**`serp_get_results`**
- **Purpose:** Get Google search results for keyword
- **Input:** `{query: string, location?: string, language?: string, device?: enum}`
- **Output:** Array of {position, url, title, snippet, type}
- **Use Case:** SERP analysis, rank tracking
- **Safety:** Read-only ✅

---

### Module 8: WPP Analytics Dashboard (2 Tools)

**`wpp_dashboard_list`**
- **Purpose:** List user's saved dashboards
- **Input:** None (uses user session)
- **Output:** Array of {dashboardId, name, chartCount, lastEdited}
- **Use Case:** Dashboard management
- **Safety:** Read-only ✅

**`wpp_dashboard_create`**
- **Purpose:** Create/save dashboard configuration
- **Input:** `{name: string, config: {charts: [], filters: {}}}`
- **Output:** `{dashboardId}`
- **Use Case:** Persist dashboard state
- **Safety:** Write operation (to Supabase), no approval needed (user's own data)

---

## Frontend Dashboard Components

### Page Components (5)

**`app/page.tsx`**
- **Purpose:** Home page (redirects to /dashboard)
- **Props:** None
- **State:** None

**`app/login/page.tsx`**
- **Purpose:** OAuth login page with Google Sign-In button
- **Props:** None
- **State:** OAuth flow state

**`app/dashboard/page.tsx`**
- **Purpose:** Dashboard list view with create/duplicate/delete actions
- **Props:** None
- **State:** Dashboards array from Supabase

**`app/dashboard/[id]/builder/page.tsx`**
- **Purpose:** Main dashboard builder with drag-drop canvas
- **Props:** `{params: {id: string}}`
- **State:** Dashboard config, selected chart, filters

**`app/settings/page.tsx`**
- **Purpose:** User settings (theme, notifications, API keys)
- **Props:** None
- **State:** User preferences

### Chart Components (13)

All chart components extend `BaseChartProps`:

```typescript
interface BaseChartProps {
  data: any;
  width: number;
  height: number;
  chartConfig: ChartSpecificConfig;
  onDataClick?: (params: any) => void;
}
```

**1. `LineChart.tsx`** - Time series line charts (basic, smooth, stacked, step, area)
**2. `BarChart.tsx`** - Bar charts (vertical, horizontal, stacked, grouped, waterfall)
**3. `PieChart.tsx`** - Pie charts (basic, donut, rose)
**4. `TableChart.tsx`** - Sortable, filterable tables with pagination
**5. `TreemapChart.tsx`** - Hierarchical rectangles
**6. `SankeyChart.tsx`** - Flow diagrams
**7. `HeatmapChart.tsx`** - 2D heatmaps
**8. `GaugeChart.tsx`** - Progress gauges
**9. `ScatterChart.tsx`** - Scatter plots with regression lines
**10. `FunnelChart.tsx`** - Conversion funnels
**11. `RadarChart.tsx`** - Radar/spider charts
**12. `SunburstChart.tsx`** - Hierarchical sunburst
**13. `KPIScorecard.tsx`** - Single metric cards

### UI Components (14 from Shadcn/ui)

**`ui/button.tsx`** - Button with variants (default, outline, ghost, destructive)
**`ui/card.tsx`** - Card container
**`ui/dialog.tsx`** - Modal dialogs
**`ui/dropdown-menu.tsx`** - Dropdown menus
**`ui/input.tsx`** - Text inputs
**`ui/label.tsx`** - Form labels
**`ui/select.tsx`** - Select dropdowns
**`ui/switch.tsx`** - Toggle switches
**`ui/tabs.tsx`** - Tab navigation
**`ui/toast.tsx`** - Toast notifications
**`ui/popover.tsx`** - Popovers
**`ui/scroll-area.tsx`** - Scrollable areas
**`ui/separator.tsx`** - Dividers
**`ui/slider.tsx`** - Range sliders

### Dashboard Builder Components (7)

**`DashboardCanvas.tsx`**
- **Purpose:** Main drag-drop canvas for chart placement
- **Props:** `{charts: ChartConfig[], onReorder, onSelect}`
- **State:** Drag state, selected chart ID

**`ChartPicker.tsx`**
- **Purpose:** Modal to select chart type when adding new chart
- **Props:** `{onSelect: (chartType) => void}`
- **State:** Search query, selected category

**`ChartConfigPanel.tsx`**
- **Purpose:** Right sidebar with Data/Style/Filters tabs
- **Props:** `{chart: ChartConfig, onChange}`
- **State:** Active tab

**`DataTab.tsx`**
- **Purpose:** Configure data source, measures, dimensions for chart
- **Props:** `{chart, onChange}`
- **State:** Cube.js query builder state

**`StyleTab.tsx`**
- **Purpose:** Configure chart appearance (colors, labels, legend)
- **Props:** `{chart, onChange}`
- **State:** Style settings

**`FiltersTab.tsx`**
- **Purpose:** Configure chart-specific filters
- **Props:** `{chart, onChange}`
- **State:** Filter configurations

**`Topbar.tsx`**
- **Purpose:** Builder toolbar with save/share/export actions
- **Props:** `{dashboard, onSave, onShare, onExport}`
- **State:** Saving state

### Filter Components (4)

**`DateRangeFilter.tsx`**
- **Purpose:** Date range picker (quick options + custom)
- **Props:** `{value: DateRange, onChange}`
- **State:** Selected range

**`SearchFilter.tsx`**
- **Purpose:** Text search across dimensions
- **Props:** `{value: string, onChange, placeholder}`
- **State:** Search query

**`MultiSelectFilter.tsx`**
- **Purpose:** Multi-select checkboxes for dimensions
- **Props:** `{options: [], selected: [], onChange}`
- **State:** Selected values

**`RangeSliderFilter.tsx`**
- **Purpose:** Numeric range slider
- **Props:** `{min, max, value: [number, number], onChange}`
- **State:** Slider value

### Utility Components (3)

**`providers.tsx`**
- **Purpose:** Context providers (CubeProvider, ThemeProvider)
- **Props:** `{children: ReactNode}`

**`user-profile.tsx`**
- **Purpose:** User dropdown menu with avatar
- **Props:** None (uses Supabase auth context)

**`theme-toggle.tsx`**
- **Purpose:** Dark mode switcher
- **Props:** None (uses next-themes)

---

## Cube.js Data Models

### GoogleAds.js

**Purpose:** Google Ads performance data from BigQuery

**Dimensions:**
- `date` (time)
- `campaignName` (string)
- `adGroupName` (string)
- `keyword` (string)
- `device` (string) [MOBILE, DESKTOP, TABLET]
- `matchType` (string) [EXACT, PHRASE, BROAD]

**Measures:**
- `clicks` (sum) - Total clicks
- `impressions` (sum) - Total impressions
- `cost` (sum) - Cost in USD (micros / 1M)
- `conversions` (sum) - Total conversions
- `avgCtr` (avg) - Average CTR (%)
- `avgCpc` (avg) - Average CPC ($)
- `avgCpa` (avg) - Average CPA ($)
- `roas` (calculated) - Revenue / Cost

**Pre-Aggregations:**
- `dailyPerformance` - Daily rollup by campaign/device (refresh every hour)
- `monthlyTrends` - Monthly rollup (refresh daily)

### SearchConsole.js

**Purpose:** Search Console data from BigQuery

**Dimensions:**
- `date` (time)
- `query` (string) - Search query
- `page` (string) - Landing page
- `country` (string)
- `device` (string)

**Measures:**
- `clicks` (sum)
- `impressions` (sum)
- `avgCtr` (avg) - %
- `avgPosition` (avg) - Position

**Pre-Aggregations:**
- `dailyQueries` - Daily by query (refresh every 6 hours)

### Analytics.js

**Purpose:** Google Analytics 4 data from BigQuery

**Dimensions:**
- `date` (time)
- `page` (string)
- `source` (string)
- `medium` (string)
- `campaign` (string)
- `device` (string)
- `country` (string)

**Measures:**
- `sessions` (sum)
- `users` (count distinct)
- `pageviews` (sum)
- `bounceRate` (avg) - %
- `avgSessionDuration` (avg) - Seconds
- `conversions` (sum)
- `revenue` (sum) - USD

---

## Database Schema

### Supabase Tables

**`auth.users`** (Supabase built-in)
- `id` UUID PK
- `email` TEXT
- `created_at` TIMESTAMP

**`oauth_credentials`**
- `id` UUID PK
- `user_id` UUID FK → auth.users
- `access_token` TEXT (encrypted)
- `refresh_token` TEXT (encrypted)
- `expiry_date` BIGINT
- `scopes` TEXT[]
- `created_at` TIMESTAMP

**`dashboards`**
- `id` UUID PK
- `user_id` UUID FK → auth.users
- `name` TEXT
- `config` JSONB (chart configurations)
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

**`dashboard_shares`**
- `id` UUID PK
- `dashboard_id` UUID FK → dashboards
- `shared_with_email` TEXT
- `permission` ENUM (view, edit)
- `created_at` TIMESTAMP

**`change_snapshots`**
- `id` UUID PK (snapshot ID)
- `user_id` UUID FK → auth.users
- `resource_type` TEXT (campaign, keyword, budget)
- `resource_id` TEXT
- `state_before` JSONB
- `created_at` TIMESTAMP

**`audit_log`**
- `id` UUID PK
- `user_id` UUID FK → auth.users
- `tool_name` TEXT
- `input` JSONB
- `output` JSONB
- `snapshot_id` UUID FK → change_snapshots (nullable)
- `timestamp` TIMESTAMP

---

## Utility Libraries

### Backend Utilities

**`shared/oauth-client-factory.ts`**
- `createOAuthClient(userId)` - Generate OAuth2Client per tenant

**`shared/safety/approval-enforcer.ts`**
- `requireApproval(operation)` - Show approval prompt, wait for user response

**`shared/safety/snapshot-manager.ts`**
- `createSnapshot(resource)` - Save current state before change
- `rollbackToSnapshot(snapshotId)` - Restore previous state

**`shared/safety/financial-calculator.ts`**
- `calculateImpact(oldBudget, newBudget)` - Project daily/monthly cost impact

**`shared/safety/vagueness-detector.ts`**
- `detectVagueness(input)` - Check if request has all required parameters

**`shared/safety/audit-logger.ts`**
- `logAudit(event)` - Write to audit_log table

### Frontend Utilities

**`lib/supabase/client.ts`**
- `createBrowserClient()` - Supabase client for browser
- `createServerClient()` - Supabase client for server components

**`lib/supabase/dashboard-service.ts`**
- `listDashboards(userId)` - Get user's dashboards
- `getDashboard(id)` - Get single dashboard
- `createDashboard(name, config)` - Save new dashboard
- `updateDashboard(id, config)` - Update existing
- `deleteDashboard(id)` - Delete dashboard

**`lib/cubejs/client.ts`**
- `createCubeClient()` - Cube.js API client
- `runQuery(query)` - Execute Cube.js query

**`lib/export/pdf-exporter.ts`**
- `exportToPDF(dashboard)` - Generate PDF from dashboard

**`lib/export/excel-exporter.ts`**
- `exportToExcel(chartData)` - Generate Excel file

**`lib/themes/echarts-theme.ts`**
- `getLightTheme()` - ECharts light theme
- `getDarkTheme()` - ECharts dark theme

---

## Summary

**Total Components:** 80+

- **Backend MCP Tools:** 58 (across 8 modules)
- **Frontend React Components:** 24+ (charts, UI, utilities)
- **Cube.js Models:** 3 (GoogleAds, SearchConsole, Analytics)
- **Database Tables:** 6 (Supabase PostgreSQL)
- **Utility Libraries:** 15+ helper modules

**Status:** ✅ 100% Production Ready
**Version:** 1.0
**Last Updated:** October 22, 2025

---

**For complete implementation details:**
- **Platform Guide:** `PLATFORM-COMPLETE-GUIDE.md`
- **Developer Guide:** `DEVELOPER-GUIDE.md`
- **Agent Guide:** `AGENT-GUIDE.md`
- **Architecture:** `/docs/architecture/CLAUDE.md`
