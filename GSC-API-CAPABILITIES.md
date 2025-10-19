# Google Search Console & CrUX API - Complete Data Capabilities

## Overview

This document outlines all data access capabilities through the MCP server, including both Google Search Console API and Chrome UX Report API integrations.

---

## ✅ Available Data & Tools (15 Total)

### 1. Core Web Vitals (CrUX API) - 5 Tools

#### `get_core_web_vitals_origin`
Get Core Web Vitals for an entire domain (origin-level).

**Metrics Returned:**
- **LCP** (Largest Contentful Paint) - Loading performance
- **INP** (Interaction to Next Paint) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Initial paint
- **TTFB** (Time to First Byte) - Server response time

**Data Format:**
- P75 percentile value (Core Web Vitals threshold)
- Distribution: % Good / % Needs Improvement / % Poor
- Collection period (28-day rolling window)

**Example:**
```json
{
  "lcp": {
    "p75": 3746,
    "good": 55.67,
    "needsImprovement": 21.55,
    "poor": 22.78
  }
}
```

**Dimensions:**
- Form Factor: PHONE, TABLET, DESKTOP, or ALL (aggregated)

**Limitations:**
- Requires sufficient traffic to be in CrUX database
- Not all sites/URLs have data
- Updated weekly with 28-day average

#### `get_core_web_vitals_url`
Get Core Web Vitals for a specific page URL.

**Same metrics as origin-level**, but for individual pages.

**Limitations:**
- Requires very high traffic to specific URL
- Most pages won't have URL-level data
- Falls back to origin-level recommendations

#### `get_cwv_history_origin`
Historical Core Web Vitals trends for an origin.

**Returns:**
- Weekly data points (up to 25 weeks available)
- Histogram timeseries showing distribution changes over time
- Percentile timeseries (P75 values over time)
- Form factor breakdown over time

**Use Cases:**
- Track CWV improvements after optimizations
- Monitor performance degradation
- Seasonal performance patterns
- Long-term trend analysis

#### `get_cwv_history_url`
Historical Core Web Vitals trends for a specific URL.

Same as origin history, but for individual pages (when available).

#### `compare_cwv_form_factors`
Side-by-side comparison of CWV across device types.

**Returns:**
- Desktop metrics
- Mobile metrics
- Tablet metrics
- Comparison of all three

**Use Cases:**
- Identify mobile vs desktop performance gaps
- Prioritize optimization efforts
- Responsive design validation

---

### 2. Search Analytics (GSC API) - 1 Tool

#### `query_search_analytics`
Most powerful tool - query search traffic data with extensive filtering and grouping.

**Available Dimensions:**
- `query` - Search keywords/phrases
- `page` - URLs on your site
- `country` - Geographic location (ISO codes: can, usa, gbr, etc.)
- `device` - DESKTOP, MOBILE, TABLET
- `date` - Daily breakdown
- `searchAppearance` - How result appeared (rich results, AMP, etc.)

**Multi-Dimensional Queries:**
Can combine any dimensions together:
- `["query"]` - Top keywords
- `["page"]` - Top pages
- `["query", "page"]` - Which keywords drive traffic to which pages
- `["query", "country", "device"]` - Full segmentation
- `["page", "device"]` - Device breakdown by page
- `["date"]` - Daily trends

**Metrics:**
- `clicks` - Number of clicks
- `impressions` - Times shown in search
- `ctr` - Click-through rate
- `position` - Average ranking position

**Search Types:**
- `web` (default) - Regular Google Search
- `image` - Google Images
- `video` - Google Videos
- `news` - Google News
- `discover` - Google Discover
- `googleNews` - Google News app

**Parameters:**
- `startDate` / `endDate` - Date range (up to 16 months historical)
- `rowLimit` - Max 25,000 rows per query
- `filters` - Filter by specific values

**Example Queries:**

Top queries:
```json
{
  "dimensions": ["query"],
  "rowLimit": 100
}
```

Page performance by device:
```json
{
  "dimensions": ["page", "device"],
  "rowLimit": 50
}
```

