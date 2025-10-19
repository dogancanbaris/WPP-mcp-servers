# WPP MCP API Expansion Plan - Revised

## IMPLEMENTATION PHASES

### PHASE 1: EXPAND EXISTING GOOGLE APIS (Week 1)
**Priority:** Complete Google Ads and Google Analytics coverage
**Timeline:** 5-7 days
**Goal:** Full control over Google Ads and GA4 accounts

### PHASE 2: ADD NEW GOOGLE APIS (Week 2)
**Priority:** Business Profile, BigQuery, Bright Data SERP
**Timeline:** 5-7 days
**Goal:** Local SEO, data blending, rank tracking

### PHASE 3: ANALYTICS SOLUTION EVALUATION (Week 3)
**Priority:** Test and select BI platform
**Timeline:** 3-5 days
**Goal:** Easy-to-use solution with templates for global network

---

## PHASE 1A: GOOGLE ADS API EXPANSION

### Currently Integrated: 12 Tools
- list_accessible_accounts
- list_campaigns, get_campaign_performance
- get_search_terms_report
- list_budgets, get_keyword_performance
- update_campaign_status ✅ (with safety)
- create_campaign
- create_budget ✅ (with safety)
- update_budget ✅ (with safety)
- add_keywords ✅ (with safety)
- add_negative_keywords ✅ (with safety)

### NEW SERVICES TO ADD: 28 Services

---

#### GROUP 1: CONVERSION & MEASUREMENT (5 services) - CRITICAL

**1. ConversionActionService**
- **Methods:** create, update, get, list
- **Use Case:** Set up conversion tracking for client campaigns
- **Example:** "Create a 'Purchase' conversion action that tracks transactions on client website"
- **Safety:** WRITE - Approval required
- **Value:** HIGH - Required for tracking campaign ROI

**2. ConversionUploadService**
- **Methods:** uploadCallConversions, uploadClickConversions
- **Use Case:** Import offline sales/leads from CRM to attribute to Google Ads
- **Example:** "Upload last month's closed deals from Salesforce to show Google Ads drove $500K in revenue"
- **Safety:** WRITE - Approval + vagueness detection (must specify conversion action, dates)
- **Value:** CRITICAL - Proves offline ROI from Google Ads campaigns

**3. ConversionAdjustmentUploadService**
- **Methods:** uploadConversionAdjustments
- **Use Case:** Update conversion values after initial import (e.g., refunds, upgraded purchases)
- **Example:** "Adjust conversion value for order #12345 from $100 to $150 after customer upgraded"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Important for accurate ROI tracking

**4. ConversionValueRuleService**
- **Methods:** create, update, remove
- **Use Case:** Apply different conversion values based on audience, location, device
- **Example:** "Value conversions from mobile 20% higher because mobile users have higher LTV"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Advanced conversion value optimization

**5. ConversionCustomVariableService**
- **Methods:** create, update
- **Use Case:** Track additional conversion parameters (product category, customer segment)
- **Example:** "Track which product category drove each conversion for better bidding"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Enhanced conversion tracking

---

#### GROUP 2: ASSETS & CREATIVE (4 services)

**6. AssetService**
- **Methods:** mutate (create/update/remove)
- **Use Case:** Upload and manage creative assets (images, videos, text, logos)
- **Example:** "Upload 20 product images for Performance Max campaign"
- **Safety:** WRITE - Approval for bulk uploads (max 50 assets)
- **Value:** HIGH - Required for Performance Max and responsive ads

**7. AssetGroupService**
- **Methods:** mutate
- **Use Case:** Manage Performance Max asset groups
- **Example:** "Create asset group with headlines, descriptions, images for Performance Max"
- **Safety:** WRITE - Approval required
- **Value:** HIGH - Performance Max campaign management

**8. AssetSetService**
- **Methods:** mutate
- **Use Case:** Group related assets for campaigns
- **Example:** "Create asset set for 'Summer Sale' with all summer product images"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Asset organization

**9. AssetGroupAssetService**
- **Methods:** mutate
- **Use Case:** Link assets to asset groups
- **Example:** "Add logo and product images to Performance Max asset group"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Asset management

---

#### GROUP 3: AUDIENCE & TARGETING (6 services)

**10. UserListService**
- **Methods:** mutate
- **Use Case:** Create and manage remarketing lists
- **Example:** "Create remarketing list of users who visited pricing page but didn't convert"
- **Safety:** WRITE - Approval required
- **Value:** CRITICAL - Remarketing is key to performance

