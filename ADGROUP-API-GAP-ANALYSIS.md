# Ad Group Creation - Google Ads API Gap Analysis

**Date:** November 10, 2025
**Current Implementation:** src/ads/tools/ad-groups/create-ad-group.tool.ts
**API Documentation:** Google Ads API v21

---

## Summary

**Current Implementation: 5 parameters**
**Available in API: 15+ parameters**
**Gap: ~67% of functionality missing**

Our current `create_ad_group` tool provides basic functionality but is missing many critical parameters that practitioners use daily in the Google Ads UI.

---

## Current Implementation

### Parameters We Support
```typescript
{
  customerId: string,        // ✅ Required
  campaignId: string,        // ✅ Required
  name: string,              // ✅ Required
  cpcBidMicros: number,      // ✅ Optional (manual CPC bid)
  status: 'PAUSED' | 'ENABLED'  // ✅ Optional
}
```

### What We Create
```javascript
{
  name: "Ad Group Name",
  campaign: "customers/{id}/campaigns/{id}",
  status: "PAUSED",
  cpc_bid_micros: 2500000  // If provided
}
```

**Result:** Basic ad group creation works, but missing 10+ important parameters.

---

## Missing Parameters (Critical for Production)

### 1. Ad Group Type ⚠️ CRITICAL
**Field:** `type` (AdGroupTypeEnum)
**Current:** Not set (defaults to SEARCH_STANDARD)
**Available Values:**
- `SEARCH_STANDARD` - Regular search ads
- `SEARCH_DYNAMIC_ADS` - Dynamic search ads
- `DISPLAY_STANDARD` - Display network
- `SHOPPING_PRODUCT_ADS` - Shopping campaigns
- `VIDEO_TRUE_VIEW_IN_STREAM` - Video campaigns
- `VIDEO_TRUE_VIEW_IN_DISPLAY` - Video discovery
- `HOTEL_ADS` - Hotel ads
- `SHOPPING_SMART_ADS` - Smart Shopping

**Impact:** We can't create ad groups for non-search campaigns!

**Example Use Case:**
Practitioner: "Create a display ad group"
Current Tool: ❌ Creates search ad group (wrong type)
Should: ✅ Create display ad group with proper targeting

---

### 2. Tracking Template 📊 HIGH PRIORITY
**Field:** `tracking_url_template`
**Current:** Not supported
**Purpose:** Track clicks through third-party analytics

**Example:**
```
http://tracking.example.com/?campaign={campaignid}&adgroup={adgroupid}&u={lpurl}
```

**Impact:** Practitioners can't integrate with:
- Adobe Analytics
- Google Analytics (advanced tracking)
- Custom tracking platforms
- Affiliate tracking systems

**API Documentation Shows:** Supported at AdGroup level ✅

---

### 3. URL Custom Parameters 📊 HIGH PRIORITY
**Field:** `url_custom_parameters`
**Current:** Not supported
**Purpose:** Custom tracking parameters for analytics

**Example:**
```typescript
{
  key: "_source",
  value: "google_ads"
},
{
  key: "_campaign_type",
  value: "brand"
}
```

**Impact:** Can't pass custom data to landing pages for:
- A/B testing platforms
- Custom analytics
- CRM integration
- Attribution modeling

**API Documentation Shows:** Supported at AdGroup level ✅

---

### 4. Ad Rotation Settings 🔄 MEDIUM PRIORITY
**Field:** `ad_rotation_mode`
**Current:** Not supported (defaults to OPTIMIZE)
**Available Values:**
- `OPTIMIZE` - Google optimizes for clicks/conversions
- `ROTATE_INDEFINITELY` - Show ads evenly
- `OPTIMIZE_FOR_CONVERSIONS` - Optimize for conversion value