Geographic keyword analysis:
```json
{
  "dimensions": ["query", "country"],
  "rowLimit": 100
}
```

Daily trend:
```json
{
  "dimensions": ["date"],
  "startDate": "2024-09-01",
  "endDate": "2024-10-17"
}
```

---

### 3. URL Inspection (GSC API) - 1 Tool

#### `inspect_url`
Get detailed indexing and technical information for a specific URL.

**Data Returned:**

**Index Status:**
- `verdict` - PASS, NEUTRAL, FAIL
- `coverageState` - "Submitted and indexed", "URL is unknown to Google", etc.
- `lastCrawlTime` - When Googlebot last crawled
- `robotsTxtState` - ALLOWED, BLOCKED
- `indexingState` - INDEXING_ALLOWED, etc.
- `userCanonical` - Canonical declared on page
- `googleCanonical` - Canonical Google selected

**Mobile Usability:**
- `verdict` - Mobile-friendly status
- `issues` - Array of mobile usability problems
  - Viewport configuration
  - Font size issues
  - Touch element spacing

**Rich Results (Structured Data):**
- `verdict` - PASS, FAIL
- `detectedItems` - Array of structured data types found
  - Breadcrumbs
  - FAQ
  - HowTo
  - Recipe
  - Article
  - Product
  - etc.

**AMP:**
- `verdict` - AMP status
- `ampUrl` - AMP version URL
- `indexingState` - AMP indexing state

**Use Cases:**
- Debug indexing issues
- Verify canonical URLs
- Check structured data implementation
- Validate mobile-friendliness
- Monitor crawl freshness

**Limitations:**
- 2,000 queries per day
- 600 queries per minute
- Per-URL only (no bulk export)

---

### 4. Sitemaps (GSC API) - 3 Tools

#### `list_sitemaps`
List all submitted sitemaps for a property.

**Returns:**
- Sitemap URL
- Last submitted date
- Last downloaded date
- Error count
- Warning count
- Contents breakdown (web pages, images, videos)

#### `get_sitemap`
Get detailed information about a specific sitemap.

**Returns:**
- All info from list_sitemaps
- `submitted` - Number of URLs submitted
- `indexed` - Number of URLs indexed
- Content type breakdown

**Example:**
```json
{
  "contents": [
    {
      "type": "web",
      "submitted": 268,
      "indexed": 0
    },
    {
      "type": "image",
      "submitted": 453,
      "indexed": 0
    }
  ]
}
```

#### `submit_sitemap`
Submit a new sitemap to Google Search Console.

**Write Operation** - Requires approval workflow with dry-run preview.

---

### 5. Properties (GSC API) - 2 Tools

#### `list_properties`
List all Google Search Console properties you have access to.