**11. AudienceService**
- **Methods:** mutate
- **Use Case:** Manage audience segments for targeting
- **Example:** "Create audience of 'High-value customers' based on GA4 data"
- **Safety:** WRITE - Approval required
- **Value:** HIGH - Advanced targeting

**12. CustomAudienceService**
- **Methods:** mutate
- **Use Case:** Create custom audiences based on interests, URLs, apps
- **Example:** "Target users interested in 'digital marketing' who visit competitor sites"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM-HIGH - Custom targeting

**13. CustomerMatchUserListService**
- **Methods:** mutate (upload customer lists)
- **Use Case:** Upload customer emails/phones for targeting or exclusion
- **Example:** "Upload 10,000 customer emails to create remarketing list"
- **Safety:** WRITE - Approval + privacy warning + bulk limits
- **Value:** HIGH - First-party data targeting

**14. RemarketingActionService**
- **Methods:** mutate
- **Use Case:** Define remarketing tags and rules
- **Example:** "Set up remarketing tag for cart abandoners"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Remarketing setup

**15. CombinedAudienceService**
- **Methods:** mutate
- **Use Case:** Combine multiple audiences with AND/OR logic
- **Example:** "Target users in 'High Intent' AND 'Visited Last 30 Days' audiences"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Advanced audience combinations

---

#### GROUP 4: KEYWORD PLANNING (2 services) - KEEP 1, REMOVE 1

**16. KeywordPlanService**
- **Methods:** create, update, mutate, generateForecast
- **Use Case:** Build keyword plans with traffic and cost forecasts
- **Example:** "Create keyword plan for 100 keywords, forecast traffic and budget needed"
- **Safety:** WRITE - Approval for creating plans
- **Value:** HIGH - Critical for campaign planning and client proposals

**17. KeywordPlanIdeaService**
- **Methods:** generateKeywordIdeas, generateKeywordHistoricalMetrics
- **Use Case:** Discover new keyword opportunities with search volume data
- **Example:** "Get 500 keyword ideas related to 'digital marketing' with search volumes"
- **Safety:** READ-ONLY - No safety needed
- **Value:** HIGH - Keyword research for new campaigns

---

#### GROUP 5: BIDDING & BUDGET (4 services)

**18. BiddingStrategyService**
- **Methods:** mutate
- **Use Case:** Create portfolio bidding strategies shared across campaigns
- **Example:** "Create Target CPA bidding strategy at $50 used by 10 campaigns"
- **Safety:** WRITE - Approval + financial impact calculation
- **Value:** HIGH - Centralized bid management

**19. BiddingSeasonalityAdjustmentService**
- **Methods:** mutate
- **Use Case:** Adjust bids for seasonal events (Black Friday, holidays, sales)
- **Example:** "Increase bids 30% during Black Friday week (Nov 24-30)"
- **Safety:** WRITE - Approval + percentage change validation
- **Value:** MEDIUM-HIGH - Seasonal bid optimization

**20. AccountBudgetService**
- **Methods:** get, list
- **Use Case:** View account-level monthly budgets (for managed/invoice accounts)
- **Example:** "Check current monthly account budget and spend"
- **Safety:** READ-ONLY - No safety needed
- **Value:** MEDIUM - Budget monitoring for large accounts

**21. AccountBudgetProposalService**
- **Methods:** mutate
- **Use Case:** Propose account budget changes (requires Google approval)
- **Example:** "Request increase in monthly account budget from $100K to $150K"
- **Safety:** WRITE - Approval + financial impact (show monthly difference)
- **Value:** MEDIUM - For managed accounts only

---

#### GROUP 6: AD EXTENSIONS (4 services)

**22. CallAssetService**
- **Methods:** mutate
- **Use Case:** Add phone call extensions to ads
- **Example:** "Add phone number +1-555-123-4567 to all campaigns"
- **Safety:** WRITE - Approval for bulk operations
- **Value:** MEDIUM - Increases ad visibility and calls

**23. SitelinkAssetService**
- **Methods:** mutate
- **Use Case:** Add sitelink extensions (additional links below ad)
- **Example:** "Add sitelinks: 'Pricing', 'Contact Us', 'Free Trial' to campaigns"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Improves ad real estate and CTR

**24. StructuredSnippetAssetService**
- **Methods:** mutate
- **Use Case:** Add structured snippets (feature highlights)
- **Example:** "Add snippet 'Services: SEO, PPC, Social Media, Content Marketing'"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Shows service/product variety

