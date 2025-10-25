---
name: mcp-server
description: Find available MCP tools across 7 Google APIs (31 total) with capabilities and use cases. Triggers when asking about tool availability, which API to use, available metrics, platform features, or tool capabilities.
---

# MCP Server Skill - Available Tools & Platforms

**Keywords that trigger this skill:** "what tools available", "connected platforms", "which API to use", "what metrics available", "list all tools", "tool capabilities", "which tool for"

## 🎯 When to Use This

Use this skill when:
- User asks what tools are available for a task
- User needs to find the right API for their use case
- User wants to know what metrics/dimensions are available
- User needs to understand tool capabilities and limitations

## 📊 Quick Tool Summary

**31 Total Tools** across 7 Google APIs:

### Search Console (GSC) - 11 tools
Organic search performance, indexing, sitemaps, Core Web Vitals
- list_properties - See all GSC properties you have access to
- query_search_analytics - Get organic clicks, impressions, CTR, position
- inspect_url - Check indexing status
- submit_sitemap / delete_sitemap / list_sitemaps - Manage sitemaps
- get_core_web_vitals_origin / get_core_web_vitals_url - Performance metrics
- compare_cwv_form_factors - Desktop vs mobile comparison
- get_property - Get property details
- get_sitemap - Get sitemap details
- add_property - Add new property to Search Console

### Google Ads - 14 tools
Campaigns, budgets, keywords, conversions, audiences
- list_accessible_accounts - Find accessible Google Ads accounts
- list_campaigns - List all campaigns
- update_campaign_status - Change campaign status (ENABLED, PAUSED, REMOVED)
- create_campaign - Create new campaign
- get_campaign_performance - Clicks, spend, conversions, ROAS
- get_search_terms_report - Actual searches triggering your ads
- add_keywords / add_negative_keywords - Keyword management
- create_budget / update_budget - Budget management
- list_budgets - View all campaign budgets
- list_conversion_actions - View conversion tracking
- get_keyword_performance - Keyword Quality Scores and metrics
- upload_click_conversions - Import offline conversions
- upload_conversion_adjustments - Adjust for refunds, upgrades
- list_user_lists - View remarketing lists
- create_user_list - Create new remarketing list
- upload_customer_match_list - Upload customer emails/phones
- create_audience - Create audience segments
- list_assets - View creative assets
- list_bidding_strategies - View bidding strategies
- list_ad_extensions - View sitelinks, calls, snippets
- generate_keyword_ideas - Keyword research with search volume
- create_conversion_action - Set up conversion tracking

### Google Analytics (GA4) - 5 tools
Website/app traffic, user behavior, custom events
- list_analytics_accounts / list_analytics_properties - Account discovery
- run_analytics_report - Custom reports (100+ dimensions, 200+ metrics)
- get_realtime_users - Active users in last 30 minutes
- list_data_streams - Web/app tracking setup
- create_analytics_property - Create new GA4 property
- create_data_stream - Set up website/app tracking
- create_custom_dimension - Track custom dimensions
- create_custom_metric - Track custom metrics
- create_conversion_event - Mark GA4 events as conversions
- create_google_ads_link - Link GA4 to Google Ads

### BigQuery - 2 tools
Data warehouse, SQL queries, data blending
- list_bigquery_datasets - See available datasets
- run_bigquery_query - Execute SQL, join platform data
- create_bigquery_dataset - Create dataset for data storage

### Business Profile - 3 tools
Local SEO, multi-location management
- list_business_locations - See all business locations
- get_business_location - Get location details
- update_business_location - Bulk update hours, phone, address

### Reporting Platform (WPP Analytics) - 4 tools
Create visualizations, dashboards, data analysis
- create_dashboard_from_table - Auto-create dashboards from BigQuery
- create_dashboard_from_platform - Create dashboard directly from platform data
- push_platform_data_to_bigquery - Pull platform data → BigQuery
- list_dashboard_templates - Pre-built dashboard templates
- analyze_gsc_data_for_insights - Generate executive summaries

### Chrome DevTools - 15 tools
Browser automation and debugging
- list_pages - See open browser tabs
- new_page - Open new browser tab
- navigate_page - Go to URL
- take_screenshot - Capture page screenshot
- take_snapshot - Get DOM snapshot
- click - Click element
- fill - Fill form field
- evaluate_script - Run JavaScript
- list_console_messages - See console logs
- list_network_requests - Monitor network activity
- get_network_request - Get request/response details
- handle_dialog - Handle browser dialogs
- wait_for - Wait for conditions
- resize_page - Resize browser window
- select_page - Select specific tab

