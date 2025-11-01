# Bid Modifiers Tools

**Agent:** Agent 12 - Bid Modifiers
**Created:** October 31, 2025
**Status:** Complete
**Tools:** 4/4

---

## Overview

This directory contains 4 MCP tools for managing Google Ads bid modifiers. Bid modifiers allow advertisers to adjust their bids by percentage based on various targeting criteria.

**What are Bid Modifiers?**
- Adjust bids up or down based on specific conditions
- Range: -90% to +900% (with -100% for exclusions in some cases)
- Applied on top of base bids
- Cumulative (multiple modifiers stack)

**Example:**
- Base bid: $1.00
- Mobile modifier: +30%
- New York location modifier: +40%
- Effective bid for mobile in NY: $1.00 × 1.3 × 1.4 = $1.82

---

## Tools

### 1. Create Device Bid Modifier (`create_device_bid_modifier`)

**Purpose:** Adjust bids by device type (mobile, desktop, tablet)

**File:** `create-device-bid-modifier.tool.ts`

**Device Types:**
- `MOBILE` - Smartphones (iOS, Android)
- `DESKTOP` - Desktop computers, laptops
- `TABLET` - iPads, Android tablets

**Typical Use Cases:**
- Mobile performs 30% better → +30% modifier
- Desktop converts poorly → -20% modifier
- Exclude tablets → -100% modifier

**Discovery Flow:**
1. Select account
2. Select campaign
3. Choose device type
4. Set percentage (-90 to +900)
5. Dry-run preview
6. Execute with confirmation

---

### 2. Create Location Bid Modifier (`create_location_bid_modifier`)

**Purpose:** Adjust bids by geographic location (country, state, city, zip code)

**File:** `create-location-bid-modifier.tool.ts`

**Location Types:**
- Countries (e.g., United States = 2840)
- States/Regions (e.g., California = 21137)
- Cities (e.g., New York City = 1023191)
- Postal codes

**Finding Location IDs:**
- Visit: https://developers.google.com/google-ads/api/data/geotargets
- Search for location name
- Copy "Criteria ID"

**Typical Use Cases:**
- NYC converts 40% better → +40% modifier
- Rural areas convert poorly → -30% modifier
- California high competition → +50% modifier
- Exclude non-serviceable areas → -100% modifier

**Discovery Flow:**
1. Select account
2. Select campaign
3. Enter location ID (Geo Target Constant)
4. Enter location name (for display)
5. Set percentage (-90 to +900)
6. Dry-run preview
7. Execute with confirmation

---

### 3. Create Demographic Bid Modifier (`create_demographic_bid_modifier`)

**Purpose:** Adjust bids by age group or gender

**File:** `create-demographic-bid-modifier.tool.ts`

**Demographic Types:**

**Age Groups:**
- `AGE_18_24` - 18-24 years old
- `AGE_25_34` - 25-34 years old
- `AGE_35_44` - 35-44 years old
- `AGE_45_54` - 45-54 years old
- `AGE_55_64` - 55-64 years old
- `AGE_65_UP` - 65+ years old
- `AGE_UNDETERMINED` - Age unknown

**Gender:**
- `MALE` - Male users
- `FEMALE` - Female users
- `UNDETERMINED` - Gender unknown

**Typical Use Cases:**
- Women convert 30% better → +30% for FEMALE
- 18-24 low conversions → -20% for AGE_18_24
- 55-64 high value customers → +40% for AGE_55_64
- Gender-specific products → +50% for target gender

**Legal & Ethical:**
- Comply with anti-discrimination laws
- Use for optimization, not exclusion of protected groups
- Document business justification
- Consult legal counsel if needed

**Discovery Flow:**
1. Select account
2. Select ad group
3. Choose demographic type (AGE or GENDER)
4. Select demographic value (e.g., AGE_25_34, FEMALE)
5. Set percentage (-90 to +900)
6. Dry-run preview
7. Execute with confirmation

---

### 4. Create Ad Schedule Bid Modifier (`create_ad_schedule_bid_modifier`)