**25. PromotionAssetService**
- **Methods:** mutate
- **Use Case:** Add promotion extensions (sales, discounts)
- **Example:** "Add '25% Off Black Friday Sale' promotion to shopping campaigns"
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Highlights special offers

---

#### GROUP 7: REPORTING & CHANGE TRACKING (2 services)

**26. ChangeStatusService**
- **Methods:** get, list
- **Use Case:** Track what changed in account
- **Example:** "Show all changes made to account in last 7 days"
- **Safety:** READ-ONLY
- **Value:** MEDIUM - Audit trail (we already have ChangeEventService)
- **Note:** Similar to ChangeEventService we already have - may skip

**27. InvoiceService**
- **Methods:** list, get
- **Use Case:** Download invoices and billing data
- **Example:** "Get invoice for October 2025, check billing status"
- **Safety:** READ-ONLY
- **Value:** LOW-MEDIUM - Financial reporting

**28. BatchJobService**
- **Methods:** mutate, list, run
- **Use Case:** Perform bulk operations asynchronously
- **Example:** "Upload 10,000 keyword additions via batch job"
- **Safety:** WRITE - Approval + show full list of operations before executing
- **Value:** MEDIUM - Large-scale bulk operations

---

### REMOVED FROM PLAN (Per Your Request):
- ❌ RecommendationService
- ❌ RecommendationSubscriptionService
- ❌ SmartCampaignService (can add later if needed)

### TOTAL GOOGLE ADS EXPANSION: 28 New Services
**Current:** 12 tools
**After Expansion:** ~40 tools
**Integration Time:** 10-14 hours

---

## PHASE 1B: GOOGLE ANALYTICS ADMIN API EXPANSION

### Currently Integrated: 5 Tools
- list_analytics_accounts
- list_analytics_properties
- list_data_streams
- run_analytics_report (with dimensions/metrics)
- get_realtime_users

### NEW ADMIN API METHODS: 25 Methods

---

#### GROUP 1: PROPERTY MANAGEMENT (2 methods) - CRITICAL

**1. properties.create**
- **Use Case:** Automatically create new GA4 properties for clients
- **Example:** "Create GA4 property for new client website with timezone EST"
- **Practitioner Value:** Streamline client onboarding - no more manual property setup
- **Safety:** WRITE - Approval required
- **Value:** HIGH

**2. properties.update**
- **Use Case:** Update property settings (timezone, currency, industry)
- **Example:** "Change property timezone from PST to EST after client moves office"
- **Practitioner Value:** Bulk update property settings across multiple clients
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM

**REMOVED:** properties.delete (blocked - same rule as delete_property)

---

#### GROUP 2: DATA STREAMS (6 methods) - HIGH VALUE

**3. dataStreams.create**
- **Use Case:** Add website or app tracking to property
- **Example:** "Create web data stream for www.client.com to start tracking"
- **Practitioner Value:** Set up tracking for new client sites automatically
- **Safety:** WRITE - Approval required
- **Value:** CRITICAL - Required for any tracking

**4. dataStreams.update**
- **Use Case:** Update stream URL, name, or settings
- **Example:** "Update data stream URL after client domain migration"
- **Practitioner Value:** Maintain accurate tracking after site changes
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM

**5. dataStreams.delete**
- **Use Case:** Remove tracking for old sites/apps
- **Example:** "Delete data stream for discontinued subdomain"
- **Practitioner Value:** Clean up old tracking configurations
- **Safety:** ❌ BLOCKED or VERY HIGH approval (destructive)
- **Value:** LOW - Rarely needed

**6. dataStreams.measurementProtocolSecrets.create**
- **Use Case:** Generate secrets for server-side tracking
- **Example:** "Create Measurement Protocol secret for backend event tracking"
- **Practitioner Value:** Enable server-side conversion tracking
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Advanced tracking setups

**7. dataStreams.updateEnhancedMeasurementSettings**
- **Use Case:** Enable/disable auto-tracking (scrolls, clicks, video views, file downloads)
- **Example:** "Enable video engagement tracking for all data streams"
- **Practitioner Value:** Bulk configure enhanced measurement across clients
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Automated event tracking

**8. dataStreams.eventCreateRules.create**
- **Use Case:** Auto-create events from existing parameters
- **Example:** "Create 'view_product_category' event when page_location contains '/products/'"
- **Practitioner Value:** Create custom events without code changes
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Event customization

---

