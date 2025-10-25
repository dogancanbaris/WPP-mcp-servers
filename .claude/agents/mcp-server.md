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

### Google Ads - 14 tools
Campaigns, budgets, keywords, conversions, audiences
- list_campaigns, update_campaign_status - Manage campaigns
- get_campaign_performance - Clicks, spend, conversions, ROAS
- get_search_terms_report - Actual searches triggering your ads
- add_keywords / add_negative_keywords - Keyword management
- create_budget / update_budget - Budget management
- list_conversion_actions, upload_click_conversions - Conversion tracking
- create_user_list, upload_customer_match_list - Audience targeting

### Google Analytics (GA4) - 5 tools
Website/app traffic, user behavior, custom events
- list_analytics_accounts / list_analytics_properties - Account discovery
- run_analytics_report - Custom reports (100+ dimensions, 200+ metrics)
- get_realtime_users - Active users in last 30 minutes
- list_data_streams - Web/app tracking setup

### BigQuery - 2 tools
Data warehouse, SQL queries, data blending
- list_bigquery_datasets - See available datasets
- run_bigquery_query - Execute SQL, join platform data

### Business Profile - 3 tools
Local SEO, multi-location management
- list_business_locations, get_business_location - Location info
- update_business_location - Bulk update hours, phone, address

### Dashboard Tools (WPP Analytics) - 4 tools
Create visualizations, dashboards, data analysis
- create_dashboard_from_table - Auto-create dashboards from BigQuery
- push_platform_data_to_bigquery - Pull platform data → BigQuery
- list_dashboard_templates - Pre-built dashboard templates
- analyze_gsc_data_for_insights - Generate executive summaries

## 📈 Available Metrics by Platform

### Search Console
**Dimensions:** date, query, page, device, country
**Metrics:** clicks, impressions, ctr, position

### Google Ads
**Dimensions:** campaign, ad_group, keyword, device, location
**Metrics:** cost, conversions, conversion_value, clicks, impressions, ctr, cpc, roas

### Analytics (GA4)
**Dimensions:** date, source, medium, campaign, page, country, device
**Metrics:** activeUsers, sessions, screenPageViews, conversions, totalRevenue

## 🔍 How to Use Tools Effectively

### For Search Performance
Use GSC tools to find:
- Which queries drive traffic (query_search_analytics)
- Indexing issues (inspect_url)
- Performance by device (compare_cwv_form_factors)

### For Ads Optimization
Use Ads tools to:
- Find wasted budget (get_search_terms_report)
- Adjust campaign performance (update_campaign_status)
- Scale successful campaigns (update_budget)
- Track conversions (upload_click_conversions)

### For Analytics Insights
Use GA4 tools to:
- Understand traffic sources (run_analytics_report)
- Create custom reports with any dimensions/metrics
- Monitor live traffic (get_realtime_users)

### For Data Blending
Use BigQuery to:
- Combine data from all platforms
- Find correlations (Ads spend → organic clicks → revenue)
- Create unified reporting views

### For Dashboards
Use Dashboard tools to:
- Auto-create visual reports
- Push platform data to BigQuery
- Generate executive summaries

## 🚀 Next Steps

1. Identify what data you need (search performance, ads, analytics, etc.)
2. Find the right tool from the 31 available
3. Use the tool to get/modify data
4. For complex analysis, use BigQuery to blend multiple platforms

## Reference

File: src/gsc/tools/, src/ads/tools/, src/analytics/tools/, src/bigquery/tools.ts, src/wpp-analytics/tools/
Documentation: src/wpp-analytics/README.md (comprehensive examples)