**Returns:**
- Property URL (sc-domain:example.com or https://example.com/)
- Permission level (siteOwner, siteFullUser, siteRestrictedUser)

**Automatic Discovery:**
- No pre-configuration needed
- Shows all properties in your account

#### `get_property`
Get details for a specific property.

**Returns:**
- Property URL
- Permission level

---

## 🎯 Most Powerful Use Cases

### Performance Analysis Workflow
1. **List properties** → See all your sites
2. **Query search analytics by page** → Find top-performing pages
3. **Get CWV for origin** → Check Core Web Vitals
4. **Inspect specific URLs** → Check indexing + structured data
5. **Get CWV history** → Track improvements over time

### Keyword Research Workflow
1. **Query by query dimension** → Top keywords
2. **Query by query + page** → Keyword-to-page mapping
3. **Query by query + country** → Geographic keyword performance
4. **Query by query + device** → Device-specific keywords

### Technical SEO Audit Workflow
1. **List sitemaps** → Check submitted sitemaps
2. **Get sitemap details** → See indexed vs submitted ratio
3. **Inspect URLs** → Check indexing status, canonicals, rich results
4. **Check mobile usability** → Find mobile issues
5. **Get CWV** → Identify performance problems

### Competitive Analysis Workflow
1. **Get CWV for competitor origins** → Compare performance
2. **CWV history** → Track competitor improvements
3. **Form factor comparison** → See mobile vs desktop performance gaps

### Multi-Site Management
- Query all 9 properties you have access to
- Compare performance across sites
- Bulk analytics for multiple domains
- Track improvements across portfolio

---

## 📈 Data Granularity Levels

### Time Dimensions
- **Daily**: Use `date` dimension in search analytics
- **Weekly**: CWV historical data
- **Custom Ranges**: Up to 16 months for GSC, 25 weeks for CrUX
- **Real-time**: URL inspection shows latest crawl data

### Geographic Dimensions
- **Country-level**: Full country breakdown with ISO codes
- **Global aggregate**: Omit country dimension

### Device Dimensions
- **Desktop** - Desktop computers
- **Mobile** - Smartphones
- **Tablet** - Tablets
- **Aggregated** - All devices combined

### Content Dimensions
- **Query-level** - Individual search terms
- **Page-level** - Individual URLs
- **Origin-level** - Entire domain
- **Cross-dimensional** - Any combination

---

## ❌ Known Limitations

### Not Available via API
- **Index Coverage Report** (bulk view of all indexing issues)
- **Crawl Stats Report** (crawl rate, bandwidth, etc.)
- **Site Links** (Google-selected sitelinks)
- **Manual Actions** (penalties)
- **Security Issues** (hacking, malware)
- **Specific sitemap error details** (which URLs failed)
- **URL-level CWV for low-traffic pages**

### API Quotas
- **URL Inspection**: 2,000 requests/day, 600/minute
- **Search Analytics**: No official limit (standard Google API quotas apply)
- **CrUX API**: No quota restrictions (free)

### Data Freshness
- **Search Analytics**: 2-3 day lag
- **CrUX**: Weekly updates (28-day rolling average)
- **URL Inspection**: Near real-time
- **Sitemaps**: Updates when Google recrawls

---

## 🔧 Example Use Cases by Role

### SEO Manager
- Monitor keyword rankings daily
- Track Core Web Vitals improvements
- Compare mobile vs desktop performance
- Analyze geographic traffic patterns
- Monitor indexing status for new content

### Web Developer
- Debug indexing issues with URL Inspection
- Validate structured data implementation
- Check mobile usability problems
- Monitor Core Web Vitals after deployments
- Verify canonical URL configurations

### Content Marketer
- Find top-performing content
- Discover keyword opportunities
- Analyze which queries drive traffic
- Geographic content performance
- Image search optimization

### Agency/Multi-Client
- Manage 9+ properties from single interface
- Bulk reporting across clients
- Comparative analysis
- Portfolio-wide performance tracking

---

## 🚀 Advanced Query Examples

### Find Pages with Low CTR but High Impressions
```json
{
  "dimensions": ["page"],
  "rowLimit": 100
}
```
Then filter for `impressions > 100 && ctr < 0.02`

### Track Specific Keyword Over Time
```json
{
  "dimensions": ["date", "query"],
  "startDate": "2024-01-01",
  "endDate": "2024-10-17"
}
```
Filter to specific query in results

### Geographic Performance Comparison
```json
{
  "dimensions": ["country", "device"],
  "rowLimit": 100
}
```

### Image Search Optimization
```json
{
  "dimensions": ["query"],
  "searchType": "image",
  "rowLimit": 50
}
```

### Weekly CWV Trend Analysis
Use `get_cwv_history_origin` to get 25 weeks of data, then analyze:
- LCP improvements after optimization
- INP changes after JS reduction
- CLS fixes validation

---

## 📊 Data Volume Capabilities

- **Search Analytics**: Up to 25,000 rows per query
- **Properties**: Unlimited (all accessible properties)
- **Sitemaps**: All submitted sitemaps per property
- **URL Inspection**: 2,000 URLs per day
- **CWV History**: 25 weeks × 5 metrics = 125 data points per query

---

## 🎯 What Makes This Powerful

**1. Comprehensive Coverage**
- Performance metrics (CWV)
- Visibility metrics (search analytics)
- Technical SEO (indexing, structured data)
- Multi-dimensional analysis

**2. No Pre-Configuration Required**
- Automatic property discovery
- All accessible sites available immediately
- No manual account setup per property

**3. Programmatic Access**
- Query any combination of dimensions
- Automate reporting
- Build custom dashboards
- Track changes over time

**4. Multi-Property Management**
- Single interface for all properties
- Cross-site comparisons
- Portfolio analytics

---

## 📝 Testing Summary (Completed)

### Tested Successfully:
✅ List all 9 properties
✅ Search analytics by query
✅ Search analytics by page
✅ Search analytics by device
✅ Search analytics by country
✅ Multi-dimensional queries (query + country + device)
✅ Image search analytics
✅ Core Web Vitals (origin-level)
✅ CWV historical data (25 weeks)
✅ URL inspection with rich results
✅ Sitemap listing and details
✅ Property details

### Tested - No Data Available:
⚠️ URL-level CWV (insufficient traffic to individual pages)
⚠️ Form factor comparison (insufficient data per device)
⚠️ Google Discover traffic (no discover impressions)
⚠️ Search Appearance dimension (no special appearances)

---

## 🔮 Future Enhancements

### Potential Additions:
1. **Bulk URL Inspection** - Analyze multiple URLs with rate limiting
2. **Automated Reporting** - Schedule regular analytics exports
3. **Anomaly Detection** - Alert on traffic/performance changes
4. **Competitor Monitoring** - Track competitor CWV (public data)
5. **Cross-Property Analysis** - Compare metrics across all properties

### API Limitations to Work Around:
- No bulk index coverage → Could iterate through sitemap URLs
- No crawl stats → Limited to URL inspection data
- No manual actions API → Manual check required

---

## 📚 Quick Reference

### Most Useful Dimension Combinations

**For Keyword Research:**
- `["query"]` - Top keywords overall
- `["query", "country"]` - Keywords by country
- `["query", "page"]` - Keyword to page mapping

**For Content Performance:**
- `["page"]` - Top pages
- `["page", "device"]` - Page performance by device
- `["page", "country"]` - Page performance by location

**For Tracking:**
- `["date"]` - Daily trends
- `["date", "query"]` - Keyword trends over time
- `["date", "page"]` - Page performance over time

**For Segmentation:**
- `["query", "country", "device"]` - Full breakdown
- `["page", "country", "device"]` - Page segmentation

---

## 🎓 Best Practices

### Search Analytics Queries
- Use date ranges of 7-90 days for most queries
- Limit to 1,000 rows initially, increase if needed
- Combine max 3 dimensions for readability
- Use filters for specific analysis

### Core Web Vitals
- Check origin-level first (most reliable)
- Compare form factors when data available
- Use historical data to validate optimizations
- Monitor weekly for trends

### URL Inspection
- Batch URLs carefully (600/min limit)
- Check after publishing new content
- Verify structured data after changes
- Monitor canonical URL issues

---

## 📊 Example Analysis Scenarios

### "Why did traffic drop?"
1. Query analytics by date → Identify drop date
2. Query by query on drop date → See which keywords dropped
3. Inspect affected URLs → Check indexing issues
4. Check CWV → Performance degradation?

### "How to improve SEO?"
1. List properties → Choose site
2. Query by page → Find underperforming pages
3. Get CWV → Identify performance issues
4. Inspect URLs → Check technical issues
5. Query by query → Find keyword opportunities

### "Mobile vs Desktop Performance"
1. Get CWV comparison → Performance by device
2. Query analytics by device → Traffic by device
3. Query by page + device → Page-level device breakdown
4. Inspect URLs → Mobile usability issues

---

Last Updated: 2025-10-17
API Versions: Google Search Console API v1, Chrome UX Report API v1
MCP Server Version: 1.0.0
Total Tools: 15 (10 GSC + 5 CrUX)