#### GROUP 3: CUSTOM DEFINITIONS (6 methods) - HIGH VALUE

**9. customDimensions.create**
- **Use Case:** Create custom dimensions for tracking additional data
- **Example:** "Create 'Customer Segment' custom dimension (scope: user)"
- **Practitioner Value:** Track client-specific data beyond default GA4 dimensions
- **Safety:** WRITE - Approval required
- **Value:** HIGH - Essential for custom tracking

**10. customDimensions.update**
- **Use Case:** Update dimension display name or description
- **Example:** "Rename 'cd1' to 'Customer Segment' for clarity"
- **Practitioner Value:** Maintain clear dimension naming
- **Safety:** WRITE - Approval required
- **Value:** LOW - Rarely needed

**11. customDimensions.archive**
- **Use Case:** Archive old custom dimensions
- **Example:** "Archive unused 'Old Campaign ID' dimension"
- **Practitioner Value:** Clean up dimension list
- **Safety:** WRITE - Approval required
- **Value:** LOW - Cleanup only

**12. customMetrics.create**
- **Use Case:** Create custom metrics for numeric tracking
- **Example:** "Create 'Customer Lifetime Value' custom metric"
- **Practitioner Value:** Track custom KPIs beyond default GA4 metrics
- **Safety:** WRITE - Approval required
- **Value:** HIGH - Custom KPI tracking

**13. customMetrics.update**
- **Use Case:** Update metric display name or unit
- **Example:** "Change 'CLV' display to 'Customer Lifetime Value (USD)'"
- **Practitioner Value:** Maintain clear metric naming
- **Safety:** WRITE - Approval required
- **Value:** LOW - Rarely needed

**14. customMetrics.archive**
- **Use Case:** Archive old custom metrics
- **Example:** "Archive unused 'Old Revenue' metric"
- **Practitioner Value:** Clean up metric list
- **Safety:** WRITE - Approval required
- **Value:** LOW - Cleanup only

---

#### GROUP 4: AUDIENCES (3 methods) - MEDIUM-HIGH VALUE

**15. audiences.create**
- **Use Case:** Build remarketing audiences for Google Ads
- **Example:** "Create audience of users who viewed product but didn't purchase (last 30 days)"
- **Practitioner Value:** Create remarketing lists from GA4 data automatically
- **Safety:** WRITE - Approval required
- **Value:** HIGH - Remarketing audience creation

**16. audiences.update**
- **Use Case:** Modify audience definitions
- **Example:** "Update 'High Value Users' audience to include users with 5+ sessions (was 3+)"
- **Practitioner Value:** Refine audience targeting based on performance
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Audience optimization

**17. audiences.archive**
- **Use Case:** Archive old audiences
- **Example:** "Archive 'Q3 Promotion' audience after campaign ends"
- **Practitioner Value:** Clean up audience list
- **Safety:** WRITE - Approval required
- **Value:** LOW - Cleanup only

---

#### GROUP 5: CONVERSION EVENTS (3 methods) - CRITICAL

**18. conversionEvents.create** (formerly conversionActions)
- **Use Case:** Mark GA4 events as conversions
- **Example:** "Mark 'purchase' and 'sign_up' events as key conversions"
- **Practitioner Value:** Define which events count as conversions for reporting
- **Safety:** WRITE - Approval required
- **Value:** CRITICAL - Required for conversion tracking

**19. conversionEvents.patch**
- **Use Case:** Update conversion settings (counting method)
- **Example:** "Change 'purchase' from 'one per session' to 'every'"
- **Practitioner Value:** Optimize conversion counting for accurate reporting
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Conversion optimization

**20. conversionEvents.delete**
- **Use Case:** Remove events from conversion tracking
- **Example:** "Stop counting 'page_view' as conversion (was set incorrectly)"
- **Practitioner Value:** Fix conversion tracking mistakes
- **Safety:** WRITE - Approval + confirmation (changes historical reporting)
- **Value:** MEDIUM - Correction tool

---

#### GROUP 6: GOOGLE ADS INTEGRATION (3 methods) - HIGH VALUE

**21. googleAdsLinks.create**
- **Use Case:** Link GA4 property to Google Ads account
- **Example:** "Link GA4 property to Google Ads account 123-456-7890"
- **Practitioner Value:** Enable conversion import to Google Ads for bidding
- **Safety:** WRITE - Approval required
- **Value:** CRITICAL - Required to send GA4 conversions to Google Ads

