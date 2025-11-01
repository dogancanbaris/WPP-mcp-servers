# Campaign Targeting Criteria Tools

**Directory:** `/src/ads/tools/targeting/`
**Tools:** 5
**Status:** ✅ Production Ready

---

## Overview

This directory contains 5 MCP tools for configuring campaign targeting criteria in Google Ads. All tools follow interactive workflow patterns with discovery mode, dry-run previews, and approval workflows.

---

## Tools

### 1. **add_location_criteria**

**Purpose:** Add geographic location targeting to campaigns

**Targeting Options:**
- Countries (geo target constants, e.g., "2840" for USA)
- Cities (e.g., "1023191" for New York City)
- Radius targeting (lat/long + miles)

**Example:**
```typescript
{
  customerId: "2191558405",
  campaignId: "12345",
  geoTargetIds: ["2840", "2124"], // USA + Canada
  confirmationToken: "abc123..."
}
```

**API Resource:** `CampaignCriterionService`
**Criterion Type:** `LOCATION` or `PROXIMITY`

---

### 2. **add_language_criteria**

**Purpose:** Add language targeting to campaigns

**Supported Languages:**
- English (1000), Spanish (1003), French (1002), German (1001)
- Chinese Simplified (1009), Japanese (1005), Arabic (1027)
- 15 total languages pre-populated

**Example:**
```typescript
{
  customerId: "2191558405",
  campaignId: "12345",
  languageIds: ["1000", "1003"], // English + Spanish
  confirmationToken: "abc123..."
}
```

**API Resource:** `CampaignCriterionService`
**Criterion Type:** `LANGUAGE`

---

### 3. **add_demographic_criteria**

**Purpose:** Add demographic targeting (age, gender, income, parental status)

**Demographics:**
- **Age Ranges:** 18-24, 25-34, 35-44, 45-54, 55-64, 65+
- **Genders:** Male, Female, Undetermined
- **Parental Status:** Parent, Not a Parent, Unknown
- **Household Income:** Top 10%, 11-20%, ..., Bottom 50% (US only)

**Example:**
```typescript
{
  customerId: "2191558405",
  campaignId: "12345",
  ageRanges: ["503002", "503003"],        // 25-44
  genders: ["11"],                         // Female
  parentalStatuses: ["300"],               // Parent
  householdIncomes: ["510001", "510002"],  // Top 20%
  confirmationToken: "abc123..."
}
```

**API Resource:** `CampaignCriterionService`
**Criterion Types:** `AGE_RANGE`, `GENDER`, `PARENTAL_STATUS`, `INCOME_RANGE`

---

### 4. **add_audience_criteria**

**Purpose:** Add audience targeting (in-market, affinity, custom audiences, user lists)

**Audience Types:**
- `IN_MARKET` - High purchase intent
- `AFFINITY` - Interest-based targeting
- `CUSTOM` - Your custom audience definitions
- `USER_LIST` - Remarketing lists, customer match

**Example:**
```typescript
{
  customerId: "2191558405",
  campaignId: "12345",
  audienceType: "IN_MARKET",
  audienceIds: ["12345", "67890"],
  confirmationToken: "abc123..."
}
```

**API Resource:** `CampaignCriterionService`
**Criterion Type:** `USER_INTEREST`

---

### 5. **set_ad_schedule**

**Purpose:** Set ad scheduling (day-parting) for campaigns

**Preset Schedules:**
- `business_hours` - Mon-Fri 9am-5pm (23.8% coverage)
- `extended_business` - Mon-Sat 8am-8pm (42.9% coverage)
- `weekends_only` - Sat-Sun all day (28.6% coverage)
- `evenings` - Mon-Sun 6pm-11pm (20.8% coverage)

**Example (Preset):**
```typescript
{
  customerId: "2191558405",
  campaignId: "12345",
  preset: "business_hours",
  confirmationToken: "abc123..."
}
```

**Example (Custom):**
```typescript
{
  customerId: "2191558405",
  campaignId: "12345",
  schedules: [
    {
      day: "MONDAY",
      startHour: 9,
      endHour: 17
    }
  ],
  confirmationToken: "abc123..."
}
```

**API Resource:** `CampaignCriterionService`
**Criterion Type:** `AD_SCHEDULE`

---

## Interactive Workflow Pattern

All tools follow this pattern:

### **Step 1: Account Discovery**
If no `customerId` provided, list accessible accounts and prompt user.

### **Step 2: Campaign Discovery**
If no `campaignId` provided, list campaigns and prompt user.

### **Step 3: Criterion Guidance**
Provide detailed guidance on available options (locations, languages, demographics, etc.)

### **Step 4: Dry-Run Preview**
If no `confirmationToken` provided:
- Show impact analysis (coverage %, criteria count)
- Display risks and warnings
- Provide recommendations
- Generate confirmation token

### **Step 5: Execute**
If `confirmationToken` provided, execute the operation and return success summary.

---

## Code Patterns

### **OAuth Token Extraction**
```typescript
const refreshToken = extractRefreshToken(input);
if (!refreshToken) {
  throw new Error('Refresh token required. OMA must provide X-Google-Refresh-Token header.');
}
```

