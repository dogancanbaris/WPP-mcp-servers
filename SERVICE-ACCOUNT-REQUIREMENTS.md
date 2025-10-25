# Service Account Requirements After OAuth Migration

## 🎯 Architecture Summary

**OAuth (User Credentials):**
- Google Search Console API
- Google Ads API
- Google Analytics API
- PageSpeed Insights / CrUX API

**Service Account (Infrastructure):**
- BigQuery (shared data lake)
- Metabase (shared dashboard platform)

---

## ✅ Required Service Account Roles

**Your service account:** `mcp-cli-access@mcp-servers-475317.iam.gserviceaccount.com`

### BigQuery Roles (KEEP):
1. **BigQuery Admin** (`roles/bigquery.admin`)
   - Why: Create datasets, tables, load data
   - Used for: Writing marketing data to BigQuery data lake

2. **BigQuery Job User** (`roles/bigquery.jobUser`)
   - Why: Run queries, create jobs
   - Used for: Executing SQL queries for data transformation

### Cloud Infrastructure Roles (KEEP):
3. **Cloud Run Admin** (`roles/run.admin`)
   - Why: Deploy and manage Metabase on Cloud Run
   - Used for: Metabase deployment and updates

4. **Cloud SQL Admin** (`roles/cloudsql.admin`)
   - Why: Manage PostgreSQL database for Metabase metadata
   - Used for: Metabase backend database

---

## ❌ Roles You Can REMOVE

These were added during setup but are no longer needed:

1. **BigQuery Data Viewer** - Users use their own OAuth to read data
2. **BigQuery Metadata Viewer** - Users use their own OAuth
3. **Cloud Build Service Account** - Only needed during initial build
4. **Service Account User** - Only needed during initial setup

---

## 🔐 Security Model

### Data Access Layer (OAuth):
```
User OAuth Token → GSC/Ads/Analytics APIs → User's data only
```

**Example:**
- Practitioner A (Nike + Dell) → Sees only Nike + Dell data
- Practitioner B (Colgate + P&G) → Sees only Colgate + P&G data
- **Automatic isolation via Google's IAM!**

### Infrastructure Layer (Service Account):
```
Service Account → BigQuery + Metabase → Shared resources
```

**Why Service Account Here:**
- BigQuery is shared data lake (everyone writes to it)
- Metabase is shared dashboard platform (everyone uses it)
- Row-Level Security (RLS) in BigQuery/Metabase filters data by client

---

## 🔄 Data Flow Example

**User Request:**
> "Show me Google Ads performance for Colgate last 7 days"

**Step 1:** OMA sends to MCP
```http
POST /mcp/execute-tool
Headers:
  X-OMA-API-Key: <oma-key>
  Authorization: Bearer ya29.a0AfH6SMB... (user's OAuth token)
Body:
  {
    "toolName": "get_campaign_performance",
    "input": {
      "customerId": "colgate-ads-account-id",
      "startDate": "2025-10-11",
      "endDate": "2025-10-17"
    }
  }
```

**Step 2:** MCP uses user's OAuth
```typescript
// Extract user's OAuth token
const userToken = extractOAuthToken(input);

// Create Google Ads client with USER'S credentials
const { client, customer } = createGoogleAdsClient(userToken, developerToken, customerId);

// Query Google Ads (user sees only accounts they have access to)
const campaigns = await customer.campaigns.list(...);

// Use SERVICE ACCOUNT to write to BigQuery
const bq = createBigQueryClient(); // Service account
await bq.dataset('wpp_marketing').table('google_ads_performance').insert(campaigns);
```

**Step 3:** LLM creates Metabase dashboard
```typescript
// Use Metabase API (service account credentials)
// Query BigQuery with RLS (filters data by client_id)
// Create dashboard showing only Colgate data
```

**Result:**
- ✅ User pulled data using THEIR Google credentials
- ✅ Data written to BigQuery using infrastructure service account
- ✅ Dashboard created, shows only Colgate data (RLS filtering)

---

## 🌍 How This Scales to 1,000+ Practitioners

**Scenario:** WPP has 1,500 practitioners across 200 clients

### With OAuth (Current Plan):
- Each practitioner logs in with their Google work account
- OMA gets OAuth token for that user
- MCP uses THAT user's credentials
- User sees only clients they manage (automatic)
- **Zero provisioning needed** ✅

### With Service Account (Old/Wrong):
- Would need 200 service accounts (one per client)
- Must manually grant each service account access to GSC/Ads/Analytics
- Must map users to service accounts manually
- **Unscalable!** ❌

---

## 💰 Cost Impact

**Service Account Roles (Current):**
- BigQuery Admin: $0 (no cost for IAM roles)
- BigQuery Job User: $0
- Cloud Run Admin: $0
- Cloud SQL Admin: $0

**Total Service Account Cost: $0/month**

**Infrastructure Costs:**
- Metabase Cloud Run: ~$0-27/month (scales to zero)
- Cloud SQL PostgreSQL: ~$11/month
- BigQuery storage: ~$0.02/GB/month (tiny for aggregated data)
- BigQuery queries: First 1TB/month FREE

**Total Infrastructure: ~$11-38/month for unlimited users**

---

## 🎯 Summary

**KEEP These Roles:**
1. BigQuery Admin
2. BigQuery Job User
3. Cloud Run Admin
4. Cloud SQL Admin

**REMOVE These Roles:**
1. BigQuery Data Viewer
2. BigQuery Metadata Viewer
3. Cloud Build Service Account
4. Service Account User

**Total Roles Needed: 4** (down from 8)

**Authentication:**
- 🔵 User OAuth for all Google APIs (GSC, Ads, Analytics, CrUX)
- 🟢 Service Account for infrastructure (BigQuery writes, Metabase)

**This architecture supports 1,000+ practitioners with zero per-user configuration!**