**22. googleAdsLinks.update**
- **Use Case:** Update link settings
- **Example:** "Enable personalized advertising for Google Ads link"
- **Practitioner Value:** Configure conversion import settings
- **Safety:** WRITE - Approval required
- **Value:** MEDIUM - Link configuration

**23. googleAdsLinks.delete**
- **Use Case:** Unlink GA4 from Google Ads
- **Example:** "Remove Google Ads link after campaign ends"
- **Practitioner Value:** Disconnect properties when no longer needed
- **Safety:** WRITE - Approval + confirmation (stops conversion import)
- **Value:** LOW - Rarely needed

---

#### GROUP 7: DATA RETENTION & ACCESS (2 methods)

**24. dataRetentionSettings.update**
- **Use Case:** Configure how long GA4 keeps user data (2 or 14 months)
- **Example:** "Set data retention to 14 months for compliance"
- **Practitioner Value:** Bulk configure retention across client properties
- **Safety:** WRITE - Approval required (affects data availability)
- **Value:** MEDIUM - Compliance and data governance

**25. getDataSharingSettings**
- **Use Case:** View data sharing settings with Google
- **Example:** "Check if property shares data with Google products"
- **Practitioner Value:** Audit data sharing for client compliance
- **Safety:** READ-ONLY
- **Value:** LOW - Informational only

---

### TOTAL GOOGLE ANALYTICS ADMIN EXPANSION: 25 New Methods
**Current:** 5 tools
**After Expansion:** ~30 tools
**Integration Time:** 6-8 hours

### WHAT THIS ADDS FOR PRACTITIONERS:
**Before:** Can only VIEW GA4 data (reports, real-time)
**After:** Can MANAGE entire GA4 property (setup, configuration, audiences, conversions, Google Ads linking)

**Key Value:** Complete GA4 account setup and management via LLM instead of clicking through GA4 UI

---

## PHASE 2: NEW API INTEGRATIONS

### API 1: GOOGLE BUSINESS PROFILE (~12 tools)

#### Locations Management (5 tools)
**1. list_locations**
- Use: Get all business locations for account
- Safety: READ-ONLY
- Value: See all client locations

**2. get_location**
- Use: Get details for specific location
- Safety: READ-ONLY
- Value: Location data

**3. update_location**
- Use: Update hours, description, categories, phone, address
- Example: "Update business hours for all 50 locations after seasonal change"
- Safety: WRITE - Approval for bulk, vagueness detection
- Value: HIGH - Bulk location management

**4. create_location**
- Use: Add new business location
- Example: "Add new store at '123 Main St, New York, NY'"
- Safety: WRITE - Approval required
- Value: MEDIUM - New location setup

**5. verify_location**
- Use: Initiate verification (SMS, postcard, phone, email)
- Example: "Request postcard verification for new location"
- Safety: WRITE - Approval required
- Value: MEDIUM - Required for new locations

#### Reviews Management (3 tools)
**6. list_reviews**
- Use: Get all reviews for location(s)
- Example: "Get last 100 reviews for all locations"
- Safety: READ-ONLY
- Value: HIGH - Review monitoring

**7. get_review**
- Use: Get specific review details
- Safety: READ-ONLY
- Value: Get review data

**8. reply_to_review**
- Use: Respond to customer reviews
- Example: "Reply to 5-star review: 'Thank you for your feedback!'"
- Safety: WRITE - Approval + VAGUENESS CHECK (no generic replies!)
- Value: CRITICAL - Review response management

#### Posts & Media (3 tools)
**9. create_local_post**
- Use: Create posts (offers, events, updates, products)
- Example: "Post 'Holiday Sale - 20% Off' to all locations"
- Safety: WRITE - Approval for bulk posting
- Value: MEDIUM - Local marketing

**10. delete_post**
- Use: Remove outdated posts
- Safety: WRITE - Approval required
- Value: LOW - Cleanup

**11. upload_media**
- Use: Upload photos to business profile
- Example: "Upload 10 product photos to location"
- Safety: WRITE - Approval for bulk uploads
- Value: MEDIUM - Visual content management

#### Performance (1 tool)
**12. get_location_insights**
- Use: Get performance metrics (views, clicks, direction requests, calls)
- Example: "Get last month's insights for all 50 locations"
- Safety: READ-ONLY
- Value: HIGH - Local SEO performance tracking

**Integration Time:** 5-6 hours

---

### API 2: BIGQUERY (~20 tools)