### SERP Search
- search_google - Get Google organic results with full SERP data (100+ results, no API limits)

## 📈 Available Metrics by Platform

### Search Console
**Dimensions:** date, query, page, device, country, search_appearance
**Metrics:** clicks, impressions, ctr, position, average_position

### Google Ads
**Dimensions:** campaign, ad_group, keyword, device, location, match_type
**Metrics:** cost, conversions, conversion_value, clicks, impressions, ctr, cpc, roas, quality_score

### Analytics (GA4)
**Dimensions:** date, source, medium, campaign, page, country, device, browser
**Metrics:** activeUsers, sessions, screenPageViews, conversions, totalRevenue, bounceRate, engagementRate

### BigQuery
- Any custom SQL query combining any platform data
- 100+ dimensions, 200+ metrics across all Google APIs

## 🔍 How to Use Tools Effectively

### For Search Performance
Use GSC tools to find:
- Which queries drive traffic (query_search_analytics)
- Indexing issues (inspect_url)
- Performance by device (compare_cwv_form_factors)
- Core Web Vitals metrics (get_core_web_vitals_origin, get_core_web_vitals_url)

### For Ads Optimization
Use Ads tools to:
- Find wasted budget (get_search_terms_report)
- Adjust campaign performance (update_campaign_status)
- Scale successful campaigns (update_budget)
- Track conversions (upload_click_conversions)
- Manage keywords and negative keywords

### For Analytics Insights
Use GA4 tools to:
- Understand traffic sources (run_analytics_report)
- Create custom reports with any dimensions/metrics
- Monitor live traffic (get_realtime_users)
- Set up conversion tracking

### For Data Blending
Use BigQuery to:
- Combine data from all platforms
- Find correlations (Ads spend → organic clicks → revenue)
- Create unified reporting views
- Run complex SQL analysis

### For Dashboards
Use Dashboard tools to:
- Auto-create visual reports
- Push platform data to BigQuery
- Generate executive summaries
- Share dashboards with team

## 🚀 Common Workflows

### Workflow 1: Find Top Keywords
1. Use `query_search_analytics` (GSC) to get search data
2. Filter by date range and metrics
3. Create dashboard with `create_dashboard_from_platform`

### Workflow 2: Optimize Google Ads Budget
1. Use `get_campaign_performance` to see which campaigns convert
2. Use `get_search_terms_report` to find wasted budget
3. Use `update_budget` to reallocate to top performers
4. Use `add_negative_keywords` to block waste

### Workflow 3: Cross-Platform Analysis
1. Use `push_platform_data_to_bigquery` to pull GSC, Ads, GA4 data
2. Use `run_bigquery_query` to join datasets (Ads spend + organic clicks + revenue)
3. Use `create_dashboard_from_table` to visualize results

### Workflow 4: Local SEO (Multi-Location)
1. Use `list_business_locations` to see all locations
2. Use `update_business_location` to bulk update hours/phone
3. Use `get_business_location` to verify changes

## 📊 Tool Categories

**Read Tools (Safe - No Approval):**
- list_* tools
- query_* tools
- get_* tools
- run_* tools
- inspect_* tools

**Write Tools (Requires Approval Preview):**
- create_* tools
- update_* tools
- add_* tools
- upload_* tools
- delete_* tools
- submit_* tools

## 🔐 Authentication

All tools use **OAuth 2.0** authentication:
- Each user's own Google credentials
- No service accounts or API keys
- Auto-refresh for expired tokens
- Supports 31 tools across 7 Google APIs

## 📚 Reference

**File Structure:**
- Search Console tools: src/gsc/tools/
- Google Ads tools: src/ads/tools/
- Analytics tools: src/analytics/tools/
- BigQuery tools: src/bigquery/tools.ts
- Business Profile tools: src/business-profile/tools.ts
- Reporting Platform tools: src/wpp-analytics/tools/
- Chrome DevTools: mcp__chrome-devtools__*
- SERP Search: src/serp/tools.ts

**Documentation:** src/wpp-analytics/README.md (comprehensive examples)

## 🎯 Next Steps

1. Identify what data you need (search performance, ads, analytics, etc.)
2. Find the right tool from the 31 available
3. Use the tool to get/modify data
4. For complex analysis, use BigQuery to blend multiple platforms
5. Create dashboards to visualize insights
