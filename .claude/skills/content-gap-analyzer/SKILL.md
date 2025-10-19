---
name: Content Gap Analyzer
description: Analyze GSC data to find content gaps - keywords with high impressions but low position indicating missing or weak content on landing pages
---

# Content Gap Analyzer Skill

## Purpose

Find SEO optimization opportunities by identifying keywords that:
- Have meaningful search volume (impressions)
- Rank poorly (position 11-30, page 2-3)
- Point to content gaps on existing high-traffic pages

This is the **exact use case** described in the WPP practitioner workflow.

## The Problem This Solves

**Scenario:** A page ranks #1 for "digital marketing" (great!) but #18 for "social media marketing" (poor)

**Why?** Page probably mentions social media briefly but lacks dedicated section

**Solution:** Add 300-500 words about social media marketing → keyword climbs to page 1

## Analysis Workflow

### Step 1: Get Top Landing Pages
```sql
SELECT
  page,
  SUM(clicks) as total_clicks
FROM `project.client_gsc_data`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
  AND property = 'sc-domain:client.com'
GROUP BY page
ORDER BY total_clicks DESC
LIMIT 50
```
**Returns:** 50 pages (~50 rows)

### Step 2: For Each Top Page, Find Low-Position Keywords
```sql
WITH top_pages AS (
  SELECT page
  FROM `project.client_gsc_data`
  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
  GROUP BY page
  ORDER BY SUM(clicks) DESC
  LIMIT 20  -- Focus on top 20 pages for detailed analysis
)
SELECT
  gsc.query,
  gsc.page,
  AVG(gsc.position) as avg_position,
  SUM(gsc.impressions) as total_impressions,
  SUM(gsc.clicks) as total_clicks,
  AVG(gsc.ctr) as avg_ctr
FROM `project.client_gsc_data` gsc
INNER JOIN top_pages tp ON gsc.page = tp.page
WHERE gsc.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
  AND gsc.position BETWEEN 11 AND 30  -- Page 2-3 rankings
  AND gsc.impressions > 0  -- Has search volume
GROUP BY gsc.query, gsc.page
HAVING SUM(gsc.impressions) >= 100  -- Meaningful volume
ORDER BY total_impressions DESC, avg_position DESC
LIMIT 100
```
**Returns:** ~100 keyword opportunities

### Step 3: Cluster Keywords by Topic/Theme
Use Claude to analyze the 100 keywords and group by topic:

```
Keywords for /services/digital-marketing:

Topic: Social Media (7 keywords, avg pos 15.2)
- "social media marketing" (pos 15, 500 impr)
- "social media management" (pos 18, 300 impr)
- "social media strategy" (pos 14, 250 impr)
...

Topic: PPC/Paid (5 keywords, avg pos 22.4)
- "ppc management" (pos 22, 400 impr)
- "google ads management" (pos 24, 350 impr)
...
```

### Step 4: Analyze Landing Page Content (Optional)
If page URL available, can fetch and analyze:
```
Page: /services/digital-marketing

Current content analysis:
- Word count: 1,200 words
- Main topics: SEO (600 words), Content Marketing (400 words)
- Brief mentions: Social Media (50 words), PPC (80 words)

Gap identified: Social Media
- Keywords want ~300 words, page has ~50 words
- Recommendation: Expand social media section
```

### Step 5: Generate Recommendations
```
CONTENT GAP REPORT
Page: /services/digital-marketing

1. ADD: Social Media Marketing Section (300-500 words)
   Why: 7 keywords (avg pos 15) with 1,200 monthly searches
   Keywords to target:
   - "social media marketing" (primary)
   - "social media strategy"
   - "social media management"

   Potential traffic gain: +150 clicks/month
   Implementation: Add section after Content Marketing section

2. EXPAND: PPC/Google Ads Section (200-400 words)
   Why: 5 keywords (avg pos 22) with 950 monthly searches
   Keywords to target:
   - "ppc management" (primary)
   - "google ads management"

   Potential traffic gain: +80 clicks/month
   Implementation: Create dedicated PPC subsection
```