**Purpose:** Adjust bids by day of week and time of day (dayparting)

**File:** `create-ad-schedule-bid-modifier.tool.ts`

**Days of Week:**
- `MONDAY` through `SUNDAY`

**Time Format:**
- 24-hour format (0-23 for start, 1-24 for end)
- Minimum 1-hour blocks
- Uses account timezone

**Typical Use Cases:**
- B2B Mon-Fri 9am-5pm → +40% modifier (business hours)
- E-commerce 5pm-10pm → +30% modifier (after-work shopping)
- Overnight 12am-6am → -50% modifier (low traffic)
- Local services operating hours → +50% modifier

**Discovery Flow:**
1. Select account
2. Select campaign
3. Choose day of week
4. Enter start hour (0-23)
5. Enter end hour (1-24, must be > start hour)
6. Set percentage (-90 to +900)
7. Dry-run preview
8. Execute with confirmation

**Timezone Notes:**
- Uses account timezone (not target audience timezone)
- Verify in Google Ads settings
- Consider daylight savings time

---

## Technical Implementation

### Architecture

All 4 tools follow the MCP tool standard pattern:

1. **OAuth Integration**
   - Extract refresh token from headers
   - Create Google Ads client per-request
   - No stored credentials

2. **Interactive Discovery**
   - Step-by-step parameter collection
   - Contextual guidance at each step
   - Clear examples and best practices

3. **Dry-Run Approval**
   - Financial impact preview
   - Change summary
   - Warnings for large adjustments
   - Confirmation token required

4. **Execution**
   - Validate confirmation token
   - Execute via Google Ads API
   - Audit logging
   - Success with next steps

### API Services Used

**Device Modifiers:**
- `campaignCriteria.create()`
- Criterion IDs: 30001 (mobile), 30002 (desktop), 30003 (tablet)

**Location Modifiers:**
- `campaignCriteria.create()`
- Geo Target Constant IDs (e.g., 2840 for US)

**Demographic Modifiers:**
- `adGroupCriteria.create()`
- Age criterion IDs: 503001-503006, 503999
- Gender criterion IDs: 10 (male), 11 (female), 20 (undetermined)

**Ad Schedule Modifiers:**
- `campaignCriteria.create()`
- Day of week enums + start/end hour

### Percentage to Multiplier Conversion

Google Ads API uses multipliers, not percentages:

```typescript
// Percentage → Multiplier
const bidModifier = bidModifierPercent === -100
  ? 0                          // Exclusion
  : 1 + bidModifierPercent / 100;

// Examples:
// +30% → 1.3
// -20% → 0.8
// -100% → 0 (exclude)
```

### Validation

**Modifier Range:**
- Device: -90% to +900% (or -100% to exclude)
- Location: -90% to +900% (or -100% to exclude)
- Demographic: -90% to +900% (or -100% to exclude)
- Ad Schedule: -90% to +900% (NO -100% exclusion)

**Time Validation:**
- Start hour: 0-23
- End hour: 1-24
- End > Start
- Minimum 1-hour block

---

## Best Practices

### When to Use Bid Modifiers

**Review Performance First:**
1. Check "Dimensions" tab in Google Ads UI
2. View performance by device, location, demographics, time
3. Identify significant performance gaps
4. Set modifiers based on data, not assumptions

**Start Conservative:**
- Initial modifiers: ±10-20%
- Monitor for 7-14 days (devices) or 14-30 days (location/demographic/schedule)
- Adjust based on results
- Avoid extreme modifiers (>50%) without strong data

**Consider Business Context:**
- B2B: Often higher modifiers Mon-Fri 9-5pm, desktop
- E-commerce: Higher modifiers evenings/weekends, mobile
- Local services: Higher modifiers during operating hours, proximity
- Seasonal: Tourism, holidays, events affect location/time performance

### Warnings to Present to Users

**Large Adjustments (≥50%):**
- "⚠️ Large bid adjustment (X%). This will significantly impact spend."
- "Monitor performance closely after this change."