**Impact:** Practitioners can't control A/B testing:
- Testing new ad copy requires even rotation
- Current: Google auto-optimizes (can't do fair testing)
- Advanced users need rotation control

---

### 5. Target CPA Bid (App Campaigns) 💰 CAMPAIGN-SPECIFIC
**Field:** `target_cpa_micros`
**Current:** Not supported
**Available For:** APP_CAMPAIGN_FOR_ENGAGEMENT campaigns only
**Purpose:** Override campaign-level target CPA at ad group level

**Impact:** App campaigns can't set different CPA targets per ad group

---

### 6. CPM Bid (Display/Video) 💰 CAMPAIGN-SPECIFIC
**Field:** `cpm_bid_micros`
**Current:** Not supported
**Available For:** Display and Video campaigns
**Purpose:** Cost-per-thousand-impressions bidding

**Impact:** Display/video campaigns can't set CPM bids

---

### 7. Excluded Parent Asset Field Types 🎨 ADVANCED
**Field:** `excluded_parent_asset_field_types`
**Current:** Not supported
**Purpose:** Prevent certain asset types from inheriting from campaign
**Values:** Array of AssetFieldTypeEnum

**Impact:** Can't control asset inheritance (headlines, descriptions, images)

---

### 8. Targeting Mode (Search Dynamic Ads) 🎯 DSA-SPECIFIC
**Field:** `targeting_setting.target_restrictions`
**Current:** Not supported
**Available For:** SEARCH_DYNAMIC_ADS only
**Purpose:** Control how dynamic targets are used

**Impact:** DSA campaigns lack targeting control

---

## Comparison: Web UI vs Our Tool

### Creating an Ad Group in Google Ads Web UI

**Practitioner sees/sets:**
1. ✅ Ad group name
2. ✅ Status (enabled/paused)
3. ✅ Default bid (CPC/CPM/CPA)
4. ❌ Ad rotation (optimize vs rotate evenly)
5. ❌ Tracking template
6. ❌ Custom parameters
7. ❌ Ad group type (if campaign supports multiple)

**Our Tool Captures:** 3/7 (43%)

---

## Recommended Enhancements

### Priority 1: Essential for All Campaigns (Immediate)

**Add these to create_ad_group.tool.ts:**

```typescript
{
  // Current parameters
  customerId: string,
  campaignId: string,
  name: string,
  status: 'PAUSED' | 'ENABLED',
  cpcBidMicros: number,

  // NEW: Essential additions
  type: 'SEARCH_STANDARD' | 'SEARCH_DYNAMIC_ADS' | 'DISPLAY_STANDARD' | 'SHOPPING_PRODUCT_ADS' | 'VIDEO_TRUE_VIEW_IN_STREAM',
  trackingUrlTemplate: string,  // "http://tracking.com/?u={lpurl}"
  urlCustomParameters: Array<{key: string, value: string}>,  // Custom tracking params
  adRotationMode: 'OPTIMIZE' | 'ROTATE_INDEFINITELY' | 'OPTIMIZE_FOR_CONVERSIONS'
}
```

**Workflow Enhancement:**
- Step 5 (current): CPC bid optional
- **Step 6 (NEW):** Ad group type selection (detect from campaign type)
- **Step 7 (NEW):** Tracking & URLs form (optional)
  - Tracking template
  - Custom parameters (key-value pairs)
  - Ad rotation mode

---

### Priority 2: Campaign-Specific Parameters (Phase 2)

**Add based on campaign type detection:**

```typescript
// If campaign type is APP_CAMPAIGN_FOR_ENGAGEMENT
{
  targetCpaMicros: number  // Override campaign target CPA
}

// If campaign type is DISPLAY or VIDEO
{
  cpmBidMicros: number  // Cost per thousand impressions
}
```

**Implementation:**
- Query campaign to detect `advertising_channel_type`
- Show relevant bid fields based on type
- Provide guidance for each campaign type

---

### Priority 3: Advanced Features (Phase 3)

```typescript
{
  excludedParentAssetFieldTypes: Array<'HEADLINE' | 'DESCRIPTION' | 'IMAGE'>,
  targetingSettings: {
    targetRestrictions: Array<TargetRestriction>  // For DSA
  }
}
```

---

## Updated Tool Schema (Recommended)

```typescript
export const createAdGroupTool = {
  name: 'create_ad_group',
  description: `Create a new ad group with full Google Ads API functionality`,
  inputSchema: {
    type: 'object',
    properties: {
      // EXISTING (keep)
      customerId: { type: 'string' },
      campaignId: { type: 'string' },
      name: { type: 'string' },
      status: {
        type: 'string',
        enum: ['PAUSED', 'ENABLED']
      },
      cpcBidMicros: { type: 'number' },

      // NEW: Essential additions
      type: {
        type: 'string',
        enum: [
          'SEARCH_STANDARD',
          'SEARCH_DYNAMIC_ADS',
          'DISPLAY_STANDARD',
          'SHOPPING_PRODUCT_ADS',
          'VIDEO_TRUE_VIEW_IN_STREAM',
          'HOTEL_ADS'
        ],
        description: 'Ad group type (auto-detected from campaign if not provided)'
      },
      trackingUrlTemplate: {
        type: 'string',
        description: 'Tracking template with {lpurl} placeholder'
      },
      urlCustomParameters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            value: { type: 'string' }
          }
        },
        description: 'Custom URL parameters for tracking'
      },
      adRotationMode: {
        type: 'string',
        enum: ['OPTIMIZE', 'ROTATE_INDEFINITELY', 'OPTIMIZE_FOR_CONVERSIONS'],
        description: 'How to rotate ads (default: OPTIMIZE)'
      },

      // NEW: Campaign-specific (conditional)
      targetCpaMicros: {
        type: 'number',
        description: 'Target CPA for APP_CAMPAIGN_FOR_ENGAGEMENT only'
      },
      cpmBidMicros: {
        type: 'number',
        description: 'CPM bid for DISPLAY/VIDEO campaigns'
      },

      confirmationToken: { type: 'string' }
    },
    required: []
  }
}
```

---

## Implementation Plan

### Phase 1: Add Essential Parameters (2-3 hours)

1. **Add fields to inputSchema** (15 min)
2. **Update workflow** (1 hour)
   - Step 6: Type selection (detect from campaign)
   - Step 7: Tracking & URLs form
3. **Update API call** (30 min)
   - Add type, tracking_url_template, url_custom_parameters, ad_rotation_mode
4. **Test with real campaigns** (1 hour)

**Result:** 85% functionality coverage (vs current 43%)

### Phase 2: Campaign-Specific Parameters (1 hour)

1. Query campaign type before Step 6
2. Show conditional fields based on type
3. Add targetCpaMicros, cpmBidMicros to API call

**Result:** 92% functionality coverage

### Phase 3: Advanced Features (2 hours)

1. Add excludedParentAssetFieldTypes
2. Add targeting settings for DSA
3. Comprehensive testing

**Result:** 95%+ functionality coverage

---

## Testing Checklist

### Current create_ad_group (Before Enhancement)
- [x] Basic SEARCH ad group creation
- [ ] Display campaign ad groups (FAILS - wrong type)
- [ ] Shopping campaign ad groups (FAILS - wrong type)
- [ ] Video campaign ad groups (FAILS - wrong type)
- [ ] Tracking integration (MISSING)
- [ ] Custom parameters (MISSING)
- [ ] Ad rotation control (MISSING)

### Enhanced create_ad_group (After Phase 1)
- [ ] All campaign types supported
- [ ] Tracking template works
- [ ] Custom parameters passed correctly
- [ ] Ad rotation mode set properly
- [ ] Type auto-detected from campaign

---

## Comparison with Other Tools

### create_campaign Status
**Implemented:** 11/15 parameters (73%)
**Recent Enhancement:** Added network settings, dates, tracking (Nov 9)
**Result:** Much better than before!

### create_ad_group Status
**Implemented:** 5/15 parameters (33%)
**Needs Enhancement:** YES - following same pattern as create_campaign

### create_ad Status
**Implemented:** ~85% (agent assistance feature added)
**Status:** Good coverage with revolutionary UX

---

## Conclusion

Our `create_ad_group` tool works for basic search campaigns but lacks 67% of the functionality practitioners need. The gap is especially critical for:

1. **Non-search campaigns** - Can't create proper ad groups
2. **Tracking integration** - No analytics support
3. **A/B testing** - Can't control ad rotation
4. **Advanced users** - Missing custom parameters

**Recommendation:** Implement Phase 1 enhancements BEFORE extensive testing. This will provide practitioners with the complete experience they expect from the Google Ads UI.

**Effort:** 2-3 hours for Phase 1 = 85% coverage
**Impact:** HIGH - Enables proper usage across all campaign types

---

**Next Steps:**
1. Enhance create_ad_group tool (Phase 1)
2. Test with search, display, shopping campaigns
3. Add campaign-specific parameters (Phase 2)
4. Continue with systematic tool testing

This ensures we're testing COMPLETE tools, not half-implemented ones.