## BigQuery Queries to Use

### Query 1: Top Pages with Opportunity Count
```sql
WITH opportunities AS (
  SELECT
    page,
    COUNT(DISTINCT query) as gap_keyword_count,
    SUM(impressions) as gap_impressions,
    AVG(position) as avg_gap_position
  FROM `project.client_gsc_data`
  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
    AND position BETWEEN 11 AND 30
  GROUP BY page
  HAVING gap_keyword_count >= 5  -- At least 5 opportunities
)
SELECT
  o.page,
  o.gap_keyword_count,
  o.gap_impressions,
  o.avg_gap_position,
  SUM(all_data.clicks) as total_page_clicks
FROM opportunities o
JOIN `project.client_gsc_data` all_data ON o.page = all_data.page
WHERE all_data.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
GROUP BY o.page, o.gap_keyword_count, o.gap_impressions, o.avg_gap_position
ORDER BY o.gap_keyword_count DESC, o.gap_impressions DESC
LIMIT 20
```
**Returns:** 20 pages with most opportunities

### Query 2: Gap Keywords Per Page
```sql
SELECT
  query,
  AVG(position) as avg_position,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  AVG(ctr) as avg_ctr
FROM `project.client_gsc_data`
WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
  AND page = '{specific_page_url}'
  AND position BETWEEN 11 AND 30
GROUP BY query
HAVING SUM(impressions) >= 50
ORDER BY total_impressions DESC
LIMIT 50
```
**Returns:** 50 gap keywords for specific page

## Topic Clustering Logic

After getting gap keywords, use Claude to cluster:

1. **Extract main themes:** Group semantically similar keywords
2. **Calculate theme volume:** Sum impressions per theme
3. **Prioritize themes:** By potential traffic (impressions × expected CTR gain)
4. **Content recommendations:** Specific word count and placement suggestions

## Output Format

```markdown
# CONTENT GAP ANALYSIS
Client: [client name]
Date Range: [12 months / 6 months / custom]
Analysis Date: [today]

## EXECUTIVE SUMMARY
- Pages Analyzed: 20 top-traffic pages
- Total Gap Keywords: 127 keywords
- Total Opportunity: 15,400 impressions/month
- Estimated Traffic Gain if Addressed: +1,200 clicks/month

## TOP OPPORTUNITIES

### 1. /services/digital-marketing
**Gap Keywords:** 12 keywords, 1,850 impressions/month
**Avg Current Position:** 16.3
**Estimated Gain:** +180 clicks/month

**Missing Topics:**
1. Social Media Marketing (5 keywords, pos 15.2)
   - Recommendation: Add 300-word section
   - Primary keywords: "social media marketing", "social media strategy"

2. PPC Management (4 keywords, pos 22.4)
   - Recommendation: Add 200-word subsection
   - Primary keywords: "ppc management", "google ads management"

### 2. /blog/seo-guide
[Similar format...]

## IMPLEMENTATION PRIORITY
1. /services/digital-marketing (highest ROI: +180 clicks)
2. /blog/seo-guide (+95 clicks)
3. /services/local-seo (+75 clicks)
```

## Integration with Other Skills

- **Uses:** bigquery-aggregator (for queries)
- **Feeds into:** campaign-optimizer (content improvements may affect Ads performance)
- **Can create:** Metabase dashboard (for tracking progress over time)

## When to Activate

Trigger this skill when user says:
- "Find content gaps in my GSC data"
- "What keywords should I target better?"
- "Why are these keywords not ranking higher?"
- "Find optimization opportunities in organic search"
- "Analyze landing pages for missing content"

## Remember

**Goal:** Find HIGH-VALUE, LOW-EFFORT wins
- High impressions (search demand exists)
- Low position (currently underperforming)
- Top pages (already have traffic/authority)
- Clear gaps (missing subtopics)

**NOT:** Chasing low-volume keywords or creating entirely new pages (that's different strategy)
