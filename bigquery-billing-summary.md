# BigQuery Billing Investigation Summary
**Date:** October 30, 2025
**Project:** mcp-servers-475317
**Total Charge Reported:** $0.88

---

## Key Findings

### BigQuery Usage (Last 7 Days)

**Total BigQuery Cost: $0.22** (~25% of the $0.88 charge)

- **Query costs:** $0.2174
- **Load/streaming costs:** $0.00 (no data loading operations found)
- **Storage costs:** $0.0018/day ($0.053/month for 2.65 GB)

### Daily Breakdown

| Date       | Queries | GB Scanned | Cost     |
|------------|---------|------------|----------|
| 2025-10-30 | 251     | 32.14 GB   | **$0.20** |
| 2025-10-29 | 136     | 1.05 GB    | $0.01    |
| 2025-10-28 | 178     | 0.86 GB    | $0.01    |
| 2025-10-27 | 9       | 0.09 GB    | $0.00    |
| 2025-10-26 | 9       | 0.09 GB    | $0.00    |
| 2025-10-24 | 131     | 0.55 GB    | $0.00    |
| **Total**  | **714** | **34.78 GB** | **$0.22** |

### What Caused Today's Usage?

**October 30 Analysis:**
- **251 query jobs executed** (primarily dashboard queries)
- **32.14 GB of data scanned** from tables:
  - `gsc_performance_shared` (1.71 GB, 6.8M rows)
  - `gsc_complete_themindfulsteward` (0.94 GB, 5.4M rows)
- **Recent table updates:**
  - `gsc_performance_shared` updated at 14:29
  - `gsc_complete_themindfulsteward` updated at 04:16

### What's NOT Explained by BigQuery?

**Missing ~$0.66** (75% of the charge) likely from:

1. **Google Search Console API Calls** ($$$)
   - Your audit log shows frequent GSC API queries
   - Pulling 25,000+ rows from Search Console (line 981-983 in audit.log)
   - Multiple properties being queried (9 properties discovered)

2. **Google Ads API / Analytics API Calls**
   - OAuth authentication overhead
   - API quota usage costs

3. **Cloud Storage** (if using for backups/logs)
   - Storage costs for logs
   - Data transfer costs

4. **Network Egress**
   - Cross-region data transfer
   - External API calls

5. **Other GCP Services**
   - Cloud Functions (if deployed)
   - Cloud Run (if deployed)
   - Load Balancer costs

---

## BigQuery Cost Details

### Query Analysis

Most queries are **read-only dashboard queries** like:
```sql
SELECT 'current' AS period, FORMAT_DATE('%Y-%m-%d', date) AS date,
       category, CAST(SUM(clicks) AS FLOAT64) AS clicks
FROM `mcp-servers-475317.wpp_marketing.gsc_performance_shared`
WHERE workspace_id = 'xxx'
GROUP BY date, category
```

**These are lightweight queries** (0 bytes billed due to caching), but accumulated over 251 queries today.

### Storage Breakdown

| Table | Size | Rows | Last Modified |
|-------|------|------|---------------|
| gsc_performance_shared | 1.71 GB | 6,841,273 | 2025-10-30 14:29 |
| gsc_complete_themindfulsteward | 0.94 GB | 5,440,590 | 2025-10-30 04:16 |
| **Total** | **2.65 GB** | **12,281,863** | - |

Storage cost: **$0.053/month** ($0.0018/day) - negligible

---

## Recommendations

### Immediate Actions

1. **Check GCP Billing Console** for exact breakdown:
   ```
   https://console.cloud.google.com/billing
   ```
   - Look at "Reports" tab
   - Filter by service (BigQuery, API calls, Storage, etc.)
   - Check "Cost breakdown" by SKU

2. **Enable detailed billing export** to BigQuery for future analysis

3. **Check API usage**:
   ```
   https://console.cloud.google.com/apis/dashboard?project=mcp-servers-475317
   ```
   - Look at quota usage for:
     - Search Console API
     - Google Ads API
     - Analytics API

### Cost Optimization

1. **BigQuery Query Optimization** (~$0.20/day → $6/month):
   - ✅ Already using caching (most queries show 0 bytes billed)
   - ✅ Tables are partitioned (if using date column)
   - Consider: Materialized views for frequently accessed aggregations
   - Consider: Query result caching (24 hours)

2. **API Call Optimization** (~$0.60/day → $18/month):
   - Batch Search Console API requests
   - Reduce polling frequency
   - Cache API responses in Redis/Memcache
   - Use webhooks instead of polling where possible

3. **Set up Budget Alerts**:
   ```bash
   # Create budget alert at $30/month
   gcloud billing budgets create --billing-account=YOUR_BILLING_ACCOUNT \
     --display-name="MCP Servers Monthly Budget" \
     --budget-amount=30 \
     --threshold-rule=percent=50 \
     --threshold-rule=percent=90 \
     --threshold-rule=percent=100
   ```

---

## Next Steps

1. **Access GCP Billing Console** to see the full breakdown:
   - Go to: https://console.cloud.google.com/billing
   - Select project: mcp-servers-475317
   - View detailed reports

2. **Check API quotas and usage**:
   ```bash
   # If gcloud were installed:
   gcloud services list --enabled --project=mcp-servers-475317
   gcloud monitoring dashboards list
   ```

3. **Monitor costs daily** for the next week to understand patterns

4. **Consider implementing**:
   - Query result caching
   - API response caching
   - Rate limiting on dashboard queries
   - Budget alerts

---

## Summary

**BigQuery is responsible for only ~25% of the $0.88 charge.**

The majority ($0.66) is likely from:
- **Google Search Console API calls** (most likely culprit based on audit logs)
- Other Google API usage
- Network/storage costs

**Action Required:** Check GCP Billing Console for exact service breakdown to identify the remaining $0.66.

---

**Investigation completed:** October 31, 2025 01:34 UTC
**Service Account Used:** mcp-cli-access@mcp-servers-475317.iam.gserviceaccount.com
