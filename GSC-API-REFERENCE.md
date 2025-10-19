# Google Search Console API - Complete Operations Reference

**Last Updated:** 2025-10-17
**API Version:** v1
**Base URL:** `https://www.googleapis.com/webmasters/v3/` and `https://searchconsole.googleapis.com/v1/`

---

## Table of Contents

1. [Search Analytics](#search-analytics)
2. [Sitemaps](#sitemaps)
3. [Sites (Properties)](#sites-properties)
4. [URL Inspection](#url-inspection)
5. [Batch Requests](#batch-requests)
6. [Permissions & Access Control](#permissions--access-control)
7. [Deprecated Features](#deprecated-features)

---

## Search Analytics

### `searchAnalytics.query`

**Purpose:** Query search traffic data with filters and parameters

**Endpoint:**
`POST /sites/{siteUrl}/searchAnalytics/query`

**Authorization Scopes:**
- `https://www.googleapis.com/auth/webmasters`
- `https://www.googleapis.com/auth/webmasters.readonly`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `siteUrl` | string | Yes | Property URL (e.g., `sc-domain:example.com`) |
| `startDate` | string | Yes | Start date in YYYY-MM-DD format (PT timezone) |
| `endDate` | string | Yes | End date in YYYY-MM-DD format (PT timezone) |
| `dimensions` | array | No | Dimensions to group by (unlimited count) |
| `type` | string | No | Search type (default: `web`) |
| `dimensionFilterGroups` | array | No | Filters to apply |
| `aggregationType` | string | No | How to aggregate results |
| `rowLimit` | number | No | Max rows (1-25,000, default: 1,000) |
| `startRow` | number | No | Pagination offset (default: 0) |
| `dataState` | string | No | Data state to query |

**Available Dimensions:**
- `query` - Search query string
- `page` - Page URL
- `country` - Country (ISO 3166-1 alpha-3 code)
- `device` - Device type (DESKTOP, MOBILE, TABLET)
- `searchAppearance` - Search result features
- `date` - Date of search
- `hour` - Hour of search (when using hourly data)

**Available Search Types:**
- `web` - Default, combined "All" tab data
- `discover` - Google Discover results
- `googleNews` - Google News showcase
- `news` - News tab results
- `image` - Image search results
- `video` - Video search results

**Filter Operators:**
- `equals` - Exact match (case-sensitive for page/query)
- `notEquals` - Not equal (case-sensitive for page/query)
- `contains` - Contains substring (case-insensitive)
- `notContains` - Does not contain substring (case-insensitive)
- `includingRegex` - Matches regex pattern (RE2 syntax)
- `excludingRegex` - Excludes regex pattern (RE2 syntax)

**Aggregation Types:**
- `auto` - Service decides (default)
- `byProperty` - Aggregate by property (not available for discover/googleNews)
- `byPage` - Aggregate by page URI
- `byNewsShowcasePanel` - Aggregate by news panel (requires NEWS_SHOWCASE filter)

**Data States:**
- `all` - All available data (default)
- `final` - Only finalized data
- `hourly_all` - Hourly data

**Response Metrics:**
- `clicks` - Number of clicks
- `impressions` - Number of impressions
- `ctr` - Click-through rate
- `position` - Average position in search results

**Example Request:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "dimensions": ["query", "page", "country"],
  "type": "web",
  "rowLimit": 1000,
  "dimensionFilterGroups": [
    {
      "groupType": "and",
      "filters": [
        {
          "dimension": "country",
          "operator": "equals",
          "expression": "USA"
        }
      ]
    }
  ]
}
```

**Limitations:**
- Maximum 25,000 rows per request
- Maximum 90-day date range recommended
- 50,000 rows per day limit per property per search type

---

## Sitemaps

### `sitemaps.list`

**Purpose:** List all submitted sitemaps for a property

**Endpoint:**
`GET /sites/{siteUrl}/sitemaps`

**Parameters:**
- `siteUrl` (required) - Property URL

**Response:** Array of sitemap objects with:
- `path` - Sitemap URL
- `lastSubmitted` - Last submission timestamp
- `lastDownloaded` - Last download timestamp by Google
- `errors` - Number of errors
- `warnings` - Number of warnings
- `contents` - Array of content types with submitted/indexed counts

---

### `sitemaps.get`

**Purpose:** Get information about a specific sitemap

**Endpoint:**
`GET /sites/{siteUrl}/sitemaps/{feedpath}`

**Parameters:**
- `siteUrl` (required) - Property URL
- `feedpath` (required) - Sitemap URL (URL-encoded)

**Response:** Sitemap object with detailed status

---

### `sitemaps.submit`

**Purpose:** Submit a sitemap to Google Search Console

**Endpoint:**
`PUT /sites/{siteUrl}/sitemaps/{feedpath}`

**Parameters:**
- `siteUrl` (required) - Property URL
- `feedpath` (required) - Sitemap URL (URL-encoded)

**Operation Type:** WRITE

**Notes:**
- Sitemap must be accessible to Googlebot
- Sitemap URL must be in valid format (XML, RSS, Atom, or text)
- Can submit sitemap index files

---

### `sitemaps.delete`

**Purpose:** Delete a sitemap from Search Console

**Endpoint:**
`DELETE /sites/{siteUrl}/sitemaps/{feedpath}`

**Parameters:**
- `siteUrl` (required) - Property URL
- `feedpath` (required) - Sitemap URL (URL-encoded)

**Operation Type:** WRITE (DESTRUCTIVE)

**Notes:**
- Does not delete the sitemap file from your server
- Only removes it from Search Console tracking

---

## Sites (Properties)

### `sites.list`

**Purpose:** List all properties user has access to

**Endpoint:**
`GET /sites`

**Parameters:** None

**Response:** Array of site objects with:
- `siteUrl` - Property URL
- `permissionLevel` - User's permission level

**Permission Levels:**
- `siteOwner` - Full control
- `siteFullUser` - Full access (read/write)
- `siteRestrictedUser` - Limited access (read-only)
- `siteUnverifiedUser` - Unverified access

---

### `sites.get`

**Purpose:** Get information about a specific property

**Endpoint:**
`GET /sites/{siteUrl}`

**Parameters:**
- `siteUrl` (required) - Property URL

**Response:** Site object with permission level

---

### `sites.add`

**Purpose:** Add a property to Search Console account

**Endpoint:**
`PUT /sites/{siteUrl}`

**Parameters:**
- `siteUrl` (required) - Property URL to add

**Operation Type:** WRITE

**Notes:**
- Adding a property does NOT verify ownership
- Property must be verified separately through other methods
- User must have appropriate Google Account permissions

**Property URL Formats:**
- Domain property: `sc-domain:example.com`
- URL-prefix (HTTPS): `sc-https://example.com/`
- URL-prefix (HTTP): `sc-http://example.com/`
- Android app: `sc-app:///package-name`

---

### `sites.delete`

**Purpose:** Remove a property from Search Console account

**Endpoint:**
`DELETE /sites/{siteUrl}`

**Parameters:**
- `siteUrl` (required) - Property URL to remove

**Operation Type:** WRITE (DESTRUCTIVE)

**Notes:**
- Only removes property from YOUR account
- Does not affect other users' access
- Does not delete the actual website

---

## URL Inspection

### `urlInspection.index.inspect`

**Purpose:** Inspect a URL's indexing status and details

**Endpoint:**
`POST /urlInspection/index:inspect`

**Base URL:** `https://searchconsole.googleapis.com/v1/`

**Authorization Scopes:**
- `https://www.googleapis.com/auth/webmasters`
- `https://www.googleapis.com/auth/webmasters.readonly`

**Request Body:**
```json
{
  "inspectionUrl": "https://example.com/page",
  "siteUrl": "sc-domain:example.com",
  "languageCode": "en-US"
}
```

**Parameters:**
- `inspectionUrl` (required) - URL to inspect
- `siteUrl` (required) - Property the URL belongs to
- `languageCode` (optional) - Language for error messages

**Response Includes:**
- **Index Status:**
  - `verdict` - Overall indexing status
  - `coverageState` - Coverage state (Submitted, Discovered, etc.)
  - `robotsTxtState` - robots.txt status
  - `indexingState` - Current indexing state
  - `lastCrawlTime` - Last time Googlebot crawled
  - `pageFetchState` - Page fetch result
  - `googleCanonical` - Google-selected canonical URL
  - `userCanonical` - User-declared canonical URL

- **Mobile Usability:**
  - `verdict` - Mobile usability status
  - `issues` - Array of mobile usability issues

- **Rich Results:**
  - `verdict` - Rich results status
  - `detectedItems` - Detected structured data items
  - `issues` - Array of rich results issues

- **AMP:**
  - `ampUrl` - AMP version URL (if exists)
  - `indexingState` - AMP indexing state
  - `issues` - Array of AMP issues

**Important Notes:**
- Only shows INDEXED status, not live testing
- Cannot test indexability of a URL before it's indexed
- For live URL testing, use the manual tool in Search Console

---

## Batch Requests

### Batch Request Support

**Purpose:** Combine multiple API calls into a single HTTP request

**Endpoint:**
Same as individual endpoints, but with special multipart/mixed format

**Format:**
- Content-Type: `multipart/mixed; boundary=batch_boundary`
- Each part is a nested HTTP request
- Response is multipart/mixed with corresponding responses

**Limitations:**
- Maximum 1,000 calls per batch request
- Each call in batch counts toward rate limits individually
- Server may execute calls in any order
- Batch requests still use HTTP method (not JSON-RPC)

**Example Structure:**
```
POST /batch HTTP/1.1
Host: www.googleapis.com
Content-Type: multipart/mixed; boundary=batch_boundary

--batch_boundary
Content-Type: application/http

GET /webmasters/v3/sites
--batch_boundary
Content-Type: application/http

POST /webmasters/v3/sites/sc-domain:example.com/searchAnalytics/query
Content-Type: application/json

{"startDate": "2025-01-01", "endDate": "2025-01-31"}
--batch_boundary--
```

**Note:** Batch HTTP and JSON-RPC support was officially discontinued in 2020. Use standard batch requests with multipart/mixed format.

---

## Permissions & Access Control

### Permission Levels

Google Search Console has four permission levels accessible via API:

1. **siteOwner** (Owner)
   - Full control over property
   - Can add/remove users
   - Can modify settings
   - Can view all data
   - Can use all tools

2. **siteFullUser** (Full User)
   - Can view all data
   - Can perform most actions
   - Cannot manage users/permissions

3. **siteRestrictedUser** (Restricted User)
   - Read-only access
   - Cannot perform write operations

4. **siteUnverifiedUser** (Unverified User)
   - Limited access
   - Typically unverified delegated users

### Owner Types

- **Verified Owner:** Verified ownership using a token (HTML file, DNS, Google Analytics, etc.)
- **Delegated Owner:** Granted owner status by another owner without verification token

### Permission Management

While the API can READ permission levels via `sites.list` and `sites.get`, the API does NOT provide methods to:
- Add users to properties
- Remove users from properties
- Change user permission levels
- Manage verification tokens

These operations must be done through the Search Console web interface.

---

## Deprecated Features

### Mobile-Friendly Test API (DEPRECATED - Dec 1, 2023)

**Old Endpoint:** `POST /v1/urlTestingTools/mobileFriendlyTest:run`

**Status:** Officially sunset on December 1, 2023

**Replacement:**
- Use **URL Inspection API** for mobile usability info
- Use **Lighthouse** for comprehensive mobile testing

---

### Crawl Errors API (DEPRECATED)

**Status:** Deprecated and removed

**Old Functionality:** Listed crawl errors by category

**Replacement:**
- **Index Coverage Report** (in Search Console UI only)
- **URL Inspection API** for individual URL status
- No direct API replacement for bulk crawl error data

**Note:** The old Crawl Errors report data is no longer accessible via API.

---

### Index Coverage Report API (NOT AVAILABLE)

**Status:** Not available via API

**Functionality:** Available only in Search Console web interface

**What It Shows:**
- Which pages Google can index
- Indexing problems encountered
- Coverage issues (error, warning, excluded, valid)

**Workaround:**
- Use **URL Inspection API** for individual URLs
- No bulk coverage data API available currently

---

## API Quotas & Limits

### Rate Limits

- **Search Analytics:** 50,000 rows per day per property per search type
- **Batch Requests:** Maximum 1,000 calls per batch
- **Row Limit:** Maximum 25,000 rows per single request
- **Date Range:** 90-day maximum recommended

### Data Freshness

- **Search Analytics:** Data typically 2-3 days delayed
- **URL Inspection:** Shows indexed data, not real-time
- **Sitemaps:** Status updates may take hours or days

### Best Practices

1. Use appropriate aggregation to reduce row counts
2. Implement exponential backoff for rate limit errors
3. Cache frequently accessed data
4. Use batch requests for multiple operations
5. Monitor quota usage in Google Cloud Console

---

## Authentication Requirements

All API calls require OAuth 2.0 authentication with one of these scopes:

- `https://www.googleapis.com/auth/webmasters` - Full access (read/write)
- `https://www.googleapis.com/auth/webmasters.readonly` - Read-only access

User must have appropriate Search Console permission on the property being accessed.

---

## Common Use Cases

### 1. Analytics Dashboard
- Query search analytics with various dimensions
- Track performance over time
- Compare different time periods
- Identify top queries and pages

### 2. Sitemap Management
- Monitor sitemap submission status
- Track indexed vs. submitted URLs
- Identify sitemap errors
- Automate sitemap submissions

### 3. Index Monitoring
- Check URL indexing status
- Monitor mobile usability
- Track rich results validation
- Identify indexing issues

### 4. Multi-Property Management
- List all accessible properties
- Bulk operations across properties
- Centralized reporting
- Property-level comparisons

---

## Error Handling

### Common Error Codes

- **400 Bad Request:** Invalid parameters or request format
- **401 Unauthorized:** Invalid or missing authentication
- **403 Forbidden:** Insufficient permissions for property
- **404 Not Found:** Property or resource doesn't exist
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Google server error
- **503 Service Unavailable:** Temporary service issues

### Best Practices

1. Implement retry logic with exponential backoff
2. Handle rate limits gracefully
3. Validate input before sending requests
4. Log errors for debugging
5. Provide user-friendly error messages

---

## Implementation Recommendations

### Priority 1: Core Read Operations (Implement First)
1. ✅ `sites.list` - List user's properties
2. ✅ `searchAnalytics.query` - Query search traffic data
3. ✅ `sitemaps.list` - List sitemaps
4. ✅ `sitemaps.get` - Get sitemap details
5. ✅ `urlInspection.index.inspect` - Inspect URL status

### Priority 2: Safe Write Operations
1. ✅ `sitemaps.submit` - Submit sitemaps
2. ✅ `sites.add` - Add properties

### Priority 3: Destructive Operations (Require Extra Approval)
1. ⚠️ `sitemaps.delete` - Delete sitemaps
2. ⚠️ `sites.delete` - Remove properties

### Priority 4: Advanced Features
1. 📦 Batch request implementation
2. 🔄 Pagination for large datasets
3. 📊 Data aggregation and transformation
4. 💾 Caching layer

---

## Summary Statistics

**Total API Endpoints:** 11 active methods

**Breakdown by Service:**
- Search Analytics: 1 method
- Sitemaps: 4 methods
- Sites: 4 methods
- URL Inspection: 1 method
- Batch: 1 capability

**Operation Types:**
- Read-Only: 7 methods
- Write (Safe): 2 methods
- Write (Destructive): 2 methods

**Deprecated/Unavailable:** 3 features
- Mobile-Friendly Test API
- Crawl Errors API
- Index Coverage API

---

## Next Steps for Implementation

1. ✅ Create MCP tools for all 11 active methods
2. ✅ Implement dry-run system for write operations
3. ✅ Add approval workflow for destructive operations
4. ✅ Build comprehensive error handling
5. ✅ Add input validation for all parameters
6. ✅ Implement account isolation checks
7. ✅ Set up audit logging for all operations
8. ✅ Test with personal Search Console account
9. 📝 Document usage examples
10. 🚀 Deploy and iterate based on feedback

---

**Document Version:** 1.0
**Last Reviewed:** 2025-10-17
**Status:** Complete and ready for implementation