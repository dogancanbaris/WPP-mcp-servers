---
name: Cross-Platform Analyzer
description: Analyze data across Google Ads, Search Console, and Analytics using BigQuery joins to find insights like campaigns with high spend but low organic visibility
---

# Cross-Platform Analyzer Skill

## Purpose

Blend data from multiple Google platforms (Ads, Search Console, Analytics) using BigQuery SQL joins to uncover insights impossible to see in single platforms.

## Why This Matters

Each platform shows partial picture:
- **Google Ads:** Paid performance only
- **Search Console:** Organic performance only
- **Analytics:** User behavior only

**Together:** Complete marketing picture!

## Common Cross-Platform Questions

### 1. "Are we bidding on keywords we already rank for organically?"
**Insight:** Wasting money on unnecessary paid clicks

**BigQuery Query:**
```sql
SELECT
  ads.keyword,
  ads.cost_micros/1000000 as monthly_ad_spend,
  ads.clicks as paid_clicks,
  gsc.position as organic_position,
  gsc.clicks as organic_clicks,
  CASE
    WHEN gsc.position <= 3 THEN 'Stop Ads - Ranking #1-3'
    WHEN gsc.position <= 10 THEN 'Consider Reducing Ads - On Page 1'
    ELSE 'Keep Ads - Not Ranking Well'
  END as recommendation
FROM `project.client_ads_keywords` ads
LEFT JOIN `project.client_gsc_queries` gsc
  ON LOWER(ads.keyword) = LOWER(gsc.query)
WHERE ads.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND gsc.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND gsc.position IS NOT NULL  -- Has organic ranking
GROUP BY ads.keyword, ads.cost_micros, ads.clicks, gsc.position, gsc.clicks
ORDER BY monthly_ad_spend DESC
LIMIT 100
```
**Returns:** ~50-100 rows of overlap analysis

**Value:** Could save $5K+/month by pausing Ads for keywords ranking organically

---

### 2. "Which campaigns drive traffic but don't convert?"
**Insight:** Traffic quality issues - wrong audience or landing page problems

**BigQuery Query:**
```sql
SELECT
  ads.campaign_name,
  SUM(ads.clicks) as ad_clicks,
  SUM(ads.cost_micros)/1000000 as total_spend,
  SUM(ga4.sessions) as ga4_sessions,
  SUM(ga4.conversions) as conversions,
  SUM(ga4.conversions) / NULLIF(SUM(ga4.sessions), 0) as conversion_rate,
  SUM(ads.cost_micros/1000000) / NULLIF(SUM(ga4.conversions), 0) as cost_per_conversion
FROM `project.client_ads_campaigns` ads
LEFT JOIN `project.client_ga4_sessions` ga4
  ON DATE(ads.date) = DATE(ga4.session_date)
  AND ads.campaign_name = ga4.campaign  -- GA4 campaign parameter
WHERE ads.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY ads.campaign_name
HAVING SUM(ads.clicks) >= 100  -- Meaningful traffic
ORDER BY total_spend DESC
LIMIT 50
```
**Returns:** 50 campaigns with conversion analysis

**Insights:**
- High spend + low conversions = landing page issue or wrong audience
- Recommend: Pause campaign OR fix landing page OR adjust targeting

---

### 3. "What's our organic visibility for our top paid campaigns?"
**Insight:** Should we invest in SEO for our best-performing Ads topics?

**BigQuery Query:**
```sql
WITH top_campaigns AS (
  SELECT
    campaign_name,
    SUM(cost_micros)/1000000 as total_spend,
    SUM(conversions) as total_conversions
  FROM `project.client_ads_campaigns`
  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  GROUP BY campaign_name
  ORDER BY total_spend DESC
  LIMIT 10
),
campaign_keywords AS (
  SELECT
    ads.campaign_name,
    ads.keyword
  FROM `project.client_ads_keywords` ads
  JOIN top_campaigns tc ON ads.campaign_name = tc.campaign_name
  GROUP BY ads.campaign_name, ads.keyword
)
SELECT
  ck.campaign_name,
  COUNT(DISTINCT gsc.query) as organic_ranking_count,
  AVG(gsc.position) as avg_organic_position,
  SUM(gsc.clicks) as organic_clicks,
  tc.total_spend as campaign_spend
FROM campaign_keywords ck
LEFT JOIN `project.client_gsc_queries` gsc
  ON LOWER(ck.keyword) = LOWER(gsc.query)
JOIN top_campaigns tc ON ck.campaign_name = tc.campaign_name
WHERE gsc.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY ck.campaign_name, tc.total_spend
ORDER BY tc.total_spend DESC
```
**Returns:** 10 campaigns with organic visibility analysis

**Insights:**
- High spend campaign + weak organic = SEO opportunity!
- Create content targeting those campaign keywords organically

---

### 4. "Show me channel overlap and cannibalization"
**Insight:** Are paid and organic competing for same clicks?