#### Use Case: Data Blending Powerhouse
**What Practitioners Can Do:**
1. Pull Google Ads data → Store in BigQuery
2. Pull Search Console data → Store in BigQuery
3. Pull Analytics data → Store in BigQuery
4. Run SQL query to blend all three sources
5. Export results to Google Sheets or Looker Studio
6. Automate weekly via Data Transfer Service

#### Datasets (4 tools)
**1. create_dataset**
- Use: Create dataset to organize tables
- Example: "Create 'client_abc_marketing_data' dataset"
- Safety: WRITE - Approval required
- Value: HIGH - Organization

**2. list_datasets**
- Safety: READ-ONLY
- Value: List datasets

**3. get_dataset**
- Safety: READ-ONLY
- Value: Dataset details

**4. update_dataset**
- Use: Update description, labels, access control
- Safety: WRITE - Approval required
- Value: LOW - Metadata updates

**REMOVED:** delete_dataset (blocked - too destructive)

#### Tables (5 tools)
**5. create_table**
- Use: Create table with schema
- Example: "Create 'google_ads_performance' table with columns: date, campaign, clicks, cost"
- Safety: WRITE - Approval required
- Value: HIGH - Data storage

**6. list_tables**
- Safety: READ-ONLY
- Value: See tables

**7. get_table**
- Safety: READ-ONLY
- Value: Table details

**8. update_table_schema**
- Use: Add/modify columns
- Example: "Add 'conversion_value' column to table"
- Safety: WRITE - Approval required
- Value: MEDIUM - Schema evolution

**9. insert_rows_streaming**
- Use: Insert data in real-time (tabledata.insertAll)
- Example: "Stream Google Ads hourly performance data to BigQuery"
- Safety: WRITE - Approval for bulk inserts (show row count)
- Value: HIGH - Real-time data loading

**REMOVED:** delete_table (blocked - too destructive)