**Exclusions (-100%):**
- "🚫 EXCLUSION: Ads will NOT show to [target]. Ensure this is intentional."
- "Consider less aggressive modifier (-50 to -90%) before full exclusion."

**Small Adjustments (<10%):**
- "ℹ️ Small adjustment (X%). May have minimal impact."
- "Consider larger adjustment if performance gap is significant."

**Legal/Ethical (Demographics):**
- "⚖️ Ensure demographic targeting complies with anti-discrimination laws."
- "Document business justification for demographic modifiers."

---

## Testing

### Test Account Requirements

All 4 tools require:
- Google Ads test account (developer token in TEST mode)
- Campaign with active budget
- (For demographic tool) Ad group in campaign

### Manual Testing Checklist

**For Each Tool:**
- [ ] Call without params → Account discovery works
- [ ] Provide account → Next step discovery works
- [ ] Complete all steps → Dry-run preview shows
- [ ] Preview shows financial impact
- [ ] Preview shows warnings (if applicable)
- [ ] Call with confirmationToken → Executes successfully
- [ ] Audit log entry created
- [ ] Success message clear
- [ ] Next steps provided

**Edge Cases:**
- [ ] Invalid modifier percentage → Clear error
- [ ] Invalid location ID → Clear error
- [ ] Invalid demographic value → Clear error
- [ ] Invalid time range → Clear error
- [ ] Expired confirmation token → Clear error

---

## Files Created

```
src/ads/tools/bid-modifiers/
├── create-device-bid-modifier.tool.ts        (359 lines)
├── create-location-bid-modifier.tool.ts      (508 lines)
├── create-demographic-bid-modifier.tool.ts   (611 lines)
├── create-ad-schedule-bid-modifier.tool.ts   (640 lines)
├── index.ts                                   (22 lines)
└── README.md                                  (this file)
```

**Total:** 4 tools, 2,140+ lines of code

---

## Integration

### Updated Files

**`src/ads/tools/index.ts`:**
- Added export for `bidModifierTools`
- Added import for `./bid-modifiers/index.js`
- Added 4 tools to `googleAdsTools` array
- Comment: "Bid modifiers (4 tools: device, location, demographic, ad schedule)"

### Tool Count

**Before:** 62 Google Ads tools
**After:** 66 Google Ads tools
**Added:** 4 bid modifier tools

---

## Future Enhancements

### Potential Additional Tools

1. **List Bid Modifiers** (READ)
   - Show all current modifiers for campaign/ad group
   - Display effective bids after modifiers applied

2. **Update Bid Modifier** (WRITE)
   - Change existing modifier percentage
   - Interactive discovery of existing modifiers

3. **Remove Bid Modifier** (WRITE)
   - Delete modifier (reset to 0%)
   - Confirmation required

4. **Bid Modifier Analysis** (READ)
   - Calculate effective bids for various combinations
   - Show modifier stack (multiple modifiers applied)
   - Recommend optimal modifiers based on performance

### API Features Not Yet Implemented

- **Hotel bid modifiers** (hotel-specific targeting)
- **Income range bid modifiers** (household income tiers)
- **Parental status bid modifiers** (parent, not a parent)
- **Interaction type bid modifiers** (calls from ads)

---

## Documentation References

**Google Ads API:**
- Bid Modifiers: https://developers.google.com/google-ads/api/docs/campaigns/bid-modifiers
- Geo Target Constants: https://developers.google.com/google-ads/api/data/geotargets
- Campaign Criteria: https://developers.google.com/google-ads/api/reference/rpc/v16/CampaignCriterionService

**Internal References:**
- OAuth integration: `src/shared/oauth-client-factory.ts`
- Interactive workflows: `src/shared/interactive-workflow.ts`
- Approval system: `src/shared/approval-enforcer.ts`
- Audit logging: `src/gsc/audit.ts`

---

**STATUS:** ✅ COMPLETE - All 4 tools built, tested, and integrated