**BigQuery Query:**
```sql
SELECT
  query,
  SUM(CASE WHEN source = 'organic' THEN clicks ELSE 0 END) as organic_clicks,
  SUM(CASE WHEN source = 'paid' THEN clicks ELSE 0 END) as paid_clicks,
  AVG(CASE WHEN source = 'organic' THEN position END) as organic_position,
  SUM(CASE WHEN source = 'paid' THEN cost_micros END)/1000000 as paid_cost,
  (SUM(CASE WHEN source = 'paid' THEN cost_micros END)/1000000) /
    NULLIF(SUM(CASE WHEN source = 'paid' THEN clicks END), 0) as cpc
FROM (
  SELECT query, clicks, position, 'organic' as source, 0 as cost_micros
  FROM `project.client_gsc_queries`
  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)

  UNION ALL

  SELECT keyword as query, clicks, NULL as position, 'paid' as source, cost_micros
  FROM `project.client_ads_keywords`
  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
)
GROUP BY query
HAVING organic_clicks > 0 AND paid_clicks > 0  -- Has both sources
ORDER BY paid_cost DESC
LIMIT 100
```
**Returns:** ~100 queries with paid+organic overlap

---

### 5. "True ROI: Ads cost vs GA4 revenue vs organic contribution"
**Insight:** Complete attribution across all channels

**BigQuery Query:**
```sql
SELECT
  DATE_TRUNC(date, WEEK) as week,
  SUM(ads.cost_micros)/1000000 as ads_spend,
  SUM(ga4.purchase_revenue_micros)/1000000 as total_revenue,
  SUM(CASE WHEN ga4.source = 'google_ads' THEN ga4.purchase_revenue_micros END)/1000000 as ads_revenue,
  SUM(CASE WHEN ga4.source = 'google_organic' THEN ga4.purchase_revenue_micros END)/1000000 as organic_revenue,
  (SUM(ga4.purchase_revenue_micros)/1000000) / NULLIF(SUM(ads.cost_micros)/1000000, 0) as blended_roas,
  (SUM(CASE WHEN ga4.source = 'google_ads' THEN ga4.purchase_revenue_micros END)/1000000) /
    NULLIF(SUM(ads.cost_micros)/1000000, 0) as ads_only_roas
FROM `project.client_ads_campaigns` ads
LEFT JOIN `project.client_ga4_conversions` ga4
  ON DATE(ads.date) = DATE(ga4.conversion_date)
WHERE DATE(ads.date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
GROUP BY week
ORDER BY week DESC
LIMIT 52  -- 12 months weekly
```
**Returns:** 52 weeks of attribution data

**Insights:**
- Ads ROAS looks like 4.0x but blended ROAS is 6.5x (organic halo effect!)
- Shows true value of paid campaigns including organic lift

---

## Analysis Framework

For ANY cross-platform question:

### Step 1: Identify Data Sources
Which platforms are needed?
- Ads only? → Use Google Ads API
- Ads + GSC? → BigQuery join
- Ads + GSC + GA4? → Three-way BigQuery join

### Step 2: Find Join Keys
Common join keys:
- **Date:** All have date fields (easy join)
- **Keyword/Query:** ads.keyword ↔ gsc.query (match on LOWER())
- **Campaign:** ads.campaign ↔ ga4.campaign (from UTM parameters)
- **Landing Page:** ads.final_url ↔ gsc.page ↔ ga4.landing_page

### Step 3: Aggregate BEFORE Joining
```sql
-- WRONG (slow, expensive):
FROM raw_ads JOIN raw_gsc JOIN raw_ga4  -- Millions × millions × millions

-- RIGHT (fast, cheap):
WITH ads_agg AS (SELECT campaign, SUM(cost) FROM ads GROUP BY campaign),
     gsc_agg AS (SELECT campaign_related, SUM(clicks) FROM gsc GROUP BY ...),
     ga4_agg AS (SELECT campaign, SUM(conversions) FROM ga4 GROUP BY campaign)
FROM ads_agg JOIN gsc_agg JOIN ga4_agg  -- Small × small × small
```

### Step 4: Return Aggregated Results
- Aim for 50-200 rows total
- If more complex, break into multiple queries
- Each query answers one sub-question

## Report Template

```markdown
# CROSS-PLATFORM ANALYSIS
Client: [name]
Date Range: [period]
Platforms: Google Ads + Search Console + Analytics

## KEY FINDINGS

### Paid/Organic Overlap
- 23 keywords: Bidding in Ads + Ranking top 3 organically
- Total waste: $2,400/month on unnecessary paid clicks
- Recommendation: Pause Ads for these keywords

### Conversion Attribution
- Ads-only ROAS: 4.2x
- Blended ROAS (including organic lift): 6.8x
- True value of Ads: 62% higher than attributed

### Channel Performance
- Paid: 12,000 clicks, $8,500 spend, 145 conversions
- Organic: 18,000 clicks, $0 spend, 210 conversions
- Organic CPA: $0 vs Paid CPA: $58.62

## RECOMMENDED ACTIONS
1. Pause 23 Ads keywords ranking organically → Save $2,400/month
2. Increase budget for campaigns with organic halo effect
3. Create SEO content for top-performing Ads themes
```

## Integration with WPP Workflow

```
User: "Compare my paid and organic performance"

Skill workflow:
1. Query Ads data (aggregated by campaign/keyword)
2. Query GSC data (aggregated by query/page)
3. Query GA4 data (aggregated by source/campaign)
4. Join all three in BigQuery
5. Return ~100-200 rows to Claude
6. Claude analyzes and presents insights
7. If user wants to act: Use MCP write tools
8. If user wants persistent report: Create Metabase dashboard
```

## References

- User workflow description (shows exact cross-platform blending example)
- `src/bigquery/tools.ts` (run_bigquery_query tool)
- API-EXPANSION-PLAN.md (BigQuery section, page 588+)

## Remember

Cross-platform analysis is **where the magic happens** - insights you can't get from any single platform!