#### Queries (5 tools)
**10. run_query_sync**
- Use: Run SQL query, get results immediately (jobs.query)
- Example: "SELECT campaign, SUM(cost) FROM ads GROUP BY campaign"
- Safety: READ-ONLY (queries don't modify data)
- Value: CRITICAL - Data analysis

**11. run_query_async**
- Use: Run large queries asynchronously (jobs.insert)
- Example: "Join 3 billion rows from Ads, GSC, Analytics"
- Safety: READ-ONLY
- Value: HIGH - Big data analysis

**12. get_query_results**
- Use: Retrieve results from async query
- Safety: READ-ONLY
- Value: Get query data

**13. cancel_query**
- Use: Stop long-running query
- Safety: WRITE - No approval needed (just canceling)
- Value: LOW - Query management

**14. save_query_results_to_table**
- Use: Write query results to new table
- Example: "Save blended Ads+GSC analysis to 'weekly_performance' table"
- Safety: WRITE - Approval required
- Value: HIGH - Persist analysis results

#### Data Transfer Service (4 tools)
**15. create_transfer_google_ads**
- Use: Auto-import Google Ads data daily
- Example: "Set up daily import of Google Ads data to BigQuery"
- Safety: WRITE - Approval required
- Value: CRITICAL - Automated data pipeline

**16. create_transfer_search_console**
- Use: Auto-import Search Console data daily
- Example: "Set up daily import of GSC data to BigQuery"
- Safety: WRITE - Approval required
- Value: HIGH - SEO data pipeline

**17. create_transfer_analytics**
- Use: Auto-import GA4 data daily
- Example: "Set up daily import of GA4 events to BigQuery"
- Safety: WRITE - Approval required
- Value: HIGH - Analytics data pipeline

**18. list_transfers**
- Use: See all configured data transfers
- Safety: READ-ONLY
- Value: Monitor transfers

**19. run_transfer_now**
- Use: Trigger transfer immediately (don't wait for schedule)
- Example: "Run Google Ads transfer now to get today's data"
- Safety: WRITE - Approval required (may incur costs)
- Value: MEDIUM - Ad-hoc data refresh

**20. get_transfer_runs**
- Use: Check transfer success/failure status
- Safety: READ-ONLY
- Value: Monitor data pipeline health

**Integration Time:** 8-10 hours

**What This Enables:**
- Store all Google Ads, GSC, Analytics data in one place
- Run SQL to blend data from multiple sources
- Historical analysis (BigQuery keeps data indefinitely)
- Export results to Sheets, Looker Studio, or BI tools

---

### API 3: BRIGHT DATA SERP API (~10 tools)

**Your API Key:** f3f7faff-5020-4890-8603-1521ce4b207d
**Status:** Suspended - activate credits first

#### Core SERP Tools (7 tools)
**1. search_google**
- Use: Get organic search results
- Example: "Get top 100 results for 'digital marketing agency NYC'"
- Safety: READ-ONLY
- Value: CRITICAL - Rank tracking, competitor analysis

**2. search_google_shopping**
- Use: Get shopping results and PLAs
- Example: "See Shopping ads for 'running shoes'"
- Safety: READ-ONLY
- Value: HIGH - Shopping competitor analysis

**3. search_google_news**
- Use: Get news results
- Example: "Find recent news about 'Google Ads updates'"
- Safety: READ-ONLY
- Value: MEDIUM - News monitoring

**4. search_google_images**
- Use: Get image search results
- Example: "See image results for 'brand logo'"
- Safety: READ-ONLY
- Value: MEDIUM - Visual content research

**5. search_google_videos**
- Use: Get video search results
- Example: "See video results for 'product demo'"
- Safety: READ-ONLY
- Value: MEDIUM - Video content research

**6. search_google_local**
- Use: Get local pack results
- Example: "Get map pack for 'restaurants near times square'"
- Safety: READ-ONLY
- Value: HIGH - Local SEO analysis

**7. search_google_maps**
- Use: Get Google Maps search results
- Example: "Get all dentists in Brooklyn with ratings"
- Safety: READ-ONLY
- Value: HIGH - Local competitor research

#### Advanced SERP Tools (3 tools)
**8. get_serp_features**
- Use: Extract SERP features (featured snippets, knowledge panel, people also ask)
- Example: "Check if we rank in featured snippet for 'SEO tips'"
- Safety: READ-ONLY
- Value: HIGH - SERP feature tracking

**9. track_keyword_rankings**
- Use: Batch rank tracking for keywords
- Example: "Track rankings for 1,000 keywords across 50 client sites"
- Safety: READ-ONLY
- Value: CRITICAL - Automated rank tracking

**10. scrape_webpage_llm**
- Use: LLM-powered web scraping
- Example: "Extract all product prices from competitor website"
- Safety: READ-ONLY
- Value: MEDIUM - Competitive intelligence

**Integration Time:** 4-5 hours

**What This Enables:**
- Automated rank tracking (no 100-result Google API limit)
- Competitor SERP analysis
- Featured snippet opportunities
- Local pack monitoring
- Unlimited search queries (vs Google's 100/day free limit)

---

## PHASE 3: ANALYTICS SOLUTION EVALUATION (AFTER PHASE 1 & 2)

### Goal: Easy-to-use BI platform for global network (1,000+ users)

**Decision:** Will test all 3 candidates after API work is complete, then choose best

### TOP 3 CANDIDATES TO TEST:

#### Option 1: METABASE (BEST FOR NON-TECHNICAL) ⭐ RECOMMENDED

**Pros:**
- Easiest UI - "first time non-technical users created their own dashboards"
- Visual query builder (no SQL required)
- Full REST API - LLM creates dashboards via JSON
- Free (open source) or $40/user/month (cloud)
- Built-in templates and examples
- Natural language queries with AI

**Cons:**
- Less visualization types than Superset (but covers 90% of needs)
- API endpoints changed in v0.47+ (need to verify current version)

**API Example:**
```json
POST /api/v1/dashboard/
{
  "name": "Client Performance",
  "cards": [
    {
      "visualization": "bar",
      "sql": "SELECT campaign, sum(cost) FROM google_ads GROUP BY 1",
      "row": 0, "col": 0, "sizeX": 6, "sizeY": 4
    }
  ]
}
```

**For Your Network:**
- Create template dashboards for common use cases
- Non-technical practitioners can clone and customize
- LLM can generate new dashboards on demand
- Easy to train (1-2 hours max)

---

#### Option 2: APACHE SUPERSET (MOST POWERFUL)

**Pros:**
- FREE (open source)
- 60+ chart types (most in market)
- Beautiful visualizations
- Strong community
- Full REST API
- Scales to enterprise

**Cons:**
- Steeper learning curve - requires SQL knowledge
- Complex setup (DevOps/Python needed)
- Less beginner-friendly than Metabase
- UI not as polished

**API Example:**
```json
POST /api/v1/chart/
{
  "slice_name": "Sales by Region",
  "viz_type": "dist_bar",
  "datasource_id": 1,
  "params": {
    "metrics": ["sum__sales"],
    "groupby": ["region"]
  }
}
```

**For Your Network:**
- More powerful for advanced users
- Requires training (3-5 hours)
- Best for data analysts, harder for marketers

---

#### Option 3: GOOGLE SHEETS API + CHARTS (NATIVE GOOGLE)

**Pros:**
- Already in Google ecosystem
- Everyone knows Google Sheets
- Full API for charts (AddChartRequest)
- Zero additional cost
- Zero training needed
- Works on any device

**Cons:**
- Not a "BI platform" - just spreadsheets with charts
- Less interactive than Metabase/Superset
- Limited to ~10M cells per sheet
- Not designed for large-scale BI

**API Example:**
```json
{
  "addChart": {
    "chart": {
      "spec": {
        "basicChart": {
          "chartType": "BAR",
          "domains": [{"domain": {"sourceRange": "A1:A10"}}],
          "series": [{"series": {"sourceRange": "B1:B10"}}]
        }
      }
    }
  }
}
```

**For Your Network:**
- Use for simple reports and charts
- LLM pulls data from MCP → writes to Sheet → creates charts
- Easy but limited

---

### TESTING APPROACH (AFTER API WORK COMPLETE)

**Will Test All 3 Platforms:**
1. Apache Superset (most powerful, free)
2. Metabase (easiest UI, free or $40/user)
3. Evidence.dev (markdown-based, perfect for LLM)

**Evaluation Criteria:**
- Ease of use for non-technical practitioners
- Template creation and sharing
- LLM integration quality
- Training time required
- User experience at scale (1,000+ users)

**Process:**
1. Integrate MCP with each platform
2. Create sample templates for common reports
3. Test with real Google Ads/Analytics/BigQuery data
4. Evaluate which is easiest for global network
5. Select winner and fully integrate

**Timeline:** After Phase 1 & 2 complete (Week 3)

---

## IMPLEMENTATION TIMELINE

### Week 1: Google Ads Expansion (10-14 hours)
**Monday-Tuesday:** Conversion services (5 services, 4 hours)
**Wednesday:** Assets & creative (4 services, 3 hours)
**Thursday:** Audiences & targeting (6 services, 4 hours)
**Friday:** Bidding, extensions, reporting (12 services, 3-4 hours)

### Week 2: Google Analytics + Phase 2 Setup (14-18 hours)
**Monday-Tuesday:** GA Admin API (25 methods, 6-8 hours)
**Wednesday:** Business Profile API (12 tools, 5-6 hours)
**Thursday:** BigQuery API (20 tools, 8-10 hours - split)
**Friday:** Bright Data SERP (10 tools, 4-5 hours - activate credits first)

### Week 3: BI Platform Integration (8-12 hours)
**Monday:** Metabase API research and planning (2 hours)
**Tuesday-Wednesday:** Metabase integration (12 tools, 4-5 hours)
**Thursday:** Google Sheets Charts API (8 tools, 6 hours - mark as deferred for now)
**Friday:** Testing, documentation, safety verification

**TOTAL: 32-44 hours (3 weeks)**

---

## SAFETY INTEGRATION - ALL NEW TOOLS

Every WRITE operation will have:
✅ Approval workflow (preview → confirm → execute)
✅ Vagueness detection (block vague requests)
✅ Bulk operation limits (max 20-50 items)
✅ Financial impact calculation (where applicable)
✅ Snapshots for rollback
✅ Notifications (dual-level)
✅ No destructive account-level deletions

**Special Safety Rules:**
- ❌ BLOCKED: property.delete, dataset.delete, table.delete, dataStream.delete
- ⚠️ HIGH APPROVAL: Any deletion operations
- 💰 FINANCIAL IMPACT: All budget/bid changes
- 🔍 VAGUENESS: Review replies, location updates (must be specific)
- 📊 BULK LIMITS: Asset uploads (50 max), audience creation, location updates

---

## FINAL DELIVERABLES

**APIs:** 10 total (4 existing + 6 new)
**Tools:** ~140 total (31 current + ~110 new)
**BI Platform:** Metabase + Google Sheets
**Timeline:** 3 weeks
**Cost:** $0-40/user/month for BI

**Value for Practitioners:**
- Complete Google Ads management via LLM
- Full GA4 setup and configuration
- Local SEO management (Business Profile)
- Data blending and analysis (BigQuery)
- Unlimited SERP data (Bright Data)
- Easy dashboard creation (Metabase)

Ready to start with Phase 1A (Google Ads expansion)?