### **Google Ads Client Creation**
```typescript
const client = createGoogleAdsClientFromRefreshToken(refreshToken, developerToken);
const customer = client.getCustomer(customerId);
```

### **Discovery Response**
```typescript
return formatDiscoveryResponse({
  step: '2/5',
  title: 'SELECT CAMPAIGN',
  items: campaigns,
  itemFormatter: (c, i) => `${i + 1}. ${c.campaign.name}`,
  prompt: 'Which campaign?',
  nextParam: 'campaignId',
  context: { customerId },
});
```

### **Dry-Run Preview**
```typescript
const builder = new DryRunBuilder('LOCATION TARGETING', 'Add geographic targeting');
builder.addChange(`Campaign ID: ${campaignId}`);
builder.addChange(`Geo Target IDs: ${geoTargetIds.join(', ')}`);
builder.addRisk('Large number of locations may fragment performance');
builder.addRecommendation('Monitor location performance separately');
const preview = builder.build('4/5');

return {
  requiresApproval: true,
  confirmationToken: builder.getConfirmationToken(),
  preview,
  content: [{ type: 'text', text: preview }]
};
```

### **Success Summary**
```typescript
const summaryText = formatSuccessSummary({
  title: 'LOCATION TARGETING ADDED',
  operation: 'Geographic targeting configuration',
  details: {
    'Campaign ID': campaignId,
    'Criteria Added': operations.length,
  },
  nextSteps: [
    'Add language targeting: use add_language_criteria',
    'View campaign performance: use get_campaign_performance',
  ],
});

return {
  success: true,
  content: [{ type: 'text', text: summaryText }],
  data: { customerId, campaignId, result },
};
```

### **Audit Logging**
```typescript
await audit.logWriteOperation('user', 'add_location_criteria', customerId, {
  campaignId,
  geoTargetIds,
  criteriaCount: operations.length,
});
```

---

## Testing

### **Local Testing**
```bash
# Start Google backend
npm run dev:google-backend

# Call tool via HTTP
curl -X POST http://localhost:3100/execute-tool \
  -H "Content-Type: application/json" \
  -H "X-Google-Refresh-Token: YOUR_TOKEN" \
  -d '{
    "name": "add_location_criteria",
    "arguments": {
      "customerId": "2191558405",
      "campaignId": "12345"
    }
  }'
```

### **Via MCP Router**
```bash
# Start router
npm run dev:router

# Use Claude Code CLI to call tools
# Tools will guide you through discovery steps
```

---

## Best Practices

### **Location Targeting**
- Start broad (countries), then narrow to cities/regions based on performance
- Use radius targeting for local businesses
- Monitor location performance reports before excluding

### **Language Targeting**
- Match language to ad creative language
- Consider separate campaigns for different languages (better control)
- English in US ≠ English in UK (different performance)

### **Demographic Targeting**
- Start broad, narrow based on demographic reports
- Review last 30 days of demographic data before restricting
- Avoid over-restricting (reduces reach)

### **Audience Targeting**
- In-market = high intent (best for conversions)
- Affinity = broad interest (best for awareness)
- User lists require minimum 1,000 users (100 for video)
- Test observation mode (bid adjustments) before strict targeting

### **Ad Scheduling**
- Review hourly performance data (last 30 days) first
- Start with bid adjustments, not strict schedules
- Consider timezone of target audience vs account timezone
- Allow 2 weeks of data before aggressive day-parting

---

## Common Errors

### **Missing Refresh Token**
```
Error: Refresh token required. OMA must provide X-Google-Refresh-Token header.
```
**Fix:** Ensure OMA platform passes refresh token in headers.

### **Campaign Not Found**
```
Error: Campaign not found or no access
```
**Fix:** Verify customerId and campaignId are correct, user has access.

### **Invalid Geo Target ID**
```
Error: Invalid geo target constant
```
**Fix:** Use valid geo target IDs from Google's geo target constants.

### **User List Too Small**
```
Error: User list must have at least 1,000 users
```
**Fix:** Wait for user list to grow, or use different audience type.

---

## Resources

**Google Ads API Documentation:**
- [CampaignCriterionService](https://developers.google.com/google-ads/api/reference/rpc/latest/CampaignCriterionService)
- [Geo Target Constants](https://developers.google.com/google-ads/api/data/geotargets)
- [Language Constants](https://developers.google.com/google-ads/api/data/codes-formats#languages)
- [Demographic Targeting](https://developers.google.com/google-ads/api/docs/targeting/demographics)
- [Audience Targeting](https://developers.google.com/google-ads/api/docs/targeting/audience-targeting)
- [Ad Scheduling](https://developers.google.com/google-ads/api/docs/targeting/ad-scheduling)

**Internal Documentation:**
- [Interactive Workflow Utilities](/src/shared/interactive-workflow.ts)
- [DryRunBuilder Utility](/src/shared/dry-run-builder.ts)
- [OAuth Client Factory](/src/shared/oauth-client-factory.ts)

---

**Last Updated:** October 31, 2025
**Maintained By:** MCP Specialist Agent (Agent 11)